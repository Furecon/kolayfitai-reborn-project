import { supabase } from '@/integrations/supabase/client';

class MealReplacementServiceClass {
  private readonly REPLACEMENTS_BEFORE_AD = 1;

  async checkNeedsAd(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('meal_replacements_since_last_ad')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('[MealReplacement] Error checking ad requirement:', error);
        return false;
      }

      if (!data) {
        await this.initializeCounter(userId);
        return false;
      }

      return (data.meal_replacements_since_last_ad || 0) >= this.REPLACEMENTS_BEFORE_AD;
    } catch (error) {
      console.error('[MealReplacement] Error in checkNeedsAd:', error);
      return false;
    }
  }

  async incrementCounter(userId: string): Promise<void> {
    try {
      const { data, error: fetchError } = await supabase
        .from('user_preferences')
        .select('meal_replacements_since_last_ad')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('[MealReplacement] Error fetching counter:', fetchError);
        return;
      }

      if (!data) {
        await this.initializeCounter(userId);
        return;
      }

      const newCount = (data.meal_replacements_since_last_ad || 0) + 1;

      const { error: updateError } = await supabase
        .from('user_preferences')
        .update({ meal_replacements_since_last_ad: newCount })
        .eq('user_id', userId);

      if (updateError) {
        console.error('[MealReplacement] Error incrementing counter:', updateError);
      }
    } catch (error) {
      console.error('[MealReplacement] Error in incrementCounter:', error);
    }
  }

  async resetCounter(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ meal_replacements_since_last_ad: 0 })
        .eq('user_id', userId);

      if (error) {
        console.error('[MealReplacement] Error resetting counter:', error);
      }
    } catch (error) {
      console.error('[MealReplacement] Error in resetCounter:', error);
    }
  }

  private async initializeCounter(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: userId,
            meal_replacements_since_last_ad: 1,
          },
          {
            onConflict: 'user_id',
          }
        );

      if (error) {
        console.error('[MealReplacement] Error initializing counter:', error);
      }
    } catch (error) {
      console.error('[MealReplacement] Error in initializeCounter:', error);
    }
  }

  async getCounter(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('meal_replacements_since_last_ad')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) {
        return 0;
      }

      return data.meal_replacements_since_last_ad || 0;
    } catch (error) {
      console.error('[MealReplacement] Error in getCounter:', error);
      return 0;
    }
  }
}

export const MealReplacementService = new MealReplacementServiceClass();
