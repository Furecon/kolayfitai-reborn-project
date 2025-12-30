import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RecordAdRequest {
  featureType: 'photo_analysis' | 'diet_plan';
  adNetwork?: string;
  adPlacementId?: string;
  adDurationSeconds?: number;
  completed: boolean;
  errorMessage?: string;
}

interface RecordAdResponse {
  success: boolean;
  rewardGranted: boolean;
  newCount: number;
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

    const requestData: RecordAdRequest = await req.json();
    const { 
      featureType, 
      adNetwork, 
      adPlacementId, 
      adDurationSeconds, 
      completed,
      errorMessage 
    } = requestData;

    if (!featureType) {
      throw new Error("featureType is required");
    }

    // Check if user is premium (shouldn't be recording ads)
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("user_id", user.id)
      .maybeSingle();

    const isPremium = profile?.subscription_status === "premium";

    if (isPremium) {
      return new Response(
        JSON.stringify({
          success: false,
          rewardGranted: false,
          newCount: 0,
          maxLimit: -1,
          message: "Premium users don't need to watch ads"
        } as RecordAdResponse),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Only grant reward if ad was completed
    const rewardGranted = completed && !errorMessage;

    // Record ad watch in history
    await supabase.from("ad_watch_history").insert({
      user_id: user.id,
      ad_type: featureType,
      feature_unlocked: featureType,
      ad_network: adNetwork || null,
      ad_placement_id: adPlacementId || null,
      ad_duration_seconds: adDurationSeconds || null,
      completed,
      reward_granted: rewardGranted,
      error_message: errorMessage || null,
      watched_at: new Date().toISOString()
    });

    // If ad wasn't completed, don't increment counters
    if (!rewardGranted) {
      return new Response(
        JSON.stringify({
          success: true,
          rewardGranted: false,
          newCount: 0,
          maxLimit: 0,
          message: errorMessage || "Ad was not completed"
        } as RecordAdResponse),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Update usage limits based on feature type
    const today = new Date().toISOString().split('T')[0];

    if (featureType === 'photo_analysis') {
      // Increment daily analysis count (includes both AI and manual)
      const { data: existing } = await supabase
        .from("daily_usage_limits")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();

      let newCount = 1;
      const maxLimit = 3;

      if (existing) {
        newCount = existing.photo_analysis_ads_watched + 1;
        await supabase
          .from("daily_usage_limits")
          .update({
            photo_analysis_ads_watched: Math.min(newCount, maxLimit),
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("daily_usage_limits")
          .insert({
            user_id: user.id,
            date: today,
            photo_analysis_ads_watched: newCount
          });
      }

      return new Response(
        JSON.stringify({
          success: true,
          rewardGranted: true,
          newCount: Math.min(newCount, maxLimit),
          maxLimit,
          message: `Analiz aktif edildi! Bugün ${maxLimit - newCount} analiz hakkınız kaldı.`
        } as RecordAdResponse),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (featureType === 'diet_plan') {
      // Increment weekly diet plan count
      // Get Monday of current week
      const now = new Date();
      const dayOfWeek = now.getDay() || 7; // Sunday = 7
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek + 1);
      const weekStart = monday.toISOString().split('T')[0];

      const { data: existing } = await supabase
        .from("weekly_usage_limits")
        .select("*")
        .eq("user_id", user.id)
        .eq("week_start_date", weekStart)
        .maybeSingle();

      const maxLimit = 1;

      if (existing) {
        if (existing.diet_plan_ads_watched >= maxLimit) {
          return new Response(
            JSON.stringify({
              success: false,
              rewardGranted: false,
              newCount: maxLimit,
              maxLimit,
              message: "Weekly diet plan limit already reached"
            } as RecordAdResponse),
            {
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              },
            }
          );
        }

        await supabase
          .from("weekly_usage_limits")
          .update({ 
            diet_plan_ads_watched: maxLimit,
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("weekly_usage_limits")
          .insert({
            user_id: user.id,
            week_start_date: weekStart,
            diet_plan_ads_watched: 1
          });
      }

      return new Response(
        JSON.stringify({
          success: true,
          rewardGranted: true,
          newCount: maxLimit,
          maxLimit,
          message: "Diet plan unlocked for this week!"
        } as RecordAdResponse),
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
    console.error("Error recording ad watch:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        rewardGranted: false,
        error: error.message 
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
