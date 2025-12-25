import { AdMob, RewardAdPluginEvents, AdLoadInfo, AdMobError } from '@capacitor-community/admob';
import type { RewardAdOptions, AdMobRewardItem } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

interface AdMobConfig {
  appId: string;
  rewardedAdUnitId: string;
  testMode: boolean;
}

const AD_CONFIGS: { ios: AdMobConfig; android: AdMobConfig } = {
  ios: {
    appId: 'ca-app-pub-8309637989312333~7793227431',
    rewardedAdUnitId: 'ca-app-pub-8309637989312333/5214810332',
    testMode: false,
  },
  android: {
    appId: 'ca-app-pub-8309637989312333~7793227431',
    rewardedAdUnitId: 'ca-app-pub-8309637989312333/5214810332',
    testMode: false,
  },
};

class AdMobServiceClass {
  private initialized = false;
  private isAdLoaded = false;
  private isAdLoading = false;
  private currentRewardListener: ((reward: boolean) => void) | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[AdMob] Already initialized');
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      console.log('[AdMob] Not a native platform, skipping initialization');
      return;
    }

    try {
      const platform = Capacitor.getPlatform();
      const config = platform === 'ios' ? AD_CONFIGS.ios : AD_CONFIGS.android;

      console.log('[AdMob] Initializing with config:', {
        platform,
        appId: config.appId,
        testMode: config.testMode,
      });

      await AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: config.testMode ? ['YOUR_TEST_DEVICE_ID'] : [],
        initializeForTesting: config.testMode,
      });

      this.initialized = true;
      console.log('[AdMob] Initialized successfully');

      this.setupRewardedAdListeners();
    } catch (error) {
      console.error('[AdMob] Initialization failed:', error);
      throw error;
    }
  }

  private setupRewardedAdListeners(): void {
    AdMob.addListener(RewardAdPluginEvents.Loaded, (info: AdLoadInfo) => {
      console.log('[AdMob] Rewarded ad loaded:', info);
      this.isAdLoaded = true;
      this.isAdLoading = false;
    });

    AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error: AdMobError) => {
      console.error('[AdMob] Rewarded ad failed to load:', error);
      this.isAdLoaded = false;
      this.isAdLoading = false;

      if (this.currentRewardListener) {
        this.currentRewardListener(false);
        this.currentRewardListener = null;
      }
    });

    AdMob.addListener(RewardAdPluginEvents.Showed, () => {
      console.log('[AdMob] Rewarded ad showed');
    });

    AdMob.addListener(RewardAdPluginEvents.FailedToShow, (error: AdMobError) => {
      console.error('[AdMob] Rewarded ad failed to show:', error);
      this.isAdLoaded = false;

      if (this.currentRewardListener) {
        this.currentRewardListener(false);
        this.currentRewardListener = null;
      }
    });

    AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
      console.log('[AdMob] Rewarded ad dismissed');
      this.isAdLoaded = false;

      if (this.currentRewardListener) {
        this.currentRewardListener(false);
        this.currentRewardListener = null;
      }

      this.preloadRewardedAd();
    });

    AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
      console.log('[AdMob] User earned reward:', reward);

      if (this.currentRewardListener) {
        this.currentRewardListener(true);
        this.currentRewardListener = null;
      }
    });
  }

  async preloadRewardedAd(): Promise<void> {
    if (!this.initialized) {
      console.log('[AdMob] Not initialized, cannot preload ad');
      return;
    }

    if (this.isAdLoaded || this.isAdLoading) {
      console.log('[AdMob] Ad already loaded or loading');
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      console.log('[AdMob] Not a native platform, cannot preload ad');
      return;
    }

    try {
      this.isAdLoading = true;
      const platform = Capacitor.getPlatform();
      const config = platform === 'ios' ? AD_CONFIGS.ios : AD_CONFIGS.android;

      const options: RewardAdOptions = {
        adId: config.rewardedAdUnitId,
        isTesting: config.testMode,
      };

      console.log('[AdMob] Preloading rewarded ad...');
      await AdMob.prepareRewardVideoAd(options);
    } catch (error) {
      console.error('[AdMob] Failed to preload rewarded ad:', error);
      this.isAdLoading = false;
      throw error;
    }
  }

  async showRewardedAd(): Promise<boolean> {
    return new Promise(async (resolve) => {
      if (!this.initialized) {
        console.error('[AdMob] Not initialized');
        resolve(false);
        return;
      }

      if (!Capacitor.isNativePlatform()) {
        console.log('[AdMob] Not a native platform, simulating ad');
        setTimeout(() => resolve(true), 2000);
        return;
      }

      try {
        if (!this.isAdLoaded) {
          console.log('[AdMob] Ad not loaded, attempting to load...');
          await this.preloadRewardedAd();

          await new Promise((waitResolve) => {
            const checkInterval = setInterval(() => {
              if (this.isAdLoaded || !this.isAdLoading) {
                clearInterval(checkInterval);
                waitResolve(null);
              }
            }, 500);

            setTimeout(() => {
              clearInterval(checkInterval);
              waitResolve(null);
            }, 10000);
          });

          if (!this.isAdLoaded) {
            console.error('[AdMob] Ad failed to load within timeout');
            resolve(false);
            return;
          }
        }

        this.currentRewardListener = resolve;

        console.log('[AdMob] Showing rewarded ad...');
        await AdMob.showRewardVideoAd();
      } catch (error) {
        console.error('[AdMob] Failed to show rewarded ad:', error);
        this.currentRewardListener = null;
        resolve(false);
      }
    });
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  isAdReady(): boolean {
    return this.isAdLoaded;
  }

  isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }

  updateTestMode(enabled: boolean): void {
    console.log(`[AdMob] Test mode ${enabled ? 'enabled' : 'disabled'}`);
    AD_CONFIGS.ios.testMode = enabled;
    AD_CONFIGS.android.testMode = enabled;
  }

  updateAdUnitIds(ios: string, android: string): void {
    console.log('[AdMob] Updating ad unit IDs');
    AD_CONFIGS.ios.rewardedAdUnitId = ios;
    AD_CONFIGS.android.rewardedAdUnitId = android;
  }

  updateAppIds(ios: string, android: string): void {
    console.log('[AdMob] Updating app IDs');
    AD_CONFIGS.ios.appId = ios;
    AD_CONFIGS.android.appId = android;
  }
}

export const AdMobService = new AdMobServiceClass();
