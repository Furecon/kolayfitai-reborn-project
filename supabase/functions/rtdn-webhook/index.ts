import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RTDNMessage {
  version: string
  packageName: string
  eventTimeMillis: string
  subscriptionNotification?: {
    version: string
    notificationType: number
    purchaseToken: string
    subscriptionId: string
  }
  oneTimeProductNotification?: {
    version: string
    notificationType: number
    purchaseToken: string
    sku: string
  }
}

// Notification types for subscriptions
const SUBSCRIPTION_NOTIFICATION_TYPES = {
  1: 'SUBSCRIPTION_RECOVERED',
  2: 'SUBSCRIPTION_RENEWED', 
  3: 'SUBSCRIPTION_CANCELED',
  4: 'SUBSCRIPTION_PURCHASED',
  5: 'SUBSCRIPTION_ON_HOLD',
  6: 'SUBSCRIPTION_IN_GRACE_PERIOD',
  7: 'SUBSCRIPTION_RESTARTED',
  8: 'SUBSCRIPTION_PRICE_CHANGE_CONFIRMED',
  9: 'SUBSCRIPTION_DEFERRED',
  10: 'SUBSCRIPTION_PAUSED',
  11: 'SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED',
  12: 'SUBSCRIPTION_REVOKED',
  13: 'SUBSCRIPTION_EXPIRED'
}

Deno.serve(async (req) => {
  console.log('RTDN Webhook received request:', req.method)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify OIDC token from Google Cloud Pub/Sub
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header')
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    const token = authHeader.substring(7)
    
    // Verify the JWT token is from Google (basic validation)
    try {
      const tokenParts = token.split('.')
      if (tokenParts.length !== 3) {
        throw new Error('Invalid JWT format')
      }
      
      const payload = JSON.parse(atob(tokenParts[1]))
      console.log('JWT payload issuer:', payload.iss)
      
      // Verify issuer is from Google
      if (!payload.iss || !payload.iss.includes('google')) {
        throw new Error('Invalid token issuer')
      }
    } catch (error) {
      console.error('JWT validation failed:', error)
      return new Response('Invalid token', { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    // Parse the Pub/Sub message
    const body = await req.json()
    console.log('Received Pub/Sub message:', JSON.stringify(body, null, 2))

    if (!body.message || !body.message.data) {
      console.error('Invalid Pub/Sub message format')
      return new Response('Invalid message format', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Decode the base64 message data
    const messageData = atob(body.message.data)
    console.log('Decoded message data:', messageData)
    
    const rtdnMessage: RTDNMessage = JSON.parse(messageData)
    console.log('Parsed RTDN message:', JSON.stringify(rtdnMessage, null, 2))

    // Verify package name matches your app
    const expectedPackageName = Deno.env.get('GOOGLE_PACKAGE_NAME')
    if (rtdnMessage.packageName !== expectedPackageName) {
      console.error(`Package name mismatch. Expected: ${expectedPackageName}, Got: ${rtdnMessage.packageName}`)
      return new Response('Package name mismatch', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Process subscription notifications
    if (rtdnMessage.subscriptionNotification) {
      const notification = rtdnMessage.subscriptionNotification
      const notificationType = SUBSCRIPTION_NOTIFICATION_TYPES[notification.notificationType] || 'UNKNOWN'
      
      console.log(`Processing subscription notification: ${notificationType}`)
      console.log(`Purchase Token: ${notification.purchaseToken}`)
      console.log(`Subscription ID: ${notification.subscriptionId}`)

      // Find the subscription by purchase token
      const { data: subscription, error: findError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('purchase_token', notification.purchaseToken)
        .single()

      if (findError && findError.code !== 'PGRST116') {
        console.error('Error finding subscription:', findError)
        return new Response('Database error', { 
          status: 500, 
          headers: corsHeaders 
        })
      }

      let subscriptionStatus = 'active'
      let updateData: any = {
        updated_at: new Date().toISOString(),
        rtdn_notification_type: notificationType,
        last_rtdn_timestamp: new Date(parseInt(rtdnMessage.eventTimeMillis)).toISOString()
      }

      // Update status based on notification type
      switch (notification.notificationType) {
        case 1: // SUBSCRIPTION_RECOVERED
        case 2: // SUBSCRIPTION_RENEWED
        case 4: // SUBSCRIPTION_PURCHASED
        case 7: // SUBSCRIPTION_RESTARTED
          subscriptionStatus = 'active'
          break
        case 3: // SUBSCRIPTION_CANCELED
        case 12: // SUBSCRIPTION_REVOKED
        case 13: // SUBSCRIPTION_EXPIRED
          subscriptionStatus = 'cancelled'
          updateData.cancelled_at = new Date().toISOString()
          break
        case 5: // SUBSCRIPTION_ON_HOLD
        case 6: // SUBSCRIPTION_IN_GRACE_PERIOD
        case 10: // SUBSCRIPTION_PAUSED
          subscriptionStatus = 'on_hold'
          break
        default:
          console.log(`Unhandled notification type: ${notification.notificationType}`)
      }

      updateData.status = subscriptionStatus

      if (subscription) {
        // Update existing subscription
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('id', subscription.id)

        if (updateError) {
          console.error('Error updating subscription:', updateError)
          return new Response('Update failed', { 
            status: 500, 
            headers: corsHeaders 
          })
        }

        console.log(`Updated subscription ${subscription.id} to status: ${subscriptionStatus}`)

        // Update user profile subscription status
        if (subscription.user_id) {
          const profileStatus = subscriptionStatus === 'active' ? 'premium' : 'trial'
          
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
              subscription_status: profileStatus,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', subscription.user_id)

          if (profileError) {
            console.error('Error updating profile:', profileError)
          } else {
            console.log(`Updated profile for user ${subscription.user_id} to: ${profileStatus}`)
          }
        }
      } else {
        console.log('Subscription not found for purchase token:', notification.purchaseToken)
        
        // For new subscriptions, we might need to create a record
        // This can happen if RTDN arrives before our validation
        console.log('Consider implementing subscription creation logic for untracked purchases')
      }
    }

    // Process one-time product notifications
    if (rtdnMessage.oneTimeProductNotification) {
      const notification = rtdnMessage.oneTimeProductNotification
      console.log('Processing one-time product notification:', notification)
      
      // Handle one-time purchases if needed
      // This would be for consumable or non-consumable products
    }

    return new Response('OK', { 
      status: 200, 
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('RTDN Webhook error:', error)
    return new Response('Internal Server Error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})