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
    rewardedAdUnitId: 'ca-app-pub-8309637989312333/6264168129',
    testMode: false,
  },
  android: {
    appId: 'ca-app-pub-8309637989312333~7793227431',
    rewardedAdUnitId: 'ca-app-pub-8309637989312333/5214810332',
    testMode: false,
  },
};

const TEST_AD_UNIT_IDS = {
  ios: 'ca-app-pub-3940256099942544/1712485313',
  android: 'ca-app-pub-3940256099942544/5224354917',
};

class AdMobServiceClass {
  private initialized = false;
  private isAdLoaded = false;
  private isAdLoading = false;
  private currentRewardListener: ((reward: boolean) => void) | null = null;
  private lastError: string | null = null;
  private adLoadAttempts = 0;
  private maxAdLoadAttempts = 3;

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
        testingDevices: config.testMode ? ['DEVICE_ID_EMULATOR'] : [],
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
      this.adLoadAttempts = 0;
      this.lastError = null;
    });

    AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error: AdMobError) => {
      console.error('[AdMob] Rewarded ad failed to load:', error);
      this.isAdLoaded = false;
      this.isAdLoading = false;
      this.adLoadAttempts++;

      const errorCode = (error as any).code || 0;
      if (errorCode === 3) {
        this.lastError = 'Şu anda gösterilecek reklam yok. Lütfen birkaç dakika sonra tekrar deneyin veya Premium üyeliğe geçin.';
      } else {
        this.lastError = `Reklam yüklenemedi: ${error.message || 'Bilinmeyen hata'}`;
      }

      if (this.currentRewardListener) {
        this.currentRewardListener(false);
        this.currentRewardListener = null;
      }

      if (this.adLoadAttempts < this.maxAdLoadAttempts) {
        console.log(`[AdMob] Retrying ad load (${this.adLoadAttempts}/${this.maxAdLoadAttempts})...`);
        setTimeout(() => this.preloadRewardedAd(), 2000);
      }
    });

    AdMob.addListener(RewardAdPluginEvents.Showed, () => {
      console.log('[AdMob] Rewarded ad showed');
    });

    AdMob.addListener(RewardAdPluginEvents.FailedToShow, (error: AdMobError) => {
      console.error('[AdMob] Rewarded ad failed to show:', error);
      this.isAdLoaded = false;
      this.lastError = `Reklam gösterilemedi: ${error.message || 'Bilinmeyen hata'}`;

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

      const adUnitId = config.testMode
        ? TEST_AD_UNIT_IDS[platform as 'ios' | 'android']
        : config.rewardedAdUnitId;

      const options: RewardAdOptions = {
        adId: adUnitId,
        isTesting: config.testMode,
      };

      console.log('[AdMob] Preloading rewarded ad...', {
        testMode: config.testMode,
        adUnitId
      });
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
          console.log('[AdMob] Current state - isAdLoading:', this.isAdLoading, 'isAdLoaded:', this.isAdLoaded);

          await this.preloadRewardedAd();

          await new Promise((waitResolve) => {
            let attempts = 0;
            const checkInterval = setInterval(() => {
              attempts++;
              console.log(`[AdMob] Waiting for ad (attempt ${attempts}/60)`);

              if (this.isAdLoaded || !this.isAdLoading) {
                console.log('[AdMob] Ad ready or loading stopped');
                clearInterval(checkInterval);
                waitResolve(null);
              }
            }, 500);

            setTimeout(() => {
              clearInterval(checkInterval);
              console.log('[AdMob] Wait timeout reached');
              waitResolve(null);
            }, 30000);
          });

          if (!this.isAdLoaded) {
            console.error('[AdMob] Ad failed to load within timeout');
            console.error('[AdMob] Final state - isAdLoading:', this.isAdLoading, 'isAdLoaded:', this.isAdLoaded);
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

  getLastError(): string | null {
    return this.lastError;
  }

  clearLastError(): void {
    this.lastError = null;
  }

  isTestMode(): boolean {
    const platform = Capacitor.getPlatform();
    const config = platform === 'ios' ? AD_CONFIGS.ios : AD_CONFIGS.android;
    return config.testMode;
  }
}

export const AdMobService = new AdMobServiceClass();
