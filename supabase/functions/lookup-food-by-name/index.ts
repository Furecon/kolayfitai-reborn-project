import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LookupRequest {
  foodName: string;
  locale?: string;
}

interface FoodNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

interface FoodResponse {
  id?: string;
  name_tr: string;
  name_en: string;
  nutritionPer100g: FoodNutrition;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // 1. Authorization & Authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    // 2. Parse request body
    const requestData: LookupRequest = await req.json();
    const { foodName, locale = 'tr-TR' } = requestData;

    // 3. Input validation
    if (!foodName || typeof foodName !== 'string') {
      throw new Error('Valid foodName is required');
    }

    if (foodName.length < 2 || foodName.length > 100) {
      throw new Error('Food name must be between 2 and 100 characters');
    }

    const cleanedFoodName = foodName.trim();

    console.log(`Looking up food: "${cleanedFoodName}" for user: ${user.id}`);

    // 4. Search in foods table (Turkish first, then English)
    const searchTerm = `%${cleanedFoodName}%`;

    // Try Turkish name first
    let { data: foods, error: searchError } = await supabaseClient
      .from('foods')
      .select('id, name, name_tr, name_en, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g')
      .ilike('name_tr', searchTerm)
      .limit(1);

    // If not found, try English
    if (!foods || foods.length === 0) {
      const result = await supabaseClient
        .from('foods')
        .select('id, name, name_tr, name_en, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g')
        .ilike('name_en', searchTerm)
        .limit(1);

      foods = result.data;
      searchError = result.error;
    }

    // If not found, try name column
    if (!foods || foods.length === 0) {
      const result = await supabaseClient
        .from('foods')
        .select('id, name, name_tr, name_en, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g')
        .ilike('name', searchTerm)
        .limit(1);

      foods = result.data;
      searchError = result.error;
    }

    if (searchError) {
      console.error('Database search error:', searchError);
    }

    // 5. If found in database, return it
    if (foods && foods.length > 0) {
      const food = foods[0];
      console.log(`Found in database: ${food.name_tr || food.name}`);

      return new Response(
        JSON.stringify({
          foundInDb: true,
          createdFromAI: false,
          food: {
            id: food.id,
            name_tr: food.name_tr || food.name,
            name_en: food.name_en || food.name,
            nutritionPer100g: {
              calories: food.calories_per_100g || 0,
              protein: food.protein_per_100g || 0,
              carbs: food.carbs_per_100g || 0,
              fat: food.fat_per_100g || 0,
              fiber: food.fiber_per_100g || 0,
              sugar: food.sugar_per_100g || 0,
              sodium: food.sodium_per_100g || 0,
            }
          }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 6. Not found in DB → Use GPT to research and create
    console.log(`Not found in DB, using AI research for: "${cleanedFoodName}"`);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // 7. Call OpenAI for food research with enhanced intelligence
    const systemPrompt = `Sen profesyonel bir beslenme uzmanı ve gıda analizcisisin. Görevin: Kullanıcının verdiği yiyecek/içecek için 100g/100ml başına DOĞRU ve GERÇEKÇİ besin değerlerini sağlamak.

KRİTİK KURALLAR:
1. Değerler MUTLAKA 100 gram veya 100 ml bazında olmalı
2. Kalori değeri çoğu yemek için 30-900 kcal/100g arası olmalı (çok yağlı ürünler 900'e yakın, hafif çorbalar 30-60 arası)
3. ASLA 0-10 kcal gibi çok düşük değerler verme (sadece su, çay, kahve, zero içecekler hariç)
4. Çorbalar genelde 30-80 kcal/100g arası (içeriğine göre)
5. Et/tavuk yemekleri 120-250 kcal/100g arası
6. Tatlılar ve hamur işleri 250-450 kcal/100g arası

TÜRK MUTFAĞI REFERANS DEĞERLERİ (100g bazında):
- Mercimek çorbası: ~50-70 kcal, 3-4g protein, 8-10g karb, 1-2g yağ
- Kelle paça çorbası: ~80-120 kcal, 8-10g protein, 2-3g karb, 4-7g yağ
- Domates çorbası: ~40-60 kcal, 1-2g protein, 7-9g karb, 2-3g yağ
- Tavuk pirzola: ~165 kcal, 31g protein, 0g karb, 4g yağ
- Kuru fasulye: ~90-110 kcal, 6-7g protein, 15-17g karb, 1-2g yağ
- Pilav: ~130-150 kcal, 2-3g protein, 28-30g karb, 2-4g yağ
- Baklava: ~330-400 kcal, 5-7g protein, 50-60g karb, 15-20g yağ

MARKALI ÜRÜNLER İÇİN:
- Nescafe 2'si 1 arada: ~400 kcal/100g, 7g protein, 70g karb, 10g yağ
- Ülker Çokoprens: ~510 kcal/100g, 6g protein, 64g karb, 25g yağ
- Coca Cola: ~42 kcal/100ml, 0g protein, 10.6g karb (şeker), 0g yağ
- Coca Cola Zero: ~0.3 kcal/100ml, tüm değerler ~0
- Süt (tam yağlı): ~61 kcal/100ml, 3.2g protein, 4.8g karb, 3.3g yağ

ÖNEMLİ:
- Türkçe yemek adlarını düzgün yaz
- Sadece JSON döndür
- Değerler GERÇEKÇİ olmalı
- Yüksek yağlı/kalorili ürünler: fıstık, çikolata, yağlar
- Düşük kalorili: sebze çorbaları, salata, meyve`;

    const userPrompt = `Yemek/İçecek: "${cleanedFoodName}"

Yukarıdaki referans değerlere göre bu ürün için 100g/100ml başına besin değerlerini hesapla.

Eğer:
- Türk mutfağı yemeğiyse (çorba, pilav, et yemeği, vb.) → yukarıdaki referans değerlere göre hesapla
- Markalı ürünse → o markanın gerçek değerlerini kullan
- Genel bir yemekse → benzer yemeklerin ortalamasını al

DİKKAT:
- Çorbalar için 30-120 kcal/100g arası değer ver
- Et yemekleri için 120-250 kcal/100g arası değer ver
- ASLA 1-10 kcal gibi mantıksız değerler verme

JSON (SADECE bu formatı döndür):
{
  "name_tr": "Düzgün Türkçe ad",
  "name_en": "English name",
  "nutritionPer100g": {
    "calories": gerçekçi_sayı,
    "protein": sayı,
    "carbs": sayı,
    "fat": sayı,
    "fiber": sayı,
    "sugar": sayı,
    "sodium": sayı
  },
  "is_drink": true_ya_da_false
}`;

    // Use GPT-4o for better nutrition research
    const modelToUse = 'gpt-4o';
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 600,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error(`OpenAI API error with model ${modelToUse}:`, errorText);
      throw new Error('AI research failed');
    }

    const openaiData = await openaiResponse.json();
    const aiContent = openaiData.choices[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No response from AI');
    }

    console.log(`AI research completed using model: ${modelToUse}`);

    // Parse AI response
    let aiResult;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = aiContent.replace(/```json\n?|\n?```/g, '').trim();
      aiResult = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Invalid AI response format');
    }

    // 8. Validate AI response
    const nutrition = aiResult.nutritionPer100g;
    if (!nutrition || typeof nutrition.calories !== 'number') {
      throw new Error('Invalid nutrition data from AI');
    }

    // Strict validation for realistic values
    if (nutrition.calories < 0 || nutrition.calories > 900) {
      console.error(`Unrealistic calorie value: ${nutrition.calories} for ${cleanedFoodName}`);
      throw new Error(`Unrealistic calorie value: ${nutrition.calories}. Expected range: 0-900 kcal/100g`);
    }

    // Special validation: most foods should have at least 10 kcal
    // Exceptions: water, tea, coffee, zero drinks
    const isZeroCalorieDrink = cleanedFoodName.toLowerCase().includes('su') ||
                               cleanedFoodName.toLowerCase().includes('çay') ||
                               cleanedFoodName.toLowerCase().includes('kahve') ||
                               cleanedFoodName.toLowerCase().includes('zero') ||
                               cleanedFoodName.toLowerCase().includes('light');

    if (nutrition.calories < 10 && !isZeroCalorieDrink) {
      console.error(`Suspiciously low calorie value: ${nutrition.calories} for ${cleanedFoodName}`);
      throw new Error(`Calorie value too low: ${nutrition.calories}. Most foods have at least 10 kcal/100g. Please provide realistic values.`);
    }

    // Validate other nutrients
    if (nutrition.protein < 0 || nutrition.protein > 100) {
      throw new Error('Unrealistic protein value');
    }
    if (nutrition.carbs < 0 || nutrition.carbs > 100) {
      throw new Error('Unrealistic carbs value');
    }
    if (nutrition.fat < 0 || nutrition.fat > 100) {
      throw new Error('Unrealistic fat value');
    }

    // 9. Save to foods table
    const { data: newFood, error: insertError } = await supabaseClient
      .from('foods')
      .insert({
        name: aiResult.name_en || aiResult.name_tr,
        name_tr: aiResult.name_tr,
        name_en: aiResult.name_en,
        calories_per_100g: nutrition.calories,
        protein_per_100g: nutrition.protein || 0,
        carbs_per_100g: nutrition.carbs || 0,
        fat_per_100g: nutrition.fat || 0,
        fiber_per_100g: nutrition.fiber || 0,
        sugar_per_100g: nutrition.sugar || 0,
        sodium_per_100g: nutrition.sodium || 0,
        category: aiResult.is_drink ? 'İçecekler' : 'Diğer',
        is_turkish_cuisine: locale === 'tr-TR',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to insert food:', insertError);
      // Continue anyway, we have the data
    }

    console.log(`Created new food from AI: ${aiResult.name_tr}`);

    // 10. Return response
    return new Response(
      JSON.stringify({
        foundInDb: false,
        createdFromAI: true,
        food: {
          id: newFood?.id,
          name_tr: aiResult.name_tr,
          name_en: aiResult.name_en,
          nutritionPer100g: {
            calories: nutrition.calories,
            protein: nutrition.protein || 0,
            carbs: nutrition.carbs || 0,
            fat: nutrition.fat || 0,
            fiber: nutrition.fiber || 0,
            sugar: nutrition.sugar || 0,
            sodium: nutrition.sodium || 0,
          }
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error('Error in lookup-food-by-name:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        foundInDb: false,
        createdFromAI: false,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});