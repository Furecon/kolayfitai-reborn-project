import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Analyze-food function called');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const requestData = await req.json();
    const { imageUrl, mealType, analysisType, detailsData } = requestData;

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('subscription_status, trial_photo_analysis_count, trial_photo_analysis_limit')
      .eq('user_id', user.id)
      .single();

    if (profileError) throw new Error('Failed to fetch user profile');

    if (profile.subscription_status === 'trial' && profile.trial_photo_analysis_count >= profile.trial_photo_analysis_limit) {
      return new Response(JSON.stringify({
        error: 'trial_limit_reached',
        message: 'Ücretsiz fotoğraf analizi hakkınız doldu.',
        detectedFoods: [],
        confidence: 0,
        suggestions: 'Premium üyeliğe geçerek sınırsız analiz yapabilirsiniz.'
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!imageUrl || typeof imageUrl !== 'string') throw new Error('Valid image URL required');
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:')) {
      throw new Error('Invalid image URL format');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) throw new Error('OpenAI API key not configured');

    let detailsPrompt = '';
    if (analysisType === 'detailed' && detailsData) {
      const cookingMethodText = detailsData.cookingMethod === 'unsure'
        ? 'Pişirme yöntemi belirsiz - fotoğraftan tahmin et'
        : detailsData.cookingMethod || 'Belirtilmemiş';

      const foodSourceText = detailsData.foodSource === 'homemade' ? 'Ev yapımı' : 'Paketli/hazır';
      const consumedAmountText = (detailsData.consumedAmount || 'Belirtilmemiş').replace(/"/g, '\\"');
      const mealTypeText = detailsData.mealType === 'single' ? 'Tek tip yemek' : 'Karışık tabak';

      const hiddenIngredientsText = detailsData.hiddenIngredients
        ? detailsData.hiddenIngredients.replace(/"/g, '\\"').replace(/'/g, "\\'").replace(/\n/g, ' ')
        : '';

      detailsPrompt = `\n\nÖNEMLİ EK BİLGİLER:\n- Yemek kaynağı: ${foodSourceText}\n- Pişirme yöntemi: ${cookingMethodText}\n- Tüketilen miktar: ${consumedAmountText}\n- Yemek türü: ${mealTypeText}${hiddenIngredientsText ? `\n- Gizli malzemeler/ekstralar: ${hiddenIngredientsText}` : ''}\n\nBu bilgileri kullanarak daha doğru besin değeri hesaplama yap.`;
    }

    const model = 'gpt-4o';
    const systemPrompt = `Sen Türk mutfağı ve beslenme konusunda uzman bir yapay zeka asistanısın.\nYemek fotoğraflarını analiz ederek doğru besin değerlerini hesaplıyorsun.\nTürkçe yemek adlarını tercih et ve gerçekçi porsiyon tahminleri yap.\n\nHesaplaman gereken besin değerleri:\n- Kalori (kcal)\n- Protein (g)\n- Karbonhidrat (g)\n- Yağ (g)\n- Lif (g)\n- Şeker (g)\n- Sodyum (mg)\n\nSu ve kalorisiz içecekler için değerler 0 olabilir.`;

    const userPrompt = `Bu yemek fotoğrafını analiz et ve besin değerlerini hesapla.\nTürkçe yemek adları kullan ve gerçekçi porsiyon tahminleri yap.${detailsPrompt}\n\nSadece geçerli bir JSON objesi döndür:\n\n{\n  \"detectedFoods\": [\n    {\n      \"name\": \"Yemek adı (Türkçe)\",\n      \"nameEn\": \"Food name (English)\",\n      \"estimatedAmount\": \"Miktar ve birim\",\n      \"portionType\": \"gram|ml|adet|porsiyon\",\n      \"nutritionPer100g\": {\n        \"calories\": sayı,\n        \"protein\": sayı,\n        \"carbs\": sayı,\n        \"fat\": sayı,\n        \"fiber\": sayı,\n        \"sugar\": sayı,\n        \"sodium\": sayı\n      },\n      \"totalNutrition\": {\n        \"calories\": sayı,\n        \"protein\": sayı,\n        \"carbs\": sayı,\n        \"fat\": sayı,\n        \"fiber\": sayı,\n        \"sugar\": sayı,\n        \"sodium\": sayı\n      }\n    }\n  ],\n  \"confidence\": 0_ile_1_arası_sayı,\n  \"suggestions\": \"Türkçe kısa öneriler\"\n}`;

    const maxRetries = 2;
    let lastError: any = null;
    let firstResponse: Response | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`OpenAI request attempt ${attempt}/${maxRetries}`);

        firstResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: [
                { type: 'text', text: userPrompt },
                { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } }
              ]}
            ],
            max_tokens: 2000,
            temperature: 0.1
          })
        });

        if (firstResponse.ok) break;

        if (firstResponse.status === 429 || firstResponse.status >= 500) {
          lastError = await firstResponse.text();
          console.log(`Retryable error (${firstResponse.status}), will retry...`);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, attempt * 1500));
          }
          continue;
        }

        lastError = await firstResponse.text();
        break;
      } catch (fetchError) {
        console.error(`Fetch error on attempt ${attempt}:`, fetchError);
        lastError = fetchError;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
    }

    if (!firstResponse || !firstResponse.ok) {
      console.error('All OpenAI API attempts failed:', lastError);
      return new Response(JSON.stringify({
        error: 'analysis_failed',
        message: 'Analiz servisi geçici olarak kullanılamıyor.',
        detectedFoods: [],
        confidence: 0,
        suggestions: 'Lütfen tekrar deneyin.'
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let firstData;
    try {
      const responseText = await firstResponse.text();
      console.log('Raw response (first 200 chars):', responseText.substring(0, 200));
      firstData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return new Response(JSON.stringify({
        error: 'invalid_response',
        message: 'Analiz yanıtı alınamadı.',
        detectedFoods: [],
        confidence: 0
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const content = firstData.choices?.[0]?.message?.content;
    if (!content) {
      console.error('No content in OpenAI response');
      return new Response(JSON.stringify({
        error: 'no_content',
        message: 'Analiz sonucu alınamadı.',
        detectedFoods: [],
        confidence: 0
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    function cleanAndParse(c: string) {
      let s = c.trim();
      if (s.startsWith('```json')) s = s.replace(/```json\n?/, '').replace(/\n?```$/, '');
      if (s.startsWith('```')) s = s.replace(/```\n?/, '').replace(/\n?```$/, '');
      return JSON.parse(s);
    }

    let analysisResult;
    try {
      analysisResult = cleanAndParse(content);
    } catch (err) {
      console.error('JSON parse error:', err, 'Content:', content.substring(0, 500));
      return new Response(JSON.stringify({
        error: 'parse_error',
        message: 'Analiz sonucu işlenemedi. Lütfen tekrar deneyin.',
        detectedFoods: [],
        confidence: 0
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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

        if (typeof per100 !== 'number' || Number.isNaN(per100) || per100 < 0) {
          food.nutritionPer100g[field] = 0;
        }
        if (typeof total !== 'number' || Number.isNaN(total) || total < 0) {
          food.totalNutrition[field] = 0;
        }
      });
    });

    if (!analysisResult.suggestions) {
      analysisResult.suggestions = 'Yemek analizi tamamlandı.';
    }

    console.log('Analysis result validated successfully:', {
      detectedFoodsCount: analysisResult.detectedFoods.length,
      confidence: analysisResult.confidence
    });

    if (profile.subscription_status === 'trial') {
      await supabaseClient.from('profiles').update({
        trial_photo_analysis_count: profile.trial_photo_analysis_count + 1,
        updated_at: new Date().toISOString()
      }).eq('user_id', user.id);
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      error: 'analysis_failed',
      detectedFoods: [],
      confidence: 0,
      suggestions: 'Hata oluştu. Lütfen tekrar deneyin.'
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
