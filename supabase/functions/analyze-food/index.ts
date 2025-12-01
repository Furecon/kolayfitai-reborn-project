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
      detailsPrompt = `\n\nÖNEMLİ BİLGİLER: Pişirme yöntemi ve kaynağı göz önünde bulundur.`;
    }

    const model = 'gpt-4o';
    const systemPrompt = 'Sen Türk mutfağı uzmanısın. Yemek fotoğraflarını analiz ederek besin değerlerini hesaplıyorsun. Türkçe yemek adlarını kullan.';
    const userPrompt = `Bu yemek fotoğrafını analiz et.${detailsPrompt}\n\nJSON formatında döndür: {"detectedFoods": [{"name": "...", "nameEn": "...", "estimatedAmount": "...", "nutritionPer100g": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0, "sugar": 0, "sodium": 0}, "totalNutrition": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0, "sugar": 0, "sodium": 0}}], "confidence": 0.8, "suggestions": "..."}`;

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
              { role: 'user', content: [{ type: 'text', text: userPrompt }, { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } }] }
            ],
            max_tokens: 2000,
            temperature: 0.1
          })
        });

        if (firstResponse.ok) break;

        if (firstResponse.status === 429 || firstResponse.status >= 500) {
          lastError = await firstResponse.text();
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, attempt * 1500));
          }
          continue;
        }

        lastError = await firstResponse.text();
        break;
      } catch (fetchError) {
        lastError = fetchError;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
    }

    if (!firstResponse || !firstResponse.ok) {
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
      firstData = JSON.parse(responseText);
    } catch (parseError) {
      return new Response(JSON.stringify({
        error: 'invalid_response',
        message: 'Analiz yanıtı alınamadı.',
        detectedFoods: [],
        confidence: 0
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const content = firstData.choices?.[0]?.message?.content;
    if (!content) {
      return new Response(JSON.stringify({ error: 'no_content', detectedFoods: [], confidence: 0 }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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
      return new Response(JSON.stringify({ error: 'parse_error', detectedFoods: [], confidence: 0 }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!analysisResult.detectedFoods) analysisResult.detectedFoods = [];
    if (typeof analysisResult.confidence !== 'number') analysisResult.confidence = 0.7;

    if (profile.subscription_status === 'trial') {
      await supabaseClient.from('profiles').update({
        trial_photo_analysis_count: profile.trial_photo_analysis_count + 1
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
