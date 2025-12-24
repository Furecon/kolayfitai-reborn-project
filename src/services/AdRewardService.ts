/**
 * Ad Reward Service
 *
 * Manages ad-based reward system for FREE users.
 * Premium users bypass all ad requirements.
 */

import { supabase } from '@/integrations/supabase/client';

export type FeatureType = 'photo_analysis' | 'detailed_analysis' | 'diet_plan';

export interface LimitCheckResult {
  canUse: boolean;
  requiresAd: boolean;
  isPremium: boolean;
  limitReached: boolean;
  currentCount: number;
  maxLimit: number;
  message: string;
}

export interface RecordAdResponse {
  success: boolean;
  rewardGranted: boolean;
  newCount: number;
  maxLimit: number;
  message: string;
}

export class AdRewardService {
  /**
   * Check if user can use a feature and if ad is required
   */
  static async checkAdLimit(featureType: FeatureType): Promise<LimitCheckResult> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('check-ad-limit', {
        body: { featureType }
      });

      if (response.error) {
        throw response.error;
      }

      return response.data as LimitCheckResult;
    } catch (error) {
      console.error('Error checking ad limit:', error);
      throw error;
    }
  }

  /**
   * Record that user watched an ad
   */
  static async recordAdWatch(
    featureType: FeatureType,
    completed: boolean,
    options?: {
      adNetwork?: string;
      adPlacementId?: string;
      adDurationSeconds?: number;
      errorMessage?: string;
    }
  ): Promise<RecordAdResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('record-ad-watch', {
        body: {
          featureType,
          completed,
          ...options
        }
      });

      if (response.error) {
        throw response.error;
      }

      return response.data as RecordAdResponse;
    } catch (error) {
      console.error('Error recording ad watch:', error);
      throw error;
    }
  }

  /**
   * Get user's current daily usage
   */
  static async getDailyUsage(): Promise<{
    photoAnalysisCount: number;
    detailedAnalysisCount: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_usage_limits')
        .select('photo_analysis_ads_watched, detailed_analysis_ads_watched')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error) {
        console.error('Error fetching daily usage:', error);
      }

      return {
        photoAnalysisCount: data?.photo_analysis_ads_watched || 0,
        detailedAnalysisCount: data?.detailed_analysis_ads_watched || 0
      };
    } catch (error) {
      console.error('Error getting daily usage:', error);
      return {
        photoAnalysisCount: 0,
        detailedAnalysisCount: 0
      };
    }
  }

  /**
   * Get user's current weekly usage
   */
  static async getWeeklyUsage(): Promise<{
    dietPlanCount: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      // Get Monday of current week
      const now = new Date();
      const dayOfWeek = now.getDay() || 7; // Sunday = 7
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek + 1);
      const weekStart = monday.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('weekly_usage_limits')
        .select('diet_plan_ads_watched')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStart)
        .maybeSingle();

      if (error) {
        console.error('Error fetching weekly usage:', error);
      }

      return {
        dietPlanCount: data?.diet_plan_ads_watched || 0
      };
    } catch (error) {
      console.error('Error getting weekly usage:', error);
      return {
        dietPlanCount: 0
      };
    }
  }

  /**
   * Check if user is premium
   */
  static async isPremiumUser(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return false;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('user_id', user.id)
        .maybeSingle();

      return profile?.subscription_status === 'premium';
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  /**
   * Get user's ad watch history
   */
  static async getAdHistory(limit: number = 10) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('ad_watch_history')
        .select('*')
        .eq('user_id', user.id)
        .order('watched_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching ad history:', error);
      return [];
    }
  }
}
