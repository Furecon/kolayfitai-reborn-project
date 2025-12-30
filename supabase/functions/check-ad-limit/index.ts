import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CheckLimitRequest {
  featureType: 'photo_analysis' | 'diet_plan';
}

interface LimitCheckResult {
  canUse: boolean;
  requiresAd: boolean;
  isPremium: boolean;
  limitReached: boolean;
  currentCount: number;
  maxLimit: number;
  message: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { featureType }: CheckLimitRequest = await req.json();

    if (!featureType) {
      throw new Error("featureType is required");
    }

    // Check if user is premium
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("user_id", user.id)
      .maybeSingle();

    const isPremium = profile?.subscription_status === "premium";

    // Premium users can use everything without ads
    if (isPremium) {
      return new Response(
        JSON.stringify({
          canUse: true,
          requiresAd: false,
          isPremium: true,
          limitReached: false,
          currentCount: 0,
          maxLimit: -1, // unlimited
          message: "Premium user - unlimited access"
        } as LimitCheckResult),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // For FREE users, check limits based on feature type
    const today = new Date().toISOString().split('T')[0];
    
    if (featureType === 'photo_analysis') {
      // Check daily analysis limit (max 3 ads per day - includes both AI and manual)
      const { data: dailyUsage } = await supabase
        .from("daily_usage_limits")
        .select("photo_analysis_ads_watched")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();

      const currentCount = dailyUsage?.photo_analysis_ads_watched || 0;
      const maxLimit = 3;

      if (currentCount >= maxLimit) {
        return new Response(
          JSON.stringify({
            canUse: false,
            requiresAd: false,
            isPremium: false,
            limitReached: true,
            currentCount,
            maxLimit,
            message: "Günlük analiz limitiniz doldu. Yarın tekrar deneyin veya Premium'a geçin."
          } as LimitCheckResult),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          canUse: true,
          requiresAd: true,
          isPremium: false,
          limitReached: false,
          currentCount,
          maxLimit,
          message: `Analiz yapmak için reklam izleyin. Bugün ${maxLimit - currentCount} analiz hakkınız kaldı.`
        } as LimitCheckResult),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (featureType === 'diet_plan') {
      // Check weekly diet plan limit (max 1 ad per week)
      // Get Monday of current week
      const now = new Date();
      const dayOfWeek = now.getDay() || 7; // Sunday = 7
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek + 1);
      const weekStart = monday.toISOString().split('T')[0];

      const { data: weeklyUsage } = await supabase
        .from("weekly_usage_limits")
        .select("diet_plan_ads_watched")
        .eq("user_id", user.id)
        .eq("week_start_date", weekStart)
        .maybeSingle();

      const currentCount = weeklyUsage?.diet_plan_ads_watched || 0;
      const maxLimit = 1;

      if (currentCount >= maxLimit) {
        return new Response(
          JSON.stringify({
            canUse: false,
            requiresAd: false,
            isPremium: false,
            limitReached: true,
            currentCount,
            maxLimit,
            message: "Weekly diet plan limit reached. Try again next Monday or upgrade to Premium."
          } as LimitCheckResult),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          canUse: true,
          requiresAd: true,
          isPremium: false,
          limitReached: false,
          currentCount,
          maxLimit,
          message: "Watch an ad to generate your weekly diet plan."
        } as LimitCheckResult),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    throw new Error(`Unknown feature type: ${featureType}`);

  } catch (error) {
    console.error("Error checking ad limit:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        canUse: false,
        requiresAd: false,
        isPremium: false,
        limitReached: false
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
