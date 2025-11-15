import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

/**
 * Store Rating Service
 *
 * Manages in-app rating prompts for Android (Google Play) and iOS (App Store)
 * Uses smart timing to ask for ratings at the right moment
 */
class StoreRatingService {
  private static instance: StoreRatingService;
  private hasShownRatingPrompt = false;

  private constructor() {}

  static getInstance(): StoreRatingService {
    if (!StoreRatingService.instance) {
      StoreRatingService.instance = new StoreRatingService();
    }
    return StoreRatingService.instance;
  }

  /**
   * Check if we should show the rating prompt
   * Criteria:
   * - User has used the app for at least 3 days
   * - User has completed at least 5 food analyses
   * - User hasn't been prompted in the last 30 days
   * - User hasn't permanently dismissed the prompt
   */
  async shouldShowRatingPrompt(userId: string): Promise<boolean> {
    if (this.hasShownRatingPrompt) {
      return false;
    }

    try {
      // Check user's activity
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at, last_rating_prompt_date, rating_prompt_dismissed')
        .eq('user_id', userId)
        .single();

      if (!profile) {
        return false;
      }

      // Don't show if user permanently dismissed
      if (profile.rating_prompt_dismissed) {
        return false;
      }

      // Check if prompted in last 30 days
      if (profile.last_rating_prompt_date) {
        const daysSinceLastPrompt = Math.floor(
          (Date.now() - new Date(profile.last_rating_prompt_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastPrompt < 30) {
          return false;
        }
      }

      // Check how long user has been using the app
      const accountAge = Math.floor(
        (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (accountAge < 3) {
        return false;
      }

      // Check number of meal logs (user engagement)
      const { count } = await supabase
        .from('meal_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (!count || count < 5) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking rating prompt eligibility:', error);
      return false;
    }
  }

  /**
   * Request rating from user
   * Opens native store rating dialog
   */
  async requestRating(userId: string): Promise<void> {
    const platform = Capacitor.getPlatform();
    const isNative = Capacitor.isNativePlatform();

    // Update last prompt date
    await this.updateRatingPromptDate(userId);
    this.hasShownRatingPrompt = true;

    if (!isNative) {
      // Web fallback - open store page
      window.open('https://kolayfit.app/rate', '_blank');
      return;
    }

    try {
      if (platform === 'android') {
        // For Android, we can use the In-App Review API through a Capacitor plugin
        // Or open Play Store directly
        await this.openPlayStore();
      } else if (platform === 'ios') {
        // For iOS, we would use StoreKit's SKStoreReviewController
        // This would require a native plugin
        await this.openAppStore();
      }
    } catch (error) {
      console.error('Error requesting rating:', error);
    }
  }

  /**
   * Open Google Play Store to app page
   */
  private async openPlayStore(): Promise<void> {
    const packageName = 'com.kolayfit.app';
    const playStoreUrl = `https://play.google.com/store/apps/details?id=${packageName}`;

    try {
      // Try to open Play Store app first
      const playStoreAppUrl = `market://details?id=${packageName}`;
      window.open(playStoreAppUrl, '_system');
    } catch {
      // Fallback to browser
      window.open(playStoreUrl, '_blank');
    }
  }

  /**
   * Open App Store to app page
   */
  private async openAppStore(): Promise<void> {
    // Replace with your actual App Store ID when available
    const appId = 'YOUR_APP_STORE_ID';
    const appStoreUrl = `https://apps.apple.com/app/id${appId}?action=write-review`;
    window.open(appStoreUrl, '_blank');
  }

  /**
   * Update the last rating prompt date
   */
  private async updateRatingPromptDate(userId: string): Promise<void> {
    try {
      await supabase
        .from('profiles')
        .update({ last_rating_prompt_date: new Date().toISOString() })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating rating prompt date:', error);
    }
  }

  /**
   * Mark rating prompt as permanently dismissed
   */
  async dismissRatingPrompt(userId: string): Promise<void> {
    try {
      await supabase
        .from('profiles')
        .update({
          rating_prompt_dismissed: true,
          last_rating_prompt_date: new Date().toISOString()
        })
        .eq('user_id', userId);

      this.hasShownRatingPrompt = true;
    } catch (error) {
      console.error('Error dismissing rating prompt:', error);
    }
  }

  /**
   * Get store URL based on platform
   */
  getStoreUrl(): string {
    const platform = Capacitor.getPlatform();

    if (platform === 'android') {
      return 'https://play.google.com/store/apps/details?id=com.kolayfit.app';
    } else if (platform === 'ios') {
      return 'https://apps.apple.com/app/idYOUR_APP_STORE_ID';
    }

    return 'https://kolayfit.app';
  }
}

export const storeRatingService = StoreRatingService.getInstance();
