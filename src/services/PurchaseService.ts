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
    console.log('Purchase service initialized for web platform');
    await this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    // Web platform products
    this.products = [
      {
        productIdentifier: 'monthly_249_99',
        title: 'KolayFit Premium - Aylık',
        description: 'Aylık premium abonelik',
        price: '249,99 ₺',
        priceAmountMicros: 249990000,
        currencyCode: 'TRY'
      },
      {
        productIdentifier: 'yearly_2499_99',
        title: 'KolayFit Premium - Yıllık',
        description: 'Yıllık premium abonelik (%17 indirim)',
        price: '2.499,99 ₺',
        priceAmountMicros: 2499990000,
        currencyCode: 'TRY'
      }
    ];
  }

  async purchaseProduct(productId: string, userId: string): Promise<boolean> {
    console.log('🛒 Starting purchase process:', { productId, userId });
    
    console.log('🌐 Web platform detected - using mock purchase flow');
    
    // Mock purchase data for web testing
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

  private async validatePurchase(
    purchaseResult: any,
    productId: string,
    userId: string
  ): Promise<boolean> {
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
        console.error('Backend validation error:', error);
        return false;
      }

      if (data?.success) {
        console.log('Purchase validation successful');
        return true;
      } else {
        console.error('Purchase validation failed');
        return false;
      }
    } catch (error) {
      console.error('Purchase validation error:', error);
      return false;
    }
  }

  async restorePurchases(): Promise<boolean> {
    console.log('Checking for existing subscriptions to restore...');
    
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
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
        console.error('Failed to check subscriptions:', error);
        return false;
      }

      if (!subscriptions || subscriptions.length === 0) {
        console.log('No active subscriptions found to restore');
        return false;
      }

      const activeSubscription = subscriptions[0];
      console.log('Found active subscription to restore');

      // Update profile subscription status if needed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ subscription_status: 'premium' })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Failed to update profile status:', profileError);
      }

      console.log('Restore completed successfully');
      return true;

    } catch (error) {
      console.error('Restore failed:', error);
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
    return true; // Available on web platform
  }
}

export const purchaseService = PurchaseService.getInstance();