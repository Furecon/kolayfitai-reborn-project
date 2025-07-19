
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mealType, userGoals, todayIntake } = await req.json();
    console.log('Meal suggestion request:', { mealType, userGoals, todayIntake });

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Supabase client for storing suggestions
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user ID from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid user token');
    }

    const mealTypeInTurkish = {
      'breakfast': 'Kahvaltı',
      'lunch': 'Öğle Yemeği', 
      'dinner': 'Akşam Yemeği',
      'snack': 'Atıştırmalık'
    }[mealType] || mealType;

    const remainingCalories = userGoals.goalCalories - todayIntake.totalCalories;
    const remainingProtein = userGoals.proteinGoal - todayIntake.totalProtein;
    const remainingCarbs = userGoals.carbsGoal - todayIntake.totalCarbs;
    const remainingFat = userGoals.fatGoal - todayIntake.totalFat;

    const prompt = `Sen bir Türk beslenme uzmanısın. ${mealTypeInTurkish} için 3 farklı yemek önerisi hazırla.

Kullanıcının bugünkü durumu:
- Kalan kalori hedefi: ${remainingCalories} kcal
- Kalan protein hedefi: ${remainingProtein.toFixed(1)} g
- Kalan karbonhidrat hedefi: ${remainingCarbs.toFixed(1)} g
- Kalan yağ hedefi: ${remainingFat.toFixed(1)} g

Her öneri için şu formatta JSON döndür:
{
  "suggestions": [
    {
      "name": "Yemek Adı",
      "description": "Kısa açıklama",
      "calories": kalori_sayısı,
      "protein": protein_gram,
      "carbs": karbonhidrat_gram,
      "fat": yağ_gram,
      "prepTime": dakika,
      "difficulty": "Kolay|Orta|Zor",
      "ingredients": ["malzeme1", "malzeme2"],
      "instructions": ["Adım 1", "Adım 2"],
      "category": "Türk Mutfağı",
      "servings": porsiyon_sayısı
    }
  ]
}

Türk mutfağından seçenekler öner. Kalan besin değerlerini tamamlayacak şekilde dengeli öneriler yap. Gerçekçi kalori ve besin değerleri kullan.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sen bir Türk beslenme uzmanısın. Sadece JSON formatında cevap ver, başka açıklama yapma.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI Response:', aiResponse);

    let suggestions;
    try {
      suggestions = JSON.parse(aiResponse);
    } catch (e) {
      console.error('JSON parse error:', e);
      throw new Error('Invalid JSON response from AI');
    }

    // Store suggestions in database
    const { error: insertError } = await supabase
      .from('meal_suggestions')
      .insert({
        user_id: user.id,
        suggestion_data: suggestions,
        meal_type: mealType
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
    }

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in meal-suggestions function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
