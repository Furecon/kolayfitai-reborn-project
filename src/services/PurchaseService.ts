import { supabase } from '@/integrations/supabase/client';
import { Capacitor } from '@capacitor/core';
import { paywallService } from './PaywallService';

// RevenueCat Purchases plugin - will be available on native platforms
let Purchases: any = null;

// Try to import Purchases plugin (only available on native)
if (Capacitor.isNativePlatform()) {
  import('@revenuecat/purchases-capacitor')
    .then((module) => {
      Purchases = module.Purchases;
      console.log('✅ RevenueCat Purchases plugin loaded');
    })
    .catch((error) => {
      console.warn('⚠️ RevenueCat Purchases plugin not available:', error);
    });
}

export interface PurchaseProduct {
  productIdentifier: string;
  title: string;
  description: string;
  price: string;
  priceAmountMicros?: number;
  currencyCode: string;
}

export class PurchaseService {
  private static instance: PurchaseService;
  private products: PurchaseProduct[] = [];
  private isInitialized = false;

  private constructor() {}

  static getInstance(): PurchaseService {
    if (!PurchaseService.instance) {
      PurchaseService.instance = new PurchaseService();
    }
    return PurchaseService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Purchase service already initialized');
      return;
    }

    const isNative = Capacitor.isNativePlatform();
    console.log(`🚀 Initializing purchase service for ${isNative ? 'native' : 'web'} platform`);

    if (isNative && Purchases) {
      try {
        // RevenueCat API Keys
        // Production: goog_JmFVcxazPsmfZigZlmVZwbAiXWA
        // Test/Sandbox: test_ZXdniENlMjfZcXxZKRFvITNyJda

        // Detect if we're in debug/test mode
        const isDebugMode = import.meta.env.DEV || import.meta.env.MODE === 'development';

        const REVENUECAT_PRODUCTION_KEY = 'goog_JmFVcxazPsmfZigZlmVZwbAiXWA';
        const REVENUECAT_TEST_KEY = 'test_ZXdniENlMjfZcXxZKRFvITNyJda';

        // Use test key for sandbox/debug, production key for release
        const REVENUECAT_API_KEY = isDebugMode ? REVENUECAT_TEST_KEY : REVENUECAT_PRODUCTION_KEY;

        console.log(`🔑 Using RevenueCat ${isDebugMode ? 'TEST/SANDBOX' : 'PRODUCTION'} API key`);

        if (REVENUECAT_API_KEY === 'YOUR_REVENUECAT_ANDROID_KEY_HERE') {
          console.warn('⚠️ RevenueCat API key not configured!');
          console.warn('📝 Please visit https://app.revenuecat.com/ to:');
          console.warn('   1. Create a new app');
          console.warn('   2. Get your API key');
          console.warn('   3. Configure products with IDs: monthly_premium:monthly-premium, yearly_premium:yearly-premium');
        } else {
          // Configure RevenueCat
          await Purchases.configure({
            apiKey: REVENUECAT_API_KEY,
            appUserID: undefined, // We'll set this when user logs in
          });

          console.log(`✅ RevenueCat configured successfully in ${isDebugMode ? 'SANDBOX' : 'PRODUCTION'} mode`);

          await paywallService.initialize();
        }
      } catch (error) {
        console.error('❌ Failed to configure RevenueCat:', error);
      }
    }

    await this.loadProducts();
    this.isInitialized = true;
    console.log('✅ Purchase service initialized');
  }

  async loadProducts(): Promise<void> {
    const isNative = Capacitor.isNativePlatform();

    if (isNative && Purchases) {
      try {
        // Load products from RevenueCat/Google Play
        console.log('📦 Loading products from RevenueCat...');

        const offerings = await Purchases.getOfferings();
        console.log('📦 Offerings:', offerings);

        if (offerings.current) {
          const packages = offerings.current.availablePackages;
          this.products = packages.map((pkg: any) => ({
            productIdentifier: pkg.product.identifier,
            title: pkg.product.title,
            description: pkg.product.description,
            price: pkg.product.priceString,
            priceAmountMicros: pkg.product.price * 1000000,
            currencyCode: pkg.product.currencyCode
          }));

          console.log('✅ Loaded products from RevenueCat:', this.products);
        } else {
          console.warn('⚠️ No offerings available from RevenueCat');
          this.loadFallbackProducts();
        }
      } catch (error) {
        console.error('❌ Failed to load products from RevenueCat:', error);
        this.loadFallbackProducts();
      }
    } else {
      // Web platform - use static products
      this.loadFallbackProducts();
    }
  }

  private loadFallbackProducts(): void {
    console.log('📦 Loading fallback products');
    this.products = [
      {
        productIdentifier: 'monthly_premium:monthly-premium',
        title: 'KolayFit Premium - Aylık',
        description: 'Aylık premium abonelik',
        price: '149,99 ₺',
        priceAmountMicros: 149990000,
        currencyCode: 'TRY'
      },
      {
        productIdentifier: 'yearly_premium:yearly-premium',
        title: 'KolayFit Premium - Yıllık',
        description: 'Yıllık premium abonelik (%17 indirim)',
        price: '1.499,99 ₺',
        priceAmountMicros: 1499990000,
        currencyCode: 'TRY'
      }
    ];
  }

  async purchaseWithPaywall(userId: string): Promise<boolean> {
    console.log('🎨 Starting purchase with paywall:', { userId });

    const isNative = Capacitor.isNativePlatform();

    if (!isNative) {
      console.warn('⚠️ Paywalls are only available on native platforms');
      throw new Error('Abonelik satın alma sadece mobil uygulamada yapılabilir.');
    }

    if (!paywallService.isAvailable()) {
      console.warn('⚠️ Paywall service not available');
      throw new Error('Abonelik servisi başlatılamadı. Lütfen uygulamayı yeniden başlatın.');
    }

    try {
      if (Purchases) {
        await Purchases.logIn({ appUserID: userId });
        console.log('✅ User logged in to RevenueCat');
      }

      const result = await paywallService.presentPaywall();

      // If there's an error result, throw it
      if (result.result === 'error') {
        throw new Error(result.error || 'Paywall gösterilemedi');
      }

      if (result.result === 'purchased' || result.result === 'restored') {
        console.log('✅ Purchase successful via paywall');

        if (result.productIdentifier) {
          const purchaseInfo = {
            purchaseToken: userId,
            orderId: `paywall_${Date.now()}`,
            productId: result.productIdentifier,
            purchaseTime: Date.now(),
            packageName: 'com.kolayfit.app',
            receipt: JSON.stringify({ source: 'paywall', result })
          };

          await this.validatePurchase(purchaseInfo, result.productIdentifier, userId);
        }

        return true;
      }

      // Cancelled
      return false;
    } catch (error: any) {
      console.error('❌ Paywall purchase failed:', error);
      // Re-throw with a user-friendly message
      throw new Error(error.message || 'Satın alma işlemi başarısız oldu');
    }
  }

  async purchaseProduct(productId: string, userId: string): Promise<boolean> {
    console.log('🛒 Starting purchase process:', { productId, userId });

    const isNative = Capacitor.isNativePlatform();

    if (isNative && Purchases) {
      // Native Android purchase flow with RevenueCat
      try {
        console.log('📱 Starting native purchase flow...');

        // Set user ID
        await Purchases.logIn({ appUserID: userId });
        console.log('✅ User logged in to RevenueCat');

        // Try to get offerings first (recommended way)
        let purchaseResult;
        try {
          const offerings = await Purchases.getOfferings();

          if (offerings.current && offerings.current.availablePackages.length > 0) {
            // Find the package
            const pkg = offerings.current.availablePackages.find(
              (p: any) => p.product.identifier === productId
            );

            if (pkg) {
              console.log('🛍️ Purchasing via package:', pkg.identifier);
              purchaseResult = await Purchases.purchasePackage({
                aPackage: pkg
              });
            } else {
              console.log('⚠️ Product not found in packages, trying direct purchase...');
              throw new Error('Package not found, trying direct purchase');
            }
          } else {
            console.log('⚠️ No offerings available, trying direct purchase...');
            throw new Error('No offerings, trying direct purchase');
          }
        } catch (offeringError) {
          // Fallback: Try direct product purchase
          console.log('🔄 Attempting direct product purchase with ID:', productId);

          try {
            // Purchase directly using product ID
            purchaseResult = await Purchases.purchaseStoreProduct({
              product: productId
            });
            console.log('✅ Direct purchase successful');
          } catch (directError) {
            console.error('❌ Direct purchase also failed:', directError);
            throw new Error(`Product ${productId} not found. Please configure it in RevenueCat dashboard.`);
          }
        }

        console.log('✅ Purchase successful:', purchaseResult);

        // Extract purchase info
        const purchaseInfo = {
          purchaseToken: purchaseResult.customerInfo.originalAppUserId,
          orderId: purchaseResult.transaction?.transactionIdentifier || `order_${Date.now()}`,
          productId,
          purchaseTime: Date.now(),
          packageName: 'com.kolayfit.app',
          receipt: JSON.stringify(purchaseResult)
        };

        // Validate with backend
        const validationResult = await this.validatePurchase(purchaseInfo, productId, userId);
        return validationResult;

      } catch (error: any) {
        console.error('❌ Native purchase failed:', error);

        // Check if user cancelled
        if (error.code === 'PURCHASE_CANCELLED' || error.userCancelled) {
          console.log('ℹ️ User cancelled purchase');
          throw new Error('Satın alma iptal edildi');
        }

        throw new Error(error.message || 'Satın alma başarısız oldu');
      }
    } else {
      // Web platform - mock purchase flow
      console.log('🌐 Web platform detected - using mock purchase flow');

      const mockPurchaseInfo = {
        receipt: `mock_receipt_${Date.now()}`,
        purchaseToken: `mock_token_${Date.now()}`,
        orderId: `mock_order_${Date.now()}`,
        productId,
        purchaseTime: Date.now(),
        packageName: 'com.kolayfit.app'
      };

      const validationResult = await this.validatePurchase(mockPurchaseInfo, productId, userId);
      return validationResult;
    }
  }

  private async validatePurchase(
    purchaseResult: any,
    productId: string,
    userId: string
  ): Promise<boolean> {
    try {
      console.log('🔍 Validating purchase with backend...');

      const { data, error } = await supabase.functions.invoke('subscription-manager', {
        body: {
          method: 'POST',
          action: 'validate_purchase',
          userId,
          receiptData: {
            purchaseToken: purchaseResult.purchaseToken || purchaseResult.receipt,
            orderId: purchaseResult.orderId || `order_${Date.now()}`,
            productId,
            purchaseTime: purchaseResult.purchaseTime || Date.now(),
            packageName: purchaseResult.packageName || 'com.kolayfit.app',
            receipt: purchaseResult.receipt
          },
          productId
        }
      });

      if (error) {
        console.error('❌ Backend validation error:', error);
        return false;
      }

      if (data?.success) {
        console.log('✅ Purchase validation successful');
        return true;
      } else {
        console.error('❌ Purchase validation failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Purchase validation error:', error);
      return false;
    }
  }

  async restorePurchases(): Promise<boolean> {
    console.log('🔄 Restoring purchases...');

    const isNative = Capacitor.isNativePlatform();

    if (isNative && Purchases) {
      try {
        // Restore purchases through RevenueCat
        const customerInfo = await Purchases.restorePurchases();
        console.log('✅ Purchases restored:', customerInfo);

        // Check if user has active subscriptions
        const activeSubscriptions = customerInfo.customerInfo.activeSubscriptions || [];

        if (activeSubscriptions.length > 0) {
          console.log('✅ Found active subscriptions:', activeSubscriptions);

          // Update profile in database
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase
              .from('profiles')
              .update({ subscription_status: 'premium' })
              .eq('user_id', user.id);

            if (error) {
              console.error('❌ Failed to update profile:', error);
            }
          }

          return true;
        } else {
          console.log('ℹ️ No active subscriptions found');
          return false;
        }
      } catch (error) {
        console.error('❌ Restore purchases failed:', error);
        return false;
      }
    } else {
      // Web platform - check database
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('❌ No authenticated user found');
          return false;
        }

        const { data: subscriptions, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Failed to check subscriptions:', error);
          return false;
        }

        if (!subscriptions || subscriptions.length === 0) {
          console.log('ℹ️ No active subscriptions found to restore');
          return false;
        }

        const activeSubscription = subscriptions[0];
        console.log('✅ Found active subscription to restore');

        const { error: profileError } = await supabase
          .from('profiles')
          .update({ subscription_status: 'premium' })
          .eq('user_id', user.id);

        if (profileError) {
          console.error('❌ Failed to update profile status:', profileError);
        }

        console.log('✅ Restore completed successfully');
        return true;

      } catch (error) {
        console.error('❌ Restore failed:', error);
        return false;
      }
    }
  }

  getProducts(): PurchaseProduct[] {
    return this.products;
  }

  getProduct(productId: string): PurchaseProduct | undefined {
    return this.products.find(product => product.productIdentifier === productId);
  }

  isAvailable(): boolean {
    return true;
  }
}

export const purchaseService = PurchaseService.getInstance();
