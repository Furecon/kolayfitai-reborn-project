import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Profile assessment function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { profileData, previousAssessment } = await req.json();

    console.log('Request data validated:', {
      hasProfileData: !!profileData,
      hasPreviousAssessment: !!previousAssessment,
      userId: profileData?.user_id
    });

    // Create assessment prompt
    const assessmentPrompt = `
Bir beslenme uzmanı olarak, kullanıcının profil bilgilerini analiz et ve kişiselleştirilmiş değerlendirme yap.

KULLANICI PROFİLİ:
- İsim: ${profileData.name}
- Yaş: ${profileData.age}
- Cinsiyet: ${profileData.gender}
- Boy: ${profileData.height} cm
- Kilo: ${profileData.weight} kg
- Aktivite Seviyesi: ${profileData.activity_level}
- Hedef: ${profileData.diet_goal}
- Günlük Kalori Hedefi: ${profileData.daily_calorie_goal}
- Protein Hedefi: ${profileData.daily_protein_goal}g
- Karbonhidrat Hedefi: ${profileData.daily_carbs_goal}g
- Yağ Hedefi: ${profileData.daily_fat_goal}g

${previousAssessment ? `
ÖNCEKİ DEĞERLENDİRME:
- Skor: ${previousAssessment.progress_score}/100
- Tarih: ${new Date(previousAssessment.created_at).toLocaleDateString('tr-TR')}
- Önceki Öneriler: ${previousAssessment.recommendations}
` : ''}

Lütfen şunları sağla:
1. Kullanıcının mevcut durumunun genel değerlendirmesi
2. Hedeflerine ulaşması için özel öneriler (beslenme, egzersiz, yaşam tarzı)
3. Sağlık ve wellness konularında önemli noktalar
4. Motivasyonel ve cesaretlendirici mesaj
5. Genel ilerleme skoru (0-100)

JSON formatında yanıt ver:
{
  "recommendations": "Detaylı öneriler ve tavsiyeler",
  "health_insights": "Sağlık konularında önemli bilgiler",
  "motivational_message": "Pozitif ve motive edici mesaj",
  "progress_score": sayısal_skor_0_100
}
`;

    console.log('Making request to OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'Sen profesyonel bir beslenme uzmanı ve wellness koçusun. Kullanıcılara kişiselleştirilmiş, bilimsel ve pratik öneriler sunuyorsun. Türkçe yanıt ver.'
          },
          { role: 'user', content: assessmentPrompt }
        ],
        temperature: 0.7,
      }),
    });

    console.log(`OpenAI API response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received:', { hasChoices: !!data.choices, choicesLength: data.choices?.length });

    const content = data.choices[0].message.content;
    console.log('Raw content from OpenAI:', content);

    // Parse JSON response
    let assessment;
    try {
      // Extract JSON from response if it's wrapped in markdown
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      assessment = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      // Fallback parsing
      assessment = {
        recommendations: content.includes('öneriler') ? content : 'Profil bilgileriniz alındı. Hedeflerinize uygun beslenme planı oluşturmanızı öneriyoruz.',
        health_insights: 'Düzenli beslenme ve egzersiz alışkanlıkları geliştirmeye odaklanın.',
        motivational_message: 'Hedeflerinize ulaşmak için doğru yoldasınız. Kararlılığınızla başarıya ulaşacaksınız!',
        progress_score: 75
      };
    }

    console.log('Successfully parsed assessment:', { 
      hasRecommendations: !!assessment.recommendations,
      progressScore: assessment.progress_score 
    });

    // Save assessment to database
    const { data: savedAssessment, error: dbError } = await supabase
      .from('ai_assessments')
      .insert({
        user_id: profileData.user_id,
        assessment_type: 'profile_update',
        assessment_data: profileData,
        recommendations: assessment.recommendations,
        progress_score: assessment.progress_score,
        health_insights: assessment.health_insights,
        motivational_message: assessment.motivational_message
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log('Assessment saved to database:', { id: savedAssessment?.id });

    return new Response(JSON.stringify({
      success: true,
      assessment: savedAssessment
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in profile-assessment function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});