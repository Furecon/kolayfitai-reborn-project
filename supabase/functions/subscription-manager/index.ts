import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { method, action, userId, receiptData, productId } = await req.json()

    if (method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    switch (action) {
      case 'validate_purchase': {
        console.log('Validating purchase for user:', userId, 'product:', productId)
        
        // Google Play purchase validation yapacağız
        // Şimdilik basit validation (gerçek uygulamada Google Play API'sini kullanın)
        
        const now = new Date()
        let endDate: Date
        let planType: string
        let amount: number

        if (productId === 'monthly_119_90') {
          endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 gün
          planType = 'monthly'
          amount = 119.90
        } else if (productId === 'yearly_1199_99') {
          endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 365 gün
          planType = 'yearly'
          amount = 1199.99
        } else {
          return new Response(JSON.stringify({ error: 'Invalid product ID' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Abonelik kaydını oluştur
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            plan_type: planType,
            status: 'active',
            start_date: now.toISOString(),
            end_date: endDate.toISOString(),
            price_amount: amount,
            currency: 'TRY',
            purchase_token: receiptData.purchaseToken || 'mock_token',
            order_id: receiptData.orderId || 'mock_order',
            auto_renew: true
          })

        if (subscriptionError) {
          console.error('Subscription creation error:', subscriptionError)
          return new Response(JSON.stringify({ error: 'Failed to create subscription' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Profili güncelle
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'premium',
            updated_at: now.toISOString()
          })
          .eq('user_id', userId)

        if (profileError) {
          console.error('Profile update error:', profileError)
          return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ 
          success: true,
          subscription: {
            planType,
            endDate: endDate.toISOString(),
            status: 'active'
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'check_subscription': {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status, trial_end_date')
          .eq('user_id', userId)
          .single()

        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        const now = new Date()
        let subscriptionValid = false
        let remainingDays = 0

        if (subscription && new Date(subscription.end_date) > now) {
          subscriptionValid = true
          remainingDays = Math.ceil((new Date(subscription.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        } else if (profile?.subscription_status === 'trial' && profile?.trial_end_date && new Date(profile.trial_end_date) > now) {
          subscriptionValid = true
          remainingDays = Math.ceil((new Date(profile.trial_end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        }

        return new Response(JSON.stringify({
          subscriptionValid,
          subscriptionStatus: profile?.subscription_status || 'trial',
          remainingDays,
          subscription
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

  } catch (error) {
    console.error('Subscription manager error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})