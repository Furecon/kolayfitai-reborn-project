import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DietProfile {
  age?: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  goal?: string;
  activity_level?: string;
  diet_type?: string;
  allergens?: string[];
  disliked_foods?: string;
  preferred_cuisines?: string;
}

interface CurrentMeal {
  mealType: string;
  titleTr: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('🔄 Replace meal function called');

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

    const { dietProfile, currentMeal, planId, dayIndex } = await req.json() as {
      dietProfile: DietProfile;
      currentMeal: CurrentMeal;
      planId: string;
      dayIndex: number;
    };

    if (!dietProfile || !currentMeal || !planId || dayIndex === undefined) {
      throw new Error('Missing required parameters');
    }

    console.log('📋 Replacing meal:', currentMeal.titleTr);

    const systemPrompt = `Sen Türk kullanıcılar için çalışan profesyonel bir beslenme uzmanısın. Görevin kullanıcının beğenmediği bir öğünü alternatif bir öğünle değiştirmek.

ÖNEMLİ KURALLAR:
1. Kullanıcının belirlediği alerjenlere KESINLIKLE UYACAKSIN.
2. Kullanıcının seçtiği diyet türüne %100 uyum sağla.
3. Yeni öğün, değiştirilen öğünle BENZER KALORI VE MAKRO değerlerine sahip olmalı.
4. Türk mutfağına ve Türkiye'de bulunabilir malzemelere öncelik ver.
5. Net, anlaşılır Türkçe tarif ver.
6. Sevilmeyen yiyecekleri kullanma.

CEVAP FORMATI:
Sadece JSON formatında tek bir meal objesi döndür:

{
  "mealType": "breakfast",
  "titleTr": "Alternatif yemek adı",
  "descriptionTr": "Kısa açıklama",
  "calories": 450,
  "protein": 20,
  "carbs": 60,
  "fat": 12,
  "instructions": "Adım adım tarif"
}`;

    const userPrompt = `Kullanıcı profili:
Diyet Türü: ${dietProfile.diet_type || 'normal'}
Alerjenler: ${dietProfile.allergens && dietProfile.allergens.length > 0 ? dietProfile.allergens.join(', ') : 'Yok'}
Sevilmeyen Yiyecekler: ${dietProfile.disliked_foods || 'Belirtilmedi'}
Tercih Edilen Mutfaklar: ${dietProfile.preferred_cuisines || 'Belirtilmedi'}

Değiştirilecek Öğün:
Öğün Tipi: ${currentMeal.mealType}
Mevcut Yemek: ${currentMeal.titleTr}
Hedef Kalori: ${currentMeal.calories}
Hedef Protein: ${currentMeal.protein}g
Hedef Karbonhidrat: ${currentMeal.carbs}g
Hedef Yağ: ${currentMeal.fat}g

Bu öğün yerine benzer kalori ve makro değerlerinde, farklı ve lezzetli bir alternatif öner.`;

    console.log('🤖 Calling OpenAI GPT-4o-mini...');

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error('❌ OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('✅ OpenAI response received');

    const mealContent = openAIData.choices[0].message.content;
    let newMeal;

    try {
      newMeal = JSON.parse(mealContent);
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response:', parseError);
      throw new Error('Invalid meal format from OpenAI');
    }

    console.log('📦 Updating diet plan with new meal...');

    const { data: currentPlan, error: fetchError } = await supabaseClient
      .from('diet_plans')
      .select('plan_data')
      .eq('id', planId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !currentPlan) {
      console.error('❌ Error fetching plan:', fetchError);
      throw new Error('Plan not found');
    }

    const planData = currentPlan.plan_data as any;
    const dayToUpdate = planData.days.find((day: any) => day.dayIndex === dayIndex);

    if (!dayToUpdate) {
      throw new Error('Day not found in plan');
    }

    const mealIndex = dayToUpdate.meals.findIndex(
      (meal: any) => meal.mealType === currentMeal.mealType
    );

    if (mealIndex === -1) {
      throw new Error('Meal not found in day');
    }

    dayToUpdate.meals[mealIndex] = newMeal;

    dayToUpdate.totalCalories = dayToUpdate.meals.reduce(
      (sum: number, meal: any) => sum + meal.calories,
      0
    );

    const { error: updateError } = await supabaseClient
      .from('diet_plans')
      .update({ plan_data: planData })
      .eq('id', planId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('❌ Error updating plan:', updateError);
      throw updateError;
    }

    console.log('✅ Meal replaced successfully');

    return new Response(
      JSON.stringify({
        success: true,
        newMeal,
        updatedDay: dayToUpdate,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error: any) {
    console.error('❌ Error in replace-meal:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to replace meal',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
