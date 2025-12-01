import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey'
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    console.log('Analyze-food function called');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const requestData = await req.json();
    const { imageUrl, mealType, analysisType, detailsData } = requestData;

    // Check trial limits before processing
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('subscription_status, trial_photo_analysis_count, trial_photo_analysis_limit')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    // Check if user has reached trial limit
    if (profile.subscription_status === 'trial') {
      if (profile.trial_photo_analysis_count >= profile.trial_photo_analysis_limit) {
        return new Response(JSON.stringify({
          error: 'trial_limit_reached',
          message: 'Ücretsiz fotoğraf analizi hakkınız doldu. Premium üyeliğe geçerek sınırsız analiz yapabilirsiniz.',
          detectedFoods: [],
          confidence: 0,
          suggestions: 'Premium üyeliğe geçerek sınırsız fotoğraf analizi yapabilirsiniz.'
        }), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }

    // Input validation
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('Valid image URL is required');
    }

    // Validate image URL format
    if (
      !imageUrl.startsWith('http://') &&
      !imageUrl.startsWith('https://') &&
      !imageUrl.startsWith('data:')
    ) {
      throw new Error('Invalid image URL format');
    }

    // Validate mealType (TR + EN)
    const allowedMealTypes = [
      'breakfast',
      'lunch',
      'dinner',
      'snack',
      'drink',
      'kahvaltı',
      'öğle',
      'akşam',
      'atıştırmalık',
      'içecek'
    ];
    if (mealType && !allowedMealTypes.includes(mealType)) {
      throw new Error('Invalid meal type');
    }

    // Validate analysisType if provided
    if (analysisType && !['quick', 'detailed'].includes(analysisType)) {
      throw new Error('Invalid analysis type');
    }

    // Validate detailsData structure if provided
    if (detailsData && typeof detailsData !== 'object') {
      throw new Error('Invalid details data format');
    }

    console.log('Request data validated:', {
      imageUrlLength: imageUrl.length,
      mealType,
      analysisType,
      hasDetailsData: !!detailsData,
      imageUrlPrefix: imageUrl.substring(0, 50)
    });

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    // Build detailed prompt based on analysis type
    let detailsPrompt = '';
    if (analysisType === 'detailed' && detailsData) {
      const cookingMethodText =
        detailsData.cookingMethod === 'unsure'
          ? 'Pişirme yöntemi belirsiz - fotoğraftan tahmin et'
          : detailsData.cookingMethod;

      detailsPrompt = `

ÖNEMLİ EK BİLGİLER:
- Yemek kaynağı: ${detailsData.foodSource === 'homemade' ? 'Ev yapımı' : 'Paketli/hazır'}
- Pişirme yöntemi: ${cookingMethodText}
- Tüketilen miktar: ${detailsData.consumedAmount}
- Yemek türü: ${detailsData.mealType === 'single' ? 'Tek tip yemek' : 'Karışık tabak'}
${detailsData.hiddenIngredients ? `- Gizli malzemeler/ekstralar: ${detailsData.hiddenIngredients}` : ''}

Bu bilgileri kullanarak daha doğru besin değeri hesaplama yap. Pişirme yöntemi belirsizse fotoğraftan tahmin et.`;
    }

    console.log('Making request to OpenAI API...');

    // --- 1. AŞAMA: gpt-4o ---
    let model = 'gpt-4o';

    const baseSystemPrompt = `Sen Türk mutfağı ve beslenme konusunda uzman bir yapay zeka asistanısın.
Yemek fotoğraflarını analiz ederek doğru besin değerlerini hesaplıyorsun.
Türkçe yemek adlarını tercih et ve gerçekçi porsiyon tahminleri yap.

Hesaplaman gereken besin değerleri:
- Kalori (kcal)
- Protein (g)
- Karbonhidrat (g)
- Yağ (g)
- Lif (g)
- Şeker (g)
- Sodyum (mg)

Bazı içecek ve ürünler için (su, sade kahve, şekersiz çay, soda, maden suyu, diyet/zero içecekler vb.)
kalori ve makro değerleri gerçekten 0 olabilir. Bu durumda değerleri 0 bırak.
Diğer yiyecek ve içecekler için besin değerleri gerçekçi aralıklarda olmalı.

FOTOĞRAF KALİTESİ DEĞERLENDİRMESİ:
Gerekirse analysisErrors alanına şu mesajlardan uygun olanları ekle:
- "Fotoğraf çok karanlık - daha iyi ışıkta tekrar çekin"
- "Fotoğraf bulanık - daha net bir fotoğraf çekin"
- "Fotoğrafta yemek görünmüyor - yemeği net gösterecek şekilde çekin"
- "Tabak veya kap net görünmüyor - tüm yemeği gösteren açı seçin"
- "Yemekler net olarak tanımlanamıyor - daha yakından çekin"
- "Porsiyon miktarı belirlenemiyor - standart tabak/kap kullanın"
- "Paketli ürün net görünmüyor - barkod okuyucu kullanın"
- "Renk algısı yetersiz - doğal ışıkta çekin"`;

    const baseUserPrompt = `Bu yemek fotoğrafını analiz et ve besin değerlerini hesapla.
Mümkün olduğunca Türkçe yemek adları kullan ve gerçekçi porsiyon tahminleri yap.

İÇECEKLER İÇİN ÖZEL TALİMATLAR:
- İçecekler için kap boyutuna dikkat et (çay bardağı ~100ml, su bardağı ~200-250ml)
- Şişe boyutları: 330ml (küçük), 500ml (orta), 1L (büyük)
- Kutular: genellikle 330ml
- Şekerli vs şekersiz içecekleri ayırt et (özellikle çay/kahve)
- Alkollü içecekler için bira (~330-500ml), şarap (~150ml), rakı vb. belirt
- Sıvı hacmine odaklan, ağırlık değil (1ml ≈ 1g çoğu içecek için)
- Su ve gerçekten kalorisiz içecekler için kalori 0 olabilir.

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

ÖNEMLİ KURALLAR:
- Besin değerleri gerçekçi olmalı.
- Su, sade kahve, şekersiz çay, soda, maden suyu, diyet/zero içecekler için kalori ve makrolar 0 olabilir.
- Lif ve şeker gram cinsinden, sodyum miligram cinsinden olmalı.
- Porsiyon tahminlerinde gerçekçi ol.
- Eğer hiçbir yemeği net tanıyamıyorsan boş detectedFoods array'i döndür.
- Confidence değeri 0.1-1.0 arasında olmalı.
- Sadece JSON döndür, başka açıklama yapma.`;

    const firstResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: baseSystemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: baseUserPrompt },
              {
                type: 'image_url',
                image_url: { url: imageUrl, detail: 'high' }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.2
      })
    });

    console.log('OpenAI API response status (stage 1):', firstResponse.status);

    if (!firstResponse.ok) {
      const errorText = await firstResponse.text();
      console.error('OpenAI API error (stage 1):', firstResponse.status, errorText);
      throw new Error(`OpenAI API error: ${firstResponse.status} - ${errorText}`);
    }

    const firstData = await firstResponse.json();
    const firstContent = firstData.choices[0]?.message?.content;
    if (!firstContent) {
      throw new Error('No content received from OpenAI (stage 1)');
    }

    console.log('Raw content from OpenAI (stage 1):', firstContent.substring(0, 200) + '...');

    function cleanAndParse(content: string) {
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      return JSON.parse(jsonStr);
    }

    let analysisResult: any;
    try {
      analysisResult = cleanAndParse(firstContent);
    } catch (err) {
      console.error('JSON parse error (stage 1):', err);
      throw new Error('Invalid JSON response from AI (stage 1)');
    }

    if (!analysisResult.detectedFoods || !Array.isArray(analysisResult.detectedFoods)) {
      analysisResult.detectedFoods = [];
    }

    if (typeof analysisResult.confidence !== 'number') {
      analysisResult.confidence = 0.7;
    }
    if (analysisResult.confidence > 1) {
      analysisResult.confidence = analysisResult.confidence / 100;
    }

    // --- 2. AŞAMA: quick + düşük güven → gpt-4o retry ---
    if (analysisType === 'quick' && analysisResult.confidence < 0.75) {
      console.log('Low confidence on gpt-4o, retrying with adjusted prompt');

      const secondResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: baseSystemPrompt },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: baseUserPrompt + '\n\nÖnceki analiz düşük güven verdi, bu sefer daha dikkatli ve yüksek doğrulukla analiz et.'
                },
                {
                  type: 'image_url',
                  image_url: { url: imageUrl, detail: 'high' }
                }
              ]
            }
          ],
          max_tokens: 1500,
          temperature: 0.2
        })
      });

      if (secondResponse.ok) {
        const secondData = await secondResponse.json();
        const secondContent = secondData.choices[0]?.message?.content;
        if (secondContent) {
          try {
            const secondResult = cleanAndParse(secondContent);
            if (secondResult.detectedFoods && secondResult.detectedFoods.length > 0) {
              console.log('Using improved result from retry');
              analysisResult = secondResult;
            }
          } catch (err) {
            console.log('JSON parse error (stage 2), keeping stage 1 result:', err);
          }
        }
      } else {
        const errorText = await secondResponse.text();
        console.error('OpenAI API error (stage 2):', secondResponse.status, errorText);
      }
    }

    // --- NUTRITION FİX ---
    analysisResult.detectedFoods.forEach((food: any, index: number) => {
      if (!food.name) food.name = `Yemek ${index + 1}`;
      if (!food.nameEn) food.nameEn = food.name;
      if (!food.estimatedAmount) food.estimatedAmount = '1 porsiyon';

      if (!food.nutritionPer100g) food.nutritionPer100g = {};
      if (!food.totalNutrition) food.totalNutrition = {};

      const fields = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium'] as const;

      fields.forEach((field) => {
        const per100 = food.nutritionPer100g[field];
        const total = food.totalNutrition[field];

        // sayı değilse veya negatifse 0 yap; 0 ise 0 bırak
        if (typeof per100 !== 'number' || Number.isNaN(per100) || per100 < 0) {
          food.nutritionPer100g[field] = 0;
        }
        if (typeof total !== 'number' || Number.isNaN(total) || total < 0) {
          food.totalNutrition[field] = 0;
        }
      });
    });

    if (!analysisResult.suggestions) {
      analysisResult.suggestions = 'Yemek analizi tamamlandı. Besin değerlerini kontrol ediniz.';
    }

    console.log('Analysis result validated successfully:', {
      detectedFoodsCount: analysisResult.detectedFoods.length,
      confidence: analysisResult.confidence,
      totalCalories: analysisResult.detectedFoods.reduce(
        (sum: number, food: any) => sum + (food.totalNutrition?.calories || 0),
        0
      )
    });

    // Increment photo analysis count for trial users
    if (profile.subscription_status === 'trial') {
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({
          trial_photo_analysis_count: profile.trial_photo_analysis_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to update trial count:', updateError);
      } else {
        console.log(
          'Trial photo analysis count incremented:',
          profile.trial_photo_analysis_count + 1
        );
      }
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in analyze-food function:', error);

    const sanitizedError =
      error instanceof Error
        ? error.message.includes('API')
          ? 'Service temporarily unavailable'
          : 'Analysis failed'
        : 'Unexpected error occurred';

    const errorResponse = {
      error: sanitizedError,
      detectedFoods: [],
      confidence: 0,
      suggestions:
        'Görüntü analizi sırasında hata oluştu. Lütfen manuel olarak yemek bilgilerini girin veya tekrar deneyin.'
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
