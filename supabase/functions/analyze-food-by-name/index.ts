import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const { foodName, mealType = 'Öğle', photoUrl = null } = await req.json();

    if (!foodName || typeof foodName !== 'string' || foodName.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Yemek adı gereklidir',
          analysis: { calories: 0, protein: 0, carbs: 0, fat: 0, confidence: 0 }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({
          error: 'OpenAI API anahtarı yapılandırılmamış',
          analysis: { calories: 0, protein: 0, carbs: 0, fat: 0, confidence: 0 }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Analyzing food by name: ${foodName} for meal: ${mealType}`);

    const prompt = `Türk mutfağı uzmanı olarak, verilen yemek adından detaylı besin değeri analizi yapın.\n\nYemek bilgisi: "${foodName}"\nÖğün: ${mealType}\n\nGÖREV:\n1. Yemek adını tanıyın ve miktarı belirleyin\n2. Toplam kalori ve makro besin değerlerini hesaplayın\n3. Güven skorunu değerlendirin (0-1 arası)\n\nKURALLAR:\n- Türk mutfağı yemeklerini önceliklendirin\n- Miktarlar metinde belirtilmişse kullanın (örn: "150 gram", "2 adet")\n- Belirtilmemişse standart porsiyon kullanın\n- Pişirme yöntemi belirtilmişse kalori hesabına dahil et\n\nSadece geçerli JSON döndür:\n{\n  \"calories\": toplam_kalori_sayı,\n  \"protein\": protein_gram_sayı,\n  \"carbs\": karbonhidrat_gram_sayı,\n  \"fat\": yağ_gram_sayı,\n  \"fiber\": lif_gram_sayı,\n  \"sugar\": şeker_gram_sayı,\n  \"confidence\": 0_ile_1_arası_güven_skoru,\n  \"recognizedName\": \"Tanınan yemek adı\",\n  \"estimatedAmount\": \"Tahmin edilen miktar (örn: 150 gram, 2 adet)\"\n}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sen Türk mutfağı ve beslenme uzmanısın. Yemek adlarından doğru besin değeri analizi yapabilirsin. Her zaman geçerli JSON döndür.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      return new Response(
        JSON.stringify({
          error: 'AI analizi başarısız oldu. Lütfen tekrar deneyin.',
          analysis: { calories: 0, protein: 0, carbs: 0, fat: 0, confidence: 0 }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in OpenAI response');
      return new Response(
        JSON.stringify({
          error: 'AI yanıt vermedi',
          analysis: { calories: 0, protein: 0, carbs: 0, fat: 0, confidence: 0 }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Raw AI response:', content.substring(0, 200));

    let analysisResult;
    try {
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      analysisResult = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content.substring(0, 500));
      return new Response(
        JSON.stringify({
          error: 'AI yanıtı işlenemedi. Lütfen tekrar deneyin.',
          analysis: { calories: 0, protein: 0, carbs: 0, fat: 0, confidence: 0 }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const sanitizedAnalysis = {
      calories: Math.max(0, Math.round(Number(analysisResult.calories) || 0)),
      protein: Math.max(0, Math.round(Number(analysisResult.protein) || 0)),
      carbs: Math.max(0, Math.round(Number(analysisResult.carbs) || 0)),
      fat: Math.max(0, Math.round(Number(analysisResult.fat) || 0)),
      fiber: Math.max(0, Math.round(Number(analysisResult.fiber) || 0)),
      sugar: Math.max(0, Math.round(Number(analysisResult.sugar) || 0)),
      confidence: Math.min(1, Math.max(0, Number(analysisResult.confidence) || 0.7)),
      recognizedName: String(analysisResult.recognizedName || foodName),
      estimatedAmount: String(analysisResult.estimatedAmount || 'Standart porsiyon')
    };

    console.log('Final analysis:', sanitizedAnalysis);

    return new Response(
      JSON.stringify({
        success: true,
        analysis: sanitizedAnalysis
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        error: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
        analysis: { calories: 0, protein: 0, carbs: 0, fat: 0, confidence: 0 }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
