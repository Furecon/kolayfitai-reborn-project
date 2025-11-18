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

    // 7. Call OpenAI for food research
    const systemPrompt = `Sen bir besin uzmanısın. Kullanıcının verdiği yiyecek/içecek için 100g/100ml başına ortalama besin değerlerini araştır ve JSON formatında döndür.

KURALLAR:
- Türkçe yaz
- Türk kullanıcılar için doğal Türkçe adlar kullan
- Güvenilir kaynaklar referans al (USDA, uluslararası besin veri tabanları)
- Sadece JSON döndür, başka metin yazma
- Su, sade kahve, şekersiz çay, diet/zero içecekler için kalori 0 olabilir
- Değerler gerçekçi olmalı (100g'da 5000 kcal gibi saçma değerler yok)
- Sodyum mg, lif ve şeker gram cinsinden`;

    const userPrompt = `Kullanıcı şu yiyeceği giriyor:

"${cleanedFoodName}"

Görevin:
1. Bu yiyeceğin Türkçe adını doğal bir şekilde normalize et
2. İngilizce adını da ver
3. 100 gram veya 100 ml başına ortalama besin değerlerini tahmini olarak hesapla

JSON formatı:
{
  "name_tr": "Türkçe ad",
  "name_en": "English name",
  "unit": "g" veya "ml",
  "nutritionPer100g": {
    "calories": sayı,
    "protein": sayı,
    "carbs": sayı,
    "fat": sayı,
    "fiber": sayı,
    "sugar": sayı,
    "sodium": sayı (mg cinsinden)
  },
  "is_drink": true veya false,
  "notes": "Kısa açıklama, max 1-2 cümle"
}`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('AI research failed');
    }

    const openaiData = await openaiResponse.json();
    const aiContent = openaiData.choices[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No response from AI');
    }

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

    if (nutrition.calories < 0 || nutrition.calories > 2000) {
      throw new Error('Unrealistic calorie value');
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
