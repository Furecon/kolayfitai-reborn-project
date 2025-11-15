import { Capacitor } from '@capacitor/core';

// RevenueCat UI plugin - will be available on native platforms
let RevenueCatUI: any = null;

// Try to import RevenueCat UI plugin (only available on native)
if (Capacitor.isNativePlatform()) {
  import('@revenuecat/purchases-capacitor-ui')
    .then((module) => {
      RevenueCatUI = module.RevenueCatUI;
      console.log('✅ RevenueCat UI plugin loaded for Customer Center');
    })
    .catch((error) => {
      console.warn('⚠️ RevenueCat UI plugin not available:', error);
    });
}

/**
 * Customer Center Service
 *
 * The Customer Center is a pre-built UI component that allows users to:
 * - View their subscription details
 * - Manage their subscription (upgrade, downgrade, cancel)
 * - See billing history
 * - Access promotional offers
 * - Contact support
 *
 * Documentation: https://www.revenuecat.com/docs/tools/customer-center
 */
class CustomerCenterService {
  private static instance: CustomerCenterService;

  private constructor() {}

  static getInstance(): CustomerCenterService {
    if (!CustomerCenterService.instance) {
      CustomerCenterService.instance = new CustomerCenterService();
    }
    return CustomerCenterService.instance;
  }

  /**
   * Present the Customer Center
   * This shows a full-screen modal where users can manage their subscription
   *
   * @returns Promise<void>
   */
  async presentCustomerCenter(): Promise<void> {
    const isNative = Capacitor.isNativePlatform();

    if (!isNative) {
      console.warn('⚠️ Customer Center is only available on native platforms');
      throw new Error('Customer Center is only available on mobile apps');
    }

    if (!RevenueCatUI) {
      console.warn('⚠️ RevenueCat UI not available');
      throw new Error('RevenueCat UI not initialized');
    }

    try {
      console.log('🎯 Presenting Customer Center...');

      await RevenueCatUI.presentCustomerCenter();

      console.log('✅ Customer Center presented successfully');
    } catch (error: any) {
      console.error('❌ Failed to present Customer Center:', error);
      throw new Error(error.message || 'Failed to open Customer Center');
    }
  }

  /**
   * Check if Customer Center is available
   * @returns true if Customer Center can be displayed
   */
  isAvailable(): boolean {
    return Capacitor.isNativePlatform() && RevenueCatUI !== null;
  }

  /**
   * Get the URL to manage subscription in the app store
   * This is useful for web fallback or direct linking
   *
   * For Android: Links to Google Play subscription management
   * For iOS: Links to App Store subscription management
   */
  getStoreManagementURL(): string {
    const isNative = Capacitor.isNativePlatform();
    const platform = Capacitor.getPlatform();

    if (!isNative) {
      return 'https://kolayfit.app/subscriptions';
    }

    if (platform === 'android') {
      // Google Play subscription management
      return 'https://play.google.com/store/account/subscriptions?package=com.kolayfit.app';
    } else if (platform === 'ios') {
      // App Store subscription management
      return 'https://apps.apple.com/account/subscriptions';
    }

    return 'https://kolayfit.app/subscriptions';
  }
}

export const customerCenterService = CustomerCenterService.getInstance();
