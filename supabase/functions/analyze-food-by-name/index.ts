import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { foodName, mealType = 'Öğle' } = await req.json();

    if (!foodName || typeof foodName !== 'string' || foodName.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Yemek adı gereklidir' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API anahtarı yapılandırılmamış' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Analyzing food: ${foodName} for meal: ${mealType}`);

    const prompt = `Türk mutfağı uzmanı olarak, verilen yemek adından detaylı besin değeri analizi yapın.

Yemek adı: "${foodName}"
Öğün: ${mealType}

GÖREV:
1. Yemek adını tanıyın ve tam ismini belirleyin
2. Standart porsiyon büyüklüğünü tahmin edin (gram/ml olarak)
3. Tam besin değerlerini hesaplayın
4. Güven skorunu değerlendirin (0-100)

KURALLAR:
- Türk mutfağı yemeklerini önceliklendirin
- Bölgesel varyasyonları dikkate alın
- Standart ev porsiyonlarını kullanın
- Belirsizlik durumunda ortalama değerleri verin

ÇIKTI FORMATI (geçerli JSON):
{
  "recognizedName": "Tanınan tam yemek adı",
  "foods": [
    {
      "name": "Yemek adı",
      "amount": Porsiyon_miktarı_sayı,
      "unit": "gram/ml/adet",
      "calories": Toplam_kalori_sayı,
      "protein": Protein_gram_sayı,
      "carbs": Karbonhidrat_gram_sayı,
      "fat": Yağ_gram_sayı,
      "fiber": Lif_gram_sayı,
      "sugar": Şeker_gram_sayı,
      "category": "Ana yemek/Çorba/Tatlı/İçecek/Atıştırmalık"
    }
  ],
  "confidence": Güven_skoru_0_100,
  "suggestions": [
    "Benzer yemek önerisi 1",
    "Benzer yemek önerisi 2"
  ],
  "notes": "Porsiyon veya hazırlama ile ilgili notlar"
}

ÖRNEK GİRİŞLER:
- "döner" → Tavuk döner (standart porsiyon)
- "pilav" → Pirinç pilavı (1 porsiyon)
- "çorba" → Mercimek çorbası (1 kase)
- "baklava 2 adet" → Baklava (2 adet)

Yalnızca geçerli JSON döndürün, başka açıklama yapmayın.`;

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
            content: 'Sen Türk mutfağı ve beslenme uzmanısın. Yemek adlarından doğru besin değeri analizi yapabilirsin.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'AI analizi başarısız oldu' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'AI yanıt vermedi' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Raw AI response:', content);

    // Clean and parse the JSON response
    let analysisResult;
    try {
      const cleanedContent = content.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
      analysisResult = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content);
      return new Response(
        JSON.stringify({ error: 'AI yanıtı işlenemedi' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate and sanitize the result
    if (!analysisResult.foods || !Array.isArray(analysisResult.foods) || analysisResult.foods.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Geçersiz yemek analizi' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Ensure all required numeric fields are present and valid
    analysisResult.foods = analysisResult.foods.map((food: any) => ({
      name: String(food.name || 'Bilinmeyen yemek'),
      amount: Math.max(1, Number(food.amount) || 100),
      unit: String(food.unit || 'gram'),
      calories: Math.max(0, Number(food.calories) || 0),
      protein: Math.max(0, Number(food.protein) || 0),
      carbs: Math.max(0, Number(food.carbs) || 0),
      fat: Math.max(0, Number(food.fat) || 0),
      fiber: Math.max(0, Number(food.fiber) || 0),
      sugar: Math.max(0, Number(food.sugar) || 0),
      category: String(food.category || 'Ana yemek')
    }));

    analysisResult.confidence = Math.min(100, Math.max(0, Number(analysisResult.confidence) || 70));
    analysisResult.recognizedName = String(analysisResult.recognizedName || foodName);
    analysisResult.suggestions = Array.isArray(analysisResult.suggestions) ? analysisResult.suggestions : [];
    analysisResult.notes = String(analysisResult.notes || '');

    console.log('Final analysis result:', JSON.stringify(analysisResult, null, 2));

    return new Response(
      JSON.stringify(analysisResult),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Sunucu hatası oluştu' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});