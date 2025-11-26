import { Capacitor } from '@capacitor/core';
import { RevenueCatUI, PAYWALL_RESULT } from '@revenuecat/purchases-capacitor-ui';
import { Purchases } from '@revenuecat/purchases-capacitor';

export interface PaywallResult {
  result: 'purchased' | 'restored' | 'cancelled' | 'error';
  error?: string;
  productIdentifier?: string;
}

class PaywallService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('PaywallService already initialized');
      return;
    }

    const isNative = Capacitor.isNativePlatform();

    if (!isNative) {
      console.log('PaywallService: Not running on native platform, skipping initialization');
      this.isInitialized = true;
      return;
    }

    console.log('🎨 Initializing PaywallService...');
    this.isInitialized = true;
  }

  async presentPaywall(): Promise<PaywallResult> {
    const isNative = Capacitor.isNativePlatform();

    if (!isNative) {
      console.warn('⚠️ Paywalls are only available on native platforms');
      return {
        result: 'error',
        error: 'Paywalls are only available on mobile apps'
      };
    }

    try {
      console.log('🎨 Presenting paywall from default offering...');

      // Check if offerings are available first
      try {
        const offerings = await Purchases.getOfferings();
        console.log('📦 Available offerings:', offerings);

        if (!offerings.current) {
          console.error('❌ No current offering found in RevenueCat');
          return {
            result: 'error',
            error: 'Abonelik paketleri yüklenemedi. RevenueCat dashboard\'ında "default" offering\'i kontrol edin.'
          };
        }

        console.log('✅ Current offering found:', offerings.current.identifier);
      } catch (offerError: any) {
        console.error('❌ Error fetching offerings:', offerError);
        return {
          result: 'error',
          error: `Abonelik paketleri yüklenemedi: ${offerError.message}`
        };
      }

      const result = await RevenueCatUI.presentPaywall({
        offering: undefined,
      });

      console.log('✅ Paywall result:', result);

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          const customerInfo = await Purchases.getCustomerInfo();
          console.log('✅ Customer info after purchase:', customerInfo);

          return {
            result: result === PAYWALL_RESULT.PURCHASED ? 'purchased' : 'restored',
            productIdentifier: Object.keys(customerInfo.customerInfo.entitlements.active)[0]
          };

        case PAYWALL_RESULT.CANCELLED:
          console.log('❌ User cancelled paywall');
          return { result: 'cancelled' };

        case PAYWALL_RESULT.ERROR:
          console.error('❌ Paywall returned error status');
          return {
            result: 'error',
            error: 'Abonelik ekranı gösterilemedi. Lütfen internet bağlantınızı kontrol edin.'
          };

        default:
          return { result: 'cancelled' };
      }

    } catch (error: any) {
      console.error('❌ Failed to present paywall:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });

      return {
        result: 'error',
        error: `Paywall hatası: ${error.message || 'Bilinmeyen hata'}`
      };
    }
  }

  async presentPaywallIfNeeded(): Promise<PaywallResult> {
    const isNative = Capacitor.isNativePlatform();

    if (!isNative) {
      return {
        result: 'error',
        error: 'Paywalls are only available on mobile apps'
      };
    }

    try {
      console.log('🎨 Presenting paywall if needed (checking entitlements)...');

      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: 'premium',
      });

      console.log('✅ PaywallIfNeeded result:', result);

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          const customerInfo = await Purchases.getCustomerInfo();
          return {
            result: result === PAYWALL_RESULT.PURCHASED ? 'purchased' : 'restored',
            productIdentifier: Object.keys(customerInfo.customerInfo.entitlements.active)[0]
          };

        case PAYWALL_RESULT.CANCELLED:
          return { result: 'cancelled' };

        case PAYWALL_RESULT.ERROR:
          return {
            result: 'error',
            error: 'An error occurred while displaying the paywall'
          };

        default:
          return { result: 'cancelled' };
      }

    } catch (error: any) {
      console.error('❌ Failed to present paywall if needed:', error);
      return {
        result: 'error',
        error: error.message || 'Failed to display paywall'
      };
    }
  }

  isAvailable(): boolean {
    return Capacitor.isNativePlatform() && this.isInitialized;
  }
}

export const paywallService = new PaywallService();
