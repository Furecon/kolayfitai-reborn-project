
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
    const requestData = await req.json();
    const { mealType, userGoals, todayIntake } = requestData;

    // Input validation
    if (!mealType || typeof mealType !== 'string') {
      throw new Error('Valid meal type is required');
    }

    if (!['breakfast', 'lunch', 'dinner', 'snack', 'drink'].includes(mealType)) {
      throw new Error('Invalid meal type');
    }

    if (!userGoals || typeof userGoals !== 'object') {
      throw new Error('User goals are required');
    }

    if (!todayIntake || typeof todayIntake !== 'object') {
      throw new Error('Today intake data is required');
    }

    // Validate numeric values
    const requiredGoalFields = ['goalCalories', 'proteinGoal', 'carbsGoal', 'fatGoal'];
    for (const field of requiredGoalFields) {
      if (typeof userGoals[field] !== 'number' || userGoals[field] < 0) {
        throw new Error(`Invalid ${field} value`);
      }
    }

    const requiredIntakeFields = ['totalCalories', 'totalProtein', 'totalCarbs', 'totalFat'];
    for (const field of requiredIntakeFields) {
      if (typeof todayIntake[field] !== 'number' || todayIntake[field] < 0) {
        throw new Error(`Invalid ${field} value`);
      }
    }

    console.log('Meal suggestion request validated:', { mealType, userGoals, todayIntake });

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

    // Check trial limits before processing
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status, trial_meal_suggestion_count, trial_meal_suggestion_limit')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      throw new Error('Failed to fetch user profile')
    }

    // Check if user has reached trial limit
    if (profile.subscription_status === 'trial') {
      if (profile.trial_meal_suggestion_count >= profile.trial_meal_suggestion_limit) {
        return new Response(
          JSON.stringify({
            error: 'trial_limit_reached',
            message: 'Ücretsiz yemek önerisi hakkınız doldu. Premium üyeliğe geçerek sınırsız öneri alabilirsiniz.',
            suggestions: []
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
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

    // Increment meal suggestion count for trial users
    if (profile.subscription_status === 'trial') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          trial_meal_suggestion_count: profile.trial_meal_suggestion_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Failed to update trial count:', updateError)
      } else {
        console.log('Trial meal suggestion count incremented:', profile.trial_meal_suggestion_count + 1)
      }
    }

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in meal-suggestions function:', error);
    
    // Sanitize error message
    const sanitizedError = error instanceof Error ? 
      (error.message.includes('API') ? 'Service temporarily unavailable' : 'Processing failed') :
      'Internal server error'
    
    return new Response(
      JSON.stringify({ error: sanitizedError }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
