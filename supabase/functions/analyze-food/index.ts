
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Analyze-food function called')

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const requestData = await req.json()
    const { imageUrl, mealType, analysisType, detailsData } = requestData

    // Check trial limits before processing
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('subscription_status, trial_photo_analysis_count, trial_photo_analysis_limit')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      throw new Error('Failed to fetch user profile')
    }

    // Check if user has reached trial limit
    if (profile.subscription_status === 'trial') {
      if (profile.trial_photo_analysis_count >= profile.trial_photo_analysis_limit) {
        return new Response(
          JSON.stringify({
            error: 'trial_limit_reached',
            message: 'Ücretsiz fotoğraf analizi hakkınız doldu. Premium üyeliğe geçerek sınırsız analiz yapabilirsiniz.',
            detectedFoods: [],
            confidence: 0,
            suggestions: 'Premium üyeliğe geçerek sınırsız fotoğraf analizi yapabilirsiniz.'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Input validation
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('Valid image URL is required')
    }

    // Validate image URL format
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:')) {
      throw new Error('Invalid image URL format')
    }

    // Validate mealType if provided
    if (mealType && !['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType)) {
      throw new Error('Invalid meal type')
    }

    // Validate analysisType if provided
    if (analysisType && !['quick', 'detailed'].includes(analysisType)) {
      throw new Error('Invalid analysis type')
    }

    // Validate detailsData structure if provided
    if (detailsData && typeof detailsData !== 'object') {
      throw new Error('Invalid details data format')
    }

    console.log('Request data validated:', {
      imageUrlLength: imageUrl.length,
      mealType,
      analysisType,
      hasDetailsData: !!detailsData,
      imageUrlPrefix: imageUrl.substring(0, 50)
    })

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured')
      throw new Error('OpenAI API key not configured')
    }

    // Build detailed prompt based on analysis type
    let detailsPrompt = ''
    if (analysisType === 'detailed' && detailsData) {
      const cookingMethodText = detailsData.cookingMethod === 'unsure'
        ? 'Pişirme yöntemi belirsiz - fotoğraftan tahmin et'
        : detailsData.cookingMethod

      detailsPrompt = `

ÖNEMLI EK BİLGİLER:
- Yemek kaynağı: ${detailsData.foodSource === 'homemade' ? 'Ev yapımı' : 'Paketli/hazır'}
- Pişirme yöntemi: ${cookingMethodText}
- Tüketilen miktar: ${detailsData.consumedAmount}
- Yemek türü: ${detailsData.mealType === 'single' ? 'Tek tip yemek' : 'Karışık tabak'}
${detailsData.hiddenIngredients ? `- Gizli malzemeler/ekstralar: ${detailsData.hiddenIngredients}` : ''}

Bu bilgileri kullanarak daha doğru besin değeri hesaplama yap. Pişirme yöntemi belirsizse fotoğraftan tahmin et.`
    }

    console.log('Making request to OpenAI API...')

    let useModel = 'gpt-4o-mini'
    let needsUpgrade = false

    if (analysisType === 'quick') {
      console.log('Stage 1: Using gpt-4o-mini for quick analysis')
    } else {
      console.log('Using gpt-4o-mini for detailed analysis (user requested)')
      useModel = 'gpt-4o-mini'
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: useModel,
        messages: [
          {
            role: 'system',
            content: `Sen Türk mutfağı ve beslenme konusunda uzman bir yapay zeka asistanısın. Yemek fotoğraflarını analiz ederek doğru besin değerlerini hesaplıyorsun. Türkçe yemek adlarını tercih et ve gerçekçi porsiyon tahminleri yap.

ÖNEMLI: Tüm besin değerlerini eksiksiz hesapla:
- Kalori (kcal)
- Protein (g)
- Karbonhidrat (g)
- Yağ (g)
- Lif (g)
- Şeker (g)
- Sodyum (mg)

Pişirme yöntemi belirsizse fotoğraftan tahmin et ve açıkla.

FOTOĞRAF KALİTESİ DEĞERLENDİRMESİ:
Fotoğraf kalitesini değerlendir ve gerekirse analysisErrors alanına şu hata mesajlarından uygun olanları ekle:
- "Fotoğraf çok karanlık - daha iyi ışıkta tekrar çekin"
- "Fotoğraf bulanık - daha net bir fotoğraf çekin"
- "Fotoğrafta yemek görünmüyor - yemeği net gösterecek şekilde çekin"
- "Tabak veya kap net görünmüyor - tüm yemeği gösteren açı seçin"
- "Yemekler net olarak tanımlanamıyor - daha yakından çekin"
- "Porsiyon miktarı belirlenemiyor - standart tabak/kap kullanın"
- "Paketli ürün net görünmüyor - barkod okuyucu kullanın"
- "Renk algısı yetersiz - doğal ışıkta çekin"`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Bu yemek fotoğrafını analiz et ve besin değerlerini hesapla. Mümkün olduğunca Türkçe yemek adları kullan ve gerçekçi porsiyon tahminleri yap.

İÇECEKLER İÇİN ÖZEL TALİMATLAR:
- İçecekler için kap boyutuna dikkat et (çay bardağı ~100ml, su bardağı ~200-250ml)
- Şişe boyutları: 330ml (küçük), 500ml (orta), 1L (büyük)
- Kutular: genellikle 330ml
- Şekerli vs şekersiz içecekleri ayırt et (özellikle çay/kahve)
- Alkollü içecekler için bira (~330-500ml), şarap (~150ml), rakı vb. belirt
- Sıvı hacmine odaklan, ağırlık değil (1ml ≈ 1g çoğu içecek için)
- İçecek kalorilerinin gerçekçi olmasına dikkat et (su=0, diyet içecek≈0-5, normal gazlı içecek≈40-50 per 100ml)

${detailsPrompt}

Sadece geçerli bir JSON objesi döndür, başka hiçbir metin ekleme:

{
  "detectedFoods": [
    {
      "name": "Yemek adı (Türkçe)",
      "nameEn": "Food name (English)",
              "estimatedAmount": "Miktar ve birim (örn: 1 porsiyon, 100g, 1 adet, 250ml, 1 bardak)",
              "portionType": "gram|ml|cl|bardak|şişe|kutu|adet|porsiyon|kaşık",
              "nutritionPer100g": {
        "calories": sayı,
        "protein": sayı,
        "carbs": sayı,
        "fat": sayı,
        "fiber": sayı,
        "sugar": sayı,
        "sodium": sayı
      },
      "totalNutrition": {
        "calories": sayı,
        "protein": sayı,
        "carbs": sayı,
        "fat": sayı,
        "fiber": sayı,
        "sugar": sayı,
        "sodium": sayı
      }
    }
  ],
  "mealType": "${mealType || 'öğün'}",
  "confidence": 0_ile_1_arası_sayı,
  "suggestions": "Türkçe kısa öneriler (maksimum 2 cümle)",
  "analysisErrors": ["fotoğraf kalitesi sorunları varsa buraya ekle"]
}

ÖNEMLI KURALLAR:
- Çoğu yiyecek için besin değerleri gerçekçi ve 0'dan büyük olmalı. Ancak su, sade kahve, şekersiz çay, soda, maden suyu, mineral su, diyet/zero içecekler gibi ürünlerde kalori, protein, karbonhidrat, yağ, lif ve şeker değerleri 0 olabilir.
- Lif, şeker gram cinsinden, sodyum miligram cinsinden
- Porsiyon tahminlerinde gerçekçi ol
- Eğer hiçbir yemeği net tanıyamıyorsan boş detectedFoods array'i döndür
- Confidence değeri 0.1-1.0 arasında olmalı
- Sodyum değeri özellikle dikkatli hesapla (tuz, işlenmiş gıdalar)
- Şeker değeri doğal ve eklenmiş şekeri içermeli
- Sadece JSON döndür, başka açıklama yapma`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.2,
      }),
    })

    console.log('OpenAI API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', response.status, errorText)
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('OpenAI response received:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length
    })

    const content = data.choices[0]?.message?.content
    if (!content) {
      console.error('No content received from OpenAI')
      throw new Error('No content received from OpenAI')
    }

    console.log('Raw content from OpenAI:', content.substring(0, 200) + '...')

    // Clean the response to extract JSON
    let jsonStr = content.trim()
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/, '').replace(/\n?```$/, '')
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/, '').replace(/\n?```$/, '')
    }

    let analysisResult
    try {
      analysisResult = JSON.parse(jsonStr)
      console.log('Successfully parsed JSON result:', {
        detectedFoodsCount: analysisResult.detectedFoods?.length || 0,
        confidence: analysisResult.confidence
      })
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Raw content that failed to parse:', content)
      throw new Error('Invalid JSON response from AI')
    }

    // Validate and fix the response structure
    if (!analysisResult.detectedFoods || !Array.isArray(analysisResult.detectedFoods)) {
      console.error('Invalid response structure: missing detectedFoods array')
      analysisResult.detectedFoods = []
    }

    // Set default confidence if missing
    if (typeof analysisResult.confidence !== 'number') {
      analysisResult.confidence = 0.7
    }

    // Ensure confidence is between 0 and 1
    if (analysisResult.confidence > 1) {
      analysisResult.confidence = analysisResult.confidence / 100
    }

    if (analysisType === 'quick' && analysisResult.confidence < 0.6) {
      console.log('Stage 1 confidence too low, considering upgrade to gpt-4o')
      needsUpgrade = true
    }

    if (needsUpgrade && analysisType === 'quick') {
      console.log('Stage 2: Upgrading to gpt-4o for better accuracy')

      const upgradeResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `Sen Türk mutfağı ve beslenme konusunda uzman bir yapay zeka asistanısın. Yemek fotoğraflarını analiz ederek doğru besin değerlerini hesaplıyorsun. Türkçe yemek adlarını tercih et ve gerçekçi porsiyon tahminleri yap.

ÖNEMLI: Tüm besin değerlerini eksiksiz hesapla:
- Kalori (kcal)
- Protein (g)
- Karbonhidrat (g)
- Yağ (g)
- Lif (g)
- Şeker (g)
- Sodyum (mg)

Pişirme yöntemi belirsizse fotoğraftan tahmin et ve açıkla.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Bu yemek fotoğrafını daha detaylı analiz et. İlk analiz belirsiz sonuçlar verdi, daha yüksek doğrulukta tespit yap.

${detailsPrompt}

Sadece geçerli bir JSON objesi döndür, başka hiçbir metin ekleme.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 1500,
          temperature: 0.2,
        }),
      })

      if (upgradeResponse.ok) {
        const upgradeData = await upgradeResponse.json()
        const upgradeContent = upgradeData.choices[0]?.message?.content

        if (upgradeContent) {
          let upgradeJsonStr = upgradeContent.trim()
          if (upgradeJsonStr.startsWith('```json')) {
            upgradeJsonStr = upgradeJsonStr.replace(/```json\n?/, '').replace(/\n?```$/, '')
          }
          if (upgradeJsonStr.startsWith('```')) {
            upgradeJsonStr = upgradeJsonStr.replace(/```\n?/, '').replace(/\n?```$/, '')
          }

          try {
            const upgradeResult = JSON.parse(upgradeJsonStr)
            if (upgradeResult.detectedFoods && upgradeResult.detectedFoods.length > 0) {
              console.log('Stage 2 successful, using upgraded results')
              analysisResult = upgradeResult
            }
          } catch (e) {
            console.log('Stage 2 parse error, keeping stage 1 results')
          }
        }
      }
    }

    // Validate and fix nutrition data for each food
    analysisResult.detectedFoods.forEach((food: any, index: number) => {
      if (!food.name) {
        food.name = `Yemek ${index + 1}`
      }
      if (!food.nameEn) {
        food.nameEn = food.name
      }
      if (!food.estimatedAmount) {
        food.estimatedAmount = '1 porsiyon'
      }

      // Ensure nutrition objects exist
      if (!food.nutritionPer100g) {
        food.nutritionPer100g = {}
      }
      if (!food.totalNutrition) {
        food.totalNutrition = {}
      }

      // Ensure all required nutrition fields are present with valid numbers
      const requiredFields = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium']
      requiredFields.forEach(field => {
        if (typeof food.nutritionPer100g[field] !== 'number' || food.nutritionPer100g[field] < 0) {
          food.nutritionPer100g[field] = 0
        }
        if (typeof food.totalNutrition[field] !== 'number' || food.totalNutrition[field] < 0) {
          food.totalNutrition[field] = 0
        }
      })

      const lowerName = (food.name || '').toLowerCase();

      const isZeroCalDrink =
        lowerName.includes('su') ||
        lowerName.includes('water') ||
        lowerName.includes('sade kahve') ||
        lowerName.includes('black coffee') ||
        lowerName.includes('americano') ||
        lowerName.includes('filtre kahve') ||
        lowerName.includes('çay') ||
        lowerName.includes('tea') ||
        lowerName.includes('soda') ||
        lowerName.includes('maden suyu') ||
        lowerName.includes('mineral water') ||
        lowerName.includes('diyet') ||
        lowerName.includes('zero');

      if (isZeroCalDrink) {
        ['calories','protein','carbs','fat','fiber','sugar','sodium'].forEach(field => {
          food.nutritionPer100g[field] = 0;
          food.totalNutrition[field] = 0;
        });
      }
    })

    // Drink + Sweetener merging logic
    try {
      if (analysisResult.detectedFoods && Array.isArray(analysisResult.detectedFoods)) {
        const drinkKeywords = ['çay', 'tea', 'kahve', 'coffee', 'americano', 'latte', 'espresso', 'cappuccino'];
        const sweetenerKeywords = ['küp şeker', 'küp seker', 'şeker', 'seker', 'sugar', 'bal', 'honey', 'şurup', 'syrup'];

        const drinkIndexes: number[] = [];
        const sweetenerIndexes: number[] = [];

        analysisResult.detectedFoods.forEach((food: any, idx: number) => {
          const lowerName = (food.name || '').toLowerCase();

          const isDrink = drinkKeywords.some((kw) => lowerName.includes(kw));
          const isSweetener = sweetenerKeywords.some((kw) => lowerName.includes(kw));

          if (isDrink) {
            drinkIndexes.push(idx);
          }
          if (isSweetener) {
            sweetenerIndexes.push(idx);
          }
        });

        // Şu an için sadece tek içecek + en az bir tatlandırıcı durumunu birleştir
        if (drinkIndexes.length === 1 && sweetenerIndexes.length > 0) {
          const drinkIndex = drinkIndexes[0];
          const drink = analysisResult.detectedFoods[drinkIndex];

          const requiredFields = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium'];

          // Tatlandırıcıların besin değerlerini içeceğe ekle
          sweetenerIndexes.forEach((sweetIdx) => {
            const sweet = analysisResult.detectedFoods[sweetIdx];
            requiredFields.forEach((field) => {
              const drinkVal = drink.totalNutrition?.[field] || 0;
              const sweetVal = sweet?.totalNutrition?.[field] || 0;
              if (!drink.totalNutrition) {
                drink.totalNutrition = {};
              }
              drink.totalNutrition[field] = drinkVal + sweetVal;
            });
          });

          // İçeceğin adını güncelle (Şekerli çay, Şekerli kahve vb.)
          const drinkNameLower = (drink.name || '').toLowerCase();
          if (drinkNameLower.includes('çay') || drinkNameLower.includes('tea')) {
            drink.name = 'Şekerli çay';
          } else if (
            drinkNameLower.includes('kahve') ||
            drinkNameLower.includes('coffee') ||
            drinkNameLower.includes('americano') ||
            drinkNameLower.includes('latte') ||
            drinkNameLower.includes('espresso')
          ) {
            drink.name = 'Şekerli kahve';
          } else {
            drink.name = `${drink.name || 'İçecek'} (şekerli)`;
          }

          // Miktar bilgisini güncelle (örn: "1 bardak + 2 adet şeker")
          const sweetenerCount = sweetenerIndexes.length;
          if (sweetenerCount > 0) {
            const sweetenerText = `${sweetenerCount} adet şeker/tatlandırıcı`;
            if (drink.estimatedAmount && typeof drink.estimatedAmount === 'string') {
              drink.estimatedAmount = `${drink.estimatedAmount} + ${sweetenerText}`;
            } else {
              drink.estimatedAmount = sweetenerText;
            }
          }

          // Tatlandırıcıları listeden çıkar (sadece içecek kartı kalsın)
          analysisResult.detectedFoods = analysisResult.detectedFoods.filter((_: any, idx: number) => !sweetenerIndexes.includes(idx));
        }
      }
    } catch (mergeError) {
      console.log('Drink-sweetener merge skipped due to error:', mergeError);
    }

    // Set default suggestions if missing
    if (!analysisResult.suggestions) {
      analysisResult.suggestions = 'Yemek analizi tamamlandı. Besin değerlerini kontrol ediniz.'
    }

    console.log('Analysis result validated successfully:', {
      detectedFoodsCount: analysisResult.detectedFoods.length,
      confidence: analysisResult.confidence,
      totalCalories: analysisResult.detectedFoods.reduce((sum: number, food: any) => sum + (food.totalNutrition?.calories || 0), 0)
    })

    // Increment photo analysis count for trial users
    if (profile.subscription_status === 'trial') {
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({
          trial_photo_analysis_count: profile.trial_photo_analysis_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Failed to update trial count:', updateError)
      } else {
        console.log('Trial photo analysis count incremented:', profile.trial_photo_analysis_count + 1)
      }
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in analyze-food function:', error)

    // Sanitize error message to avoid exposing sensitive information
    const sanitizedError = error instanceof Error ?
      (error.message.includes('API') ? 'Service temporarily unavailable' : 'Analysis failed') :
      'Unexpected error occurred'

    // Return a structured error response that the frontend can handle
    const errorResponse = {
      error: sanitizedError,
      detectedFoods: [],
      confidence: 0,
      suggestions: "Görüntü analizi sırasında hata oluştu. Lütfen manuel olarak yemek bilgilerini girin veya tekrar deneyin."
    }

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 200, // Return 200 so frontend can handle the error gracefully
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
