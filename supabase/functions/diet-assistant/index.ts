
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestData = await req.json()
    const { message, userId } = requestData

    // Input validation
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid message is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!userId || typeof userId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid userId is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Sanitize message input
    const sanitizedMessage = message.trim().substring(0, 1000) // Limit message length
    
    if (sanitizedMessage.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message cannot be empty' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get user profile and recent meal data for context
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    const today = new Date().toISOString().split('T')[0]
    const { data: todaysMeals } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)

    // Prepare context for AI
    const userContext = {
      profile: profile || {},
      todaysMeals: todaysMeals || [],
      totalCaloriesToday: todaysMeals?.reduce((sum, meal) => sum + (meal.total_calories || 0), 0) || 0,
      goalCalories: profile?.daily_calorie_goal || 2000,
      bmr: profile?.bmr || null,
      dietGoal: profile?.diet_goal || 'maintain'
    }

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Sen KolayfitAI'nin beslenme ve diyet uzmanı asistanısın. Türkçe yanıtlar veriyorsun ve kullanıcıların sağlıklı beslenme hedeflerine ulaşmalarına yardımcı oluyorsun.

Kullanıcı bilgileri:
- Günlük kalori hedefi: ${userContext.goalCalories} kcal
- Bugün alınan kalori: ${userContext.totalCaloriesToday} kcal
- Kalan kalori: ${userContext.goalCalories - userContext.totalCaloriesToday} kcal
- BMR: ${userContext.bmr || 'Belirtilmemiş'} kcal
- Diyet hedefi: ${userContext.dietGoal === 'lose' ? 'Kilo vermek' : userContext.dietGoal === 'gain' ? 'Kilo almak' : 'Kiloyu korumak'}
- Yaş: ${userContext.profile.age || 'Belirtilmemiş'}
- Cinsiyet: ${userContext.profile.gender === 'male' ? 'Erkek' : userContext.profile.gender === 'female' ? 'Kadın' : 'Belirtilmemiş'}
- Kilo: ${userContext.profile.weight || 'Belirtilmemiş'} kg
- Boy: ${userContext.profile.height || 'Belirtilmemiş'} cm

Bugünkü öğünler: ${userContext.todaysMeals.length > 0 ? userContext.todaysMeals.map(meal => `${meal.meal_type}: ${meal.total_calories} kcal`).join(', ') : 'Henüz öğün eklenmemiş'}

Yardımcı ve kişiselleştirilmiş tavsiyeler ver. Türk mutfağı ve yerel yemekleri göz önünde bulundur. Kısa ve anlaşılır yanıtlar ver.`
          },
          {
            role: 'user',
            content: sanitizedMessage
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    const openAIData = await openAIResponse.json()

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIData.error?.message || 'Unknown error'}`)
    }

    const response = openAIData.choices[0]?.message?.content || 'Üzgünüm, şu anda size yardımcı olamıyorum.'

    return new Response(
      JSON.stringify({ response }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Diet assistant error:', error)
    
    // Sanitize error message
    const sanitizedError = error instanceof Error ? 
      (error.message.includes('API') ? 'Service temporarily unavailable' : 'Processing failed') :
      'Internal server error'
    
    return new Response(
      JSON.stringify({ 
        error: sanitizedError,
        response: 'Üzgünüm, şu anda bir hata oluştu. Lütfen tekrar deneyin.'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
