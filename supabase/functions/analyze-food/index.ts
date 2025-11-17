
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Foods table schema:
// id, name_tr, name_en, category, default_portion_grams
// calories_100g, protein_100g, carbs_100g, fat_100g, fiber_100g, sugar_100g, sodium_100g

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

Bu bilgileri kullanarak daha doğru sınıflandırma ve porsiyon tahmini yap.`
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
            content: `Sen Türk mutfağı konusunda uzman bir yapay zeka asistanısın. Yemek fotoğraflarını analiz ederek yiyecekleri/içecekleri tespit ediyorsun. Türkçe yemek adlarını tercih et ve gerçekçi porsiyon tahminleri yap.

GÖREVIN: Sadece yemek/içecekleri TANIMLA ve sınıflandır. Besin değerlerini hesaplama, bunlar ayrı bir veri tabanından gelecek.

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
                text: `Bu yemek fotoğrafını analiz et ve içindeki yiyecek/içecekleri tespit et. Mümkün olduğunca Türkçe yemek adları kullan ve gerçekçi porsiyon tahminleri yap.

İÇECEKLER İÇİN ÖZEL TALİMATLAR:
- İçecekler için kap boyutuna dikkat et (çay bardağı ~100ml, su bardağı ~200-250ml, kupa ~250-300ml)
- Şişe boyutları: 330ml (küçük), 500ml (orta), 1L (büyük)
- Kutular: genellikle 330ml
- Sıvı hacmine odaklan, ağırlık değil (1ml ≈ 1g çoğu içecek için)
- İçeceklerde eklenmiş malzemeleri (şeker, süt, bal, limon, krema) mutlaka tespit et ve modifiers olarak ekle

MODİFİER TESPİTİ ÖNEMLİ:
- Eğer çay/kahve yanında şeker küpleri görüyorsan, bunları modifiers array'ine ekle
- Süt/krema eklenmiş içecekleri tespit et
- Ballı süt, limonlu çay gibi kombinasyonları yakala
- Her modifier için tahmin edilen miktarı belirt (örn: "2 adet" şeker, "50ml" süt)

${detailsPrompt}

Sadece geçerli bir JSON objesi döndür, başka hiçbir metin ekleme:

{
  "detectedItems": [
    {
      "name": "Yemek/içecek adı (Türkçe)",
      "nameEn": "Food/drink name (English)",
      "estimatedAmount": "Miktar ve birim (örn: 1 porsiyon, 150g, 250ml, 1 bardak, 2 adet)",
      "portionType": "gram|ml|cl|bardak|kupa|şişe|kutu|adet|porsiyon|kaşık",
      "category": "drink|food|soup|dessert|snack|other",
      "isDrink": true_veya_false,
      "modifiers": [
        {
          "type": "sugar|honey|milk|cream|lemon|syrup|other",
          "name": "Modifier adı (Türkçe, örn: Küp şeker, Bal, Süt)",
          "nameEn": "Modifier name (English)",
          "estimatedAmount": "Miktar (örn: 2 adet, 50ml, 1 kaşık)",
          "portionType": "adet|ml|gram|kaşık"
        }
      ]
    }
  ],
  "mealType": "${mealType || 'öğün'}",
  "confidence": 0_ile_1_arası_sayı,
  "suggestions": "Türkçe kısa öneriler (maksimum 2 cümle)",
  "analysisErrors": ["fotoğraf kalitesi sorunları varsa buraya ekle"]
}

ÖNEMLI KURALLAR:
- Her öğe için name, nameEn, estimatedAmount, portionType, category, isDrink alanlarını doldur
- İçeceklerde modifiers array'ini mutlaka kontrol et ve varsa ekle
- Porsiyon tahminlerinde gerçekçi ol
- Eğer hiçbir yemeği net tanıyamıyorsan boş detectedItems array'i döndür
- Confidence değeri 0.1-1.0 arasında olmalı
- Sadece JSON döndür, başka açıklama yapma
- BESİN DEĞERLERİ HESAPLAMA, sadece tanımla ve sınıflandır`
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

    let aiResult
    try {
      aiResult = JSON.parse(jsonStr)
      console.log('Successfully parsed JSON result:', {
        detectedItemsCount: aiResult.detectedItems?.length || 0,
        confidence: aiResult.confidence
      })
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Raw content that failed to parse:', content)
      throw new Error('Invalid JSON response from AI')
    }

    // Validate and fix the response structure
    if (!aiResult.detectedItems || !Array.isArray(aiResult.detectedItems)) {
      console.error('Invalid response structure: missing detectedItems array')
      aiResult.detectedItems = []
    }

    // Set default confidence if missing
    if (typeof aiResult.confidence !== 'number') {
      aiResult.confidence = 0.7
    }

    // Ensure confidence is between 0 and 1
    if (aiResult.confidence > 1) {
      aiResult.confidence = aiResult.confidence / 100
    }

    if (analysisType === 'quick' && aiResult.confidence < 0.6) {
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
              content: `Sen Türk mutfağı konusunda uzman bir yapay zeka asistanısın. Yemek fotoğraflarını analiz ederek yiyecekleri/içecekleri tespit ediyorsun. Türkçe yemek adlarını tercih et ve gerçekçi porsiyon tahminleri yap.

GÖREVIN: Sadece yemek/içecekleri TANIMLA ve sınıflandır. Besin değerlerini hesaplama, bunlar ayrı bir veri tabanından gelecek.`
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
            if (upgradeResult.detectedItems && upgradeResult.detectedItems.length > 0) {
              console.log('Stage 2 successful, using upgraded results')
              aiResult = upgradeResult
            }
          } catch (e) {
            console.log('Stage 2 parse error, keeping stage 1 results')
          }
        }
      }
    }

    // Helper function to estimate grams from portion info
    const estimateGrams = (item: any, defaultGrams: number = 100): number => {
      const amount = item.estimatedAmount || ''
      const portionType = item.portionType || ''

      // Extract numeric value from amount string
      const numMatch = amount.match(/(\d+(?:\.\d+)?)/);
      const numValue = numMatch ? parseFloat(numMatch[1]) : 1;

      if (portionType === 'gram') {
        return numValue;
      } else if (portionType === 'ml' || portionType === 'cl') {
        // For drinks: 1ml ≈ 1g
        return portionType === 'cl' ? numValue * 10 : numValue;
      } else if (portionType === 'bardak' || portionType === 'kupa') {
        // Standard glass/cup for drinks
        return numValue * 200;
      } else if (portionType === 'şişe') {
        // Assume 500ml bottle
        return numValue * 500;
      } else if (portionType === 'kutu') {
        // Assume 330ml can
        return numValue * 330;
      } else if (portionType === 'kaşık') {
        // Tablespoon ~10g
        return numValue * 10;
      } else if (portionType === 'adet' || portionType === 'porsiyon') {
        // Use default portion grams
        return numValue * defaultGrams;
      }

      // Fallback to default
      return defaultGrams;
    };

    // Helper function to lookup food in database
    const lookupFood = async (name: string, nameEn: string) => {
      // First try Turkish name
      let { data: foodData, error } = await supabaseClient
        .from('foods')
        .select('*')
        .ilike('name_tr', `%${name}%`)
        .limit(1)
        .maybeSingle();

      if (!foodData && nameEn) {
        // Try English name
        const result = await supabaseClient
          .from('foods')
          .select('*')
          .ilike('name_en', `%${nameEn}%`)
          .limit(1)
          .maybeSingle();

        foodData = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Food lookup error:', error);
      }

      return foodData;
    };

    // Process detected items and fetch nutrition from database
    const detectedFoods: any[] = [];

    for (const item of aiResult.detectedItems) {
      console.log('Processing item:', item.name);

      const foodData = await lookupFood(item.name, item.nameEn);

      if (!foodData) {
        console.log('Food not found in DB:', item.name);
        // Create item with zero nutrition
        detectedFoods.push({
          name: item.name,
          nameEn: item.nameEn || item.name,
          estimatedAmount: item.estimatedAmount || '1 porsiyon',
          portionType: item.portionType || 'porsiyon',
          nutritionPer100g: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0
          },
          totalNutrition: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0
          }
        });
        continue;
      }

      // Calculate total grams
      const totalGrams = estimateGrams(item, foodData.default_portion_grams || 100);

      // Build nutrition from database
      const nutritionPer100g = {
        calories: foodData.calories_100g || 0,
        protein: foodData.protein_100g || 0,
        carbs: foodData.carbs_100g || 0,
        fat: foodData.fat_100g || 0,
        fiber: foodData.fiber_100g || 0,
        sugar: foodData.sugar_100g || 0,
        sodium: foodData.sodium_100g || 0
      };

      // Calculate total nutrition
      const totalNutrition = {
        calories: Math.round((nutritionPer100g.calories * totalGrams) / 100),
        protein: Math.round((nutritionPer100g.protein * totalGrams) / 100 * 10) / 10,
        carbs: Math.round((nutritionPer100g.carbs * totalGrams) / 100 * 10) / 10,
        fat: Math.round((nutritionPer100g.fat * totalGrams) / 100 * 10) / 10,
        fiber: Math.round((nutritionPer100g.fiber * totalGrams) / 100 * 10) / 10,
        sugar: Math.round((nutritionPer100g.sugar * totalGrams) / 100 * 10) / 10,
        sodium: Math.round((nutritionPer100g.sodium * totalGrams) / 100)
      };

      const foodItem = {
        name: item.name,
        nameEn: item.nameEn || item.name,
        estimatedAmount: item.estimatedAmount || '1 porsiyon',
        portionType: item.portionType || 'porsiyon',
        nutritionPer100g,
        totalNutrition
      };

      // Process modifiers for drinks
      if (item.isDrink && item.modifiers && Array.isArray(item.modifiers)) {
        let modifierDescriptions: string[] = [];

        for (const modifier of item.modifiers) {
          const modifierFood = await lookupFood(modifier.name, modifier.nameEn);

          if (modifierFood) {
            const modifierGrams = estimateGrams(modifier, modifierFood.default_portion_grams || 10);

            // Add modifier nutrition to drink
            const modifierCalories = Math.round((modifierFood.calories_100g * modifierGrams) / 100);
            const modifierProtein = Math.round((modifierFood.protein_100g * modifierGrams) / 100 * 10) / 10;
            const modifierCarbs = Math.round((modifierFood.carbs_100g * modifierGrams) / 100 * 10) / 10;
            const modifierFat = Math.round((modifierFood.fat_100g * modifierGrams) / 100 * 10) / 10;
            const modifierFiber = Math.round((modifierFood.fiber_100g * modifierGrams) / 100 * 10) / 10;
            const modifierSugar = Math.round((modifierFood.sugar_100g * modifierGrams) / 100 * 10) / 10;
            const modifierSodium = Math.round((modifierFood.sodium_100g * modifierGrams) / 100);

            foodItem.totalNutrition.calories += modifierCalories;
            foodItem.totalNutrition.protein += modifierProtein;
            foodItem.totalNutrition.carbs += modifierCarbs;
            foodItem.totalNutrition.fat += modifierFat;
            foodItem.totalNutrition.fiber += modifierFiber;
            foodItem.totalNutrition.sugar += modifierSugar;
            foodItem.totalNutrition.sodium += modifierSodium;

            // Track modifier for name update
            if (modifier.type === 'sugar') {
              modifierDescriptions.push('şekerli');
            } else if (modifier.type === 'honey') {
              modifierDescriptions.push('ballı');
            } else if (modifier.type === 'milk') {
              modifierDescriptions.push('sütlü');
            } else if (modifier.type === 'cream') {
              modifierDescriptions.push('kremalı');
            } else if (modifier.type === 'lemon') {
              modifierDescriptions.push('limonlu');
            } else if (modifier.type === 'syrup') {
              modifierDescriptions.push('şuruplu');
            }
          }
        }

        // Update drink name with modifiers
        if (modifierDescriptions.length > 0) {
          const lowerName = foodItem.name.toLowerCase();
          if (lowerName.includes('çay') || lowerName.includes('tea')) {
            foodItem.name = modifierDescriptions.length === 1
              ? `${modifierDescriptions[0].charAt(0).toUpperCase() + modifierDescriptions[0].slice(1)} çay`
              : `${modifierDescriptions.join(' ve ')} çay`;
          } else if (lowerName.includes('kahve') || lowerName.includes('coffee')) {
            foodItem.name = modifierDescriptions.length === 1
              ? `${modifierDescriptions[0].charAt(0).toUpperCase() + modifierDescriptions[0].slice(1)} kahve`
              : `${modifierDescriptions.join(' ve ')} kahve`;
          } else if (lowerName.includes('süt') || lowerName.includes('milk')) {
            foodItem.name = `${modifierDescriptions.join(' ve ')} süt`;
          } else {
            foodItem.name = `${foodItem.name} (${modifierDescriptions.join(', ')})`;
          }

          // Update amount description
          if (item.modifiers.length > 0) {
            const modifierText = item.modifiers.map((m: any) => m.estimatedAmount).join(', ');
            foodItem.estimatedAmount = `${foodItem.estimatedAmount} + ${modifierText}`;
          }
        }
      }

      detectedFoods.push(foodItem);
    }

    // Handle zero-calorie drinks
    detectedFoods.forEach((food: any) => {
      const lowerName = (food.name || '').toLowerCase();

      const isZeroCalDrink =
        lowerName.includes('su') ||
        lowerName.includes('water') ||
        lowerName.includes('sade kahve') ||
        lowerName.includes('black coffee') ||
        lowerName.includes('sade çay') ||
        lowerName.includes('plain tea') ||
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
    });

    // Build final response in the format frontend expects
    const analysisResult = {
      detectedFoods,
      mealType: aiResult.mealType || mealType || 'öğün',
      confidence: aiResult.confidence,
      suggestions: aiResult.suggestions || 'Yemek analizi tamamlandı. Besin değerlerini kontrol ediniz.',
      analysisErrors: aiResult.analysisErrors || []
    };

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
