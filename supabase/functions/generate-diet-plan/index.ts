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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('🎯 Generate diet plan function called');

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

    const { dietProfile } = await req.json() as { dietProfile: DietProfile };

    if (!dietProfile) {
      throw new Error('Diet profile is required');
    }

    console.log('📋 Received diet profile:', dietProfile);

    // Fetch user's calorie goal from profiles
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('⚠️ Error fetching user profile:', profileError);
    }

    const targetCalories = userProfile?.daily_calorie_goal || null;
    const targetProtein = userProfile?.daily_protein_goal || null;
    const targetCarbs = userProfile?.daily_carbs_goal || null;
    const targetFat = userProfile?.daily_fat_goal || null;

    console.log('🎯 User macro goals:', { targetCalories, targetProtein, targetCarbs, targetFat });

    const systemPrompt = `Sen Türk kullanıcılar için çalışan profesyonel bir beslenme uzmanısın. Görevin kullanıcının diyet profiline göre 7 günlük dengeli ve sağlıklı bir beslenme planı oluşturmak.

ÖNEMLİ KURALLAR:
1. Kullanıcının belirlediği alerjenlere KESİNLİKLE UYACAKSIN. Alerjen içeren hiçbir malzeme kullanma.
2. Kullanıcının seçtiği diyet türüne %100 uyum sağla.
3. Aynı yemeği çok sık tekrar etme. 7 gün içinde mümkün olduğunca çeşitlilik sağla.
4. Türk mutfağına ve Türkiye'de bulunabilir malzemelere öncelik ver.
5. KRİTİK: Kullanıcının hedef günlük kalorisi belirtilmişse, MUTLAKA bu kalori hedefine uygun plan oluştur. Günlük toplam kalori hedefin +/- 50 kalori içinde olmalı.
6. Hedef kaloriye ulaşmak için gerekirse birden fazla ara öğün (snack) ekle. Ara öğünler sağlıklı atıştırmalıklar olmalı (meyve, kuruyemiş, yoğurt vb).
7. Her öğün için net, anlaşılır Türkçe tarifler ver.
8. Makro besin değerlerini (protein, karbonhidrat, yağ) dengeli dağıt ve hedef makrolara uygun ol.
9. Sevilmeyen yiyecekleri kullanma.
10. Tercih edilen mutfaklardan ilham al ama Türkiye'de uygulanabilir ol.

CEVAP FORMATI:
Sadece JSON formatında yanıt ver. Markdown veya açıklama ekleme. JSON şu yapıda olmalı:

{
  "days": [
    {
      "dayIndex": 1,
      "dayName": "Pazartesi",
      "totalCalories": 1800,
      "meals": [
        {
          "mealType": "breakfast",
          "titleTr": "Yemek adı",
          "descriptionTr": "Kısa açıklama",
          "calories": 450,
          "protein": 20,
          "carbs": 60,
          "fat": 12,
          "instructions": "Adım adım tarif"
        },
        {
          "mealType": "lunch",
          "titleTr": "...",
          "descriptionTr": "...",
          "calories": 500,
          "protein": 30,
          "carbs": 40,
          "fat": 18,
          "instructions": "..."
        },
        {
          "mealType": "dinner",
          "titleTr": "...",
          "descriptionTr": "...",
          "calories": 600,
          "protein": 35,
          "carbs": 50,
          "fat": 20,
          "instructions": "..."
        },
        {
          "mealType": "snack",
          "titleTr": "...",
          "descriptionTr": "...",
          "calories": 250,
          "protein": 10,
          "carbs": 30,
          "fat": 8,
          "instructions": "..."
        }
      ],
      "notes": "Gün için motivasyon notu (opsiyonel)"
    }
  ]
}

7 gün için bu yapıyı tekrarla (dayIndex: 1-7, dayName: Pazartesi-Pazar).`;

    let calorieInstruction = '';
    let macroInstruction = '';

    if (targetCalories) {
      calorieInstruction = `\n\n⚠️ KRİTİK HEDEF: Kullanıcının günlük kalori hedefi ${targetCalories} kcal. Her günün toplam kalorisi MUTLAKA ${targetCalories - 50} ile ${targetCalories + 50} kcal arasında olmalı.`;

      if (targetProtein && targetCarbs && targetFat) {
        macroInstruction = `\nMakro hedefleri: Protein ${targetProtein}g, Karbonhidrat ${targetCarbs}g, Yağ ${targetFat}g. Bu hedeflere yakın kalınmalı (±10g tolerans).`;
      }

      calorieInstruction += `\n\nGerekirse 1-3 adet sağlıklı ara öğün (snack) ekleyerek kalori hedefine ulaş. Örnek ara öğünler: meyve, kuruyemiş, yoğurt, tam tahıllı bisküvi, protein bar, smoothie vb.`;
    }

    const userPrompt = `Aşağıdaki kullanıcı profili için 7 günlük kişisel diyet planı oluştur:

Yaş: ${dietProfile.age || 'Belirtilmedi'}
Cinsiyet: ${dietProfile.gender || 'Belirtilmedi'}
Boy: ${dietProfile.height_cm || 'Belirtilmedi'} cm
Kilo: ${dietProfile.weight_kg || 'Belirtilmedi'} kg
Hedef: ${dietProfile.goal || 'Belirtilmedi'}
Aktivite Seviyesi: ${dietProfile.activity_level || 'Belirtilmedi'}
Diyet Türü: ${dietProfile.diet_type || 'normal'}
Alerjenler: ${dietProfile.allergens && dietProfile.allergens.length > 0 ? dietProfile.allergens.join(', ') : 'Yok'}
Sevilmeyen Yiyecekler: ${dietProfile.disliked_foods || 'Belirtilmedi'}
Tercih Edilen Mutfaklar: ${dietProfile.preferred_cuisines || 'Belirtilmedi'}${calorieInstruction}${macroInstruction}

Lütfen bu bilgilere göre 7 günlük dengeli ve çeşitli bir diyet planı oluştur. Özellikle kalori hedefine dikkat et!`;

    console.log('🤖 Calling OpenAI GPT-4o...');

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error('❌ OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('✅ OpenAI response received');

    const planContent = openAIData.choices[0].message.content;
    console.log('📝 Plan content (first 500 chars):', planContent?.substring(0, 500));

    let planData;

    try {
      // Clean the content before parsing
      let cleanContent = planContent.trim();

      // Remove markdown code blocks if present
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      // Remove any DOCTYPE or HTML tags
      cleanContent = cleanContent.replace(/<!DOCTYPE[^>]*>/gi, '');
      cleanContent = cleanContent.replace(/<[^>]*>/g, '');
      cleanContent = cleanContent.trim();

      // Try to find JSON object
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
      }

      console.log('🧹 Cleaned content (first 300 chars):', cleanContent.substring(0, 300));

      planData = JSON.parse(cleanContent);

      // Validate structure
      if (!planData.days || !Array.isArray(planData.days) || planData.days.length === 0) {
        throw new Error('Invalid plan structure: missing or empty days array');
      }

      console.log('✅ Plan data validated:', {
        daysCount: planData.days.length,
        firstDayMealsCount: planData.days[0]?.meals?.length
      });

    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response:', parseError);
      console.error('📄 Raw content:', planContent);
      throw new Error(`Invalid plan format from OpenAI: ${parseError.message}`);
    }

    console.log('📦 Deactivating old plans and saving new plan...');

    await supabaseClient
      .from('diet_plans')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true);

    const { data: newPlan, error: insertError } = await supabaseClient
      .from('diet_plans')
      .insert({
        user_id: user.id,
        plan_data: planData,
        start_date: new Date().toISOString().split('T')[0],
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error saving plan:', insertError);
      throw insertError;
    }

    console.log('✅ Diet plan generated and saved successfully');

    return new Response(
      JSON.stringify({
        success: true,
        plan: newPlan,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error: any) {
    console.error('❌ Error in generate-diet-plan:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate diet plan',
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