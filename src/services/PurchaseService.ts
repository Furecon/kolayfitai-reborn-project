import { NativePurchases } from '@capgo/native-purchases';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

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

  private constructor() {}

  static getInstance(): PurchaseService {
    if (!PurchaseService.instance) {
      PurchaseService.instance = new PurchaseService();
    }
    return PurchaseService.instance;
  }

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Native purchases not available on web platform');
      return;
    }

    try {
      console.log('Google Play Billing initialized for native platform');
      
      // Load available products
      await this.loadProducts();
      
      console.log('Google Play Billing setup completed');
    } catch (error) {
      console.error('Failed to initialize Google Play Billing:', error);
      throw error;
    }
  }

  async loadProducts(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      // Mock data for web testing
      this.products = [
        {
          productIdentifier: 'monthly_119_99',
          title: 'KolayFit Premium - Aylık',
          description: 'Aylık premium abonelik',
          price: '119,99 ₺',
          priceAmountMicros: 119990000,
          currencyCode: 'TRY'
        },
        {
          productIdentifier: 'yearly_1199_99',
          title: 'KolayFit Premium - Yıllık',
          description: 'Yıllık premium abonelik (%17 indirim)',
          price: '1.199,99 ₺',
          priceAmountMicros: 1199990000,
          currencyCode: 'TRY'
        }
      ];
      return;
    }

    try {
      const productIdentifiers = ['monthly_119_99', 'yearly_1199_99'];
      const result = await NativePurchases.getProducts({ 
        productIdentifiers 
      });
      
      if (result && (result as any).products) {
        this.products = (result as any).products.map((product: any) => ({
          productIdentifier: product.productIdentifier || product.id,
          title: product.title || '',
          description: product.description || '',
          price: String(product.price || ''),
          priceAmountMicros: product.priceAmountMicros,
          currencyCode: product.currencyCode || 'TRY'
        }));
      }

      console.log('Loaded products:', this.products);
    } catch (error) {
      console.error('Failed to load products:', error);
      // Continue with empty products array on error
      this.products = [];
    }
  }

  async purchaseProduct(productId: string, userId: string): Promise<boolean> {
    console.log('🛒 Starting purchase process:', { productId, userId });
    
    if (!Capacitor.isNativePlatform()) {
      // Mock purchase for web testing
      console.log('🌐 Web platform detected - using mock purchase flow');
      return this.handleMockPurchase(productId, userId);
    }

    try {
      console.log('📱 Native platform - initiating Google Play purchase');
      
      const result = await NativePurchases.purchaseProduct({ 
        productIdentifier: productId 
      });

      if (result && result.receipt) {
        console.log('✅ Google Play purchase successful');
        console.log('🎫 Purchase details:', {
          productId,
          receiptLength: result.receipt?.length || 0,
          hasReceipt: !!result.receipt
        });
        
        // Validate purchase with backend
        const isValid = await this.validatePurchase(
          result,
          productId,
          userId
        );
        
        if (isValid) {
          console.log('✅ Purchase validation successful - user now has premium access');
          return true;
        } else {
          console.error('❌ Purchase validation failed');
          return false;
        }
      } else {
        console.log('🚫 Purchase cancelled or failed by user');
        return false;
      }
    } catch (error) {
      console.error('💥 Google Play purchase error:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      return false;
    }
  }

  private async handleMockPurchase(productId: string, userId: string): Promise<boolean> {
    console.log('🧪 Handling mock purchase for testing:', { productId, userId });
    
    // Mock purchase data for web testing
    const mockPurchaseInfo = {
      receipt: `mock_receipt_${Date.now()}`,
      purchaseToken: `mock_token_${Date.now()}`,
      orderId: `mock_order_${Date.now()}`,
      productId,
      purchaseTime: Date.now(),
      packageName: 'com.kolayfit.app'
    };

    console.log('📦 Generated mock purchase data:', {
      orderId: mockPurchaseInfo.orderId,
      tokenPrefix: mockPurchaseInfo.purchaseToken.substring(0, 20) + '...',
      productId: mockPurchaseInfo.productId
    });

    const validationResult = await this.validatePurchase(mockPurchaseInfo, productId, userId);
    
    if (validationResult) {
      console.log('✅ Mock purchase validation successful');
    } else {
      console.error('❌ Mock purchase validation failed');
    }
    
    return validationResult;
  }

  private async validatePurchase(
    purchaseResult: any,
    productId: string,
    userId: string
  ): Promise<boolean> {
    console.log('🔍 Starting purchase validation with backend...');
    console.log('📋 Validation details:', {
      productId,
      userId,
      hasReceipt: !!purchaseResult.receipt,
      hasPurchaseToken: !!purchaseResult.purchaseToken
    });

    try {
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
        console.error('🔍 Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return false;
      }

      if (data?.success) {
        console.log('✅ Backend validation successful');
        console.log('🎉 Subscription activated:', {
          planType: data.subscription?.planType,
          endDate: data.subscription?.endDate,
          status: data.subscription?.status
        });
        return true;
      } else {
        console.error('❌ Backend validation failed - unexpected response format');
        console.error('📋 Response data:', data);
        return false;
      }
    } catch (error) {
      console.error('💥 Purchase validation network error:', error);
      console.error('🔍 Network error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      return false;
    }
  }

  async restorePurchases(): Promise<boolean> {
    console.log('🔄 Starting purchase restore process...');
    
    if (!Capacitor.isNativePlatform()) {
      console.log('🌐 Web platform - checking for existing subscriptions to restore');
      return await this.handleMockRestore();
    }

    try {
      console.log('📱 Native platform - restoring Google Play purchases');
      await NativePurchases.restorePurchases();
      console.log('✅ Google Play purchases restored successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to restore purchases:', error);
      console.error('🔍 Restore error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      return false;
    }
  }

  private async handleMockRestore(): Promise<boolean> {
    try {
      console.log('🔍 Checking database for existing subscriptions...');
      
      // Import supabase client
      const { supabase } = await import("@/integrations/supabase/client");
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No authenticated user found');
        return false;
      }

      // Check for existing active subscriptions
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
        console.log('📋 No active subscriptions found to restore');
        return false;
      }

      const activeSubscription = subscriptions[0];
      console.log('✅ Found active subscription to restore:', {
        planType: activeSubscription.plan_type,
        status: activeSubscription.status,
        endDate: activeSubscription.end_date
      });

      // Update profile subscription status if needed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ subscription_status: 'premium' })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('⚠️ Failed to update profile status:', profileError);
        // Don't fail the restore for this
      }

      console.log('🎉 Mock restore completed successfully');
      return true;

    } catch (error) {
      console.error('💥 Mock restore failed:', error);
      console.error('🔍 Mock restore error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      return false;
    }
  }

  getProducts(): PurchaseProduct[] {
    return this.products;
  }

  getProduct(productId: string): PurchaseProduct | undefined {
    return this.products.find(product => product.productIdentifier === productId);
  }

  isAvailable(): boolean {
    return Capacitor.isNativePlatform() || true; // Allow web for testing
  }
}

export const purchaseService = PurchaseService.getInstance();