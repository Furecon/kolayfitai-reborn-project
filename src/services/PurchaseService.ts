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
    if (!Capacitor.isNativePlatform()) {
      // Mock purchase for web testing
      console.log('Mock purchase for web:', productId);
      return this.handleMockPurchase(productId, userId);
    }

    try {
      console.log('Starting purchase for product:', productId);
      
      const result = await NativePurchases.purchaseProduct({ 
        productIdentifier: productId 
      });

      if (result && result.receipt) {
        console.log('Purchase successful:', result);
        
        // Validate purchase with backend
        const isValid = await this.validatePurchase(
          result,
          productId,
          userId
        );
        
        if (isValid) {
          console.log('Purchase validation successful');
          return true;
        } else {
          console.error('Purchase validation failed');
          return false;
        }
      } else {
        console.log('Purchase cancelled or failed');
        return false;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      return false;
    }
  }

  private async handleMockPurchase(productId: string, userId: string): Promise<boolean> {
    // Mock purchase data for web testing
    const mockPurchaseInfo = {
      receipt: `mock_receipt_${Date.now()}`,
      purchaseToken: `mock_token_${Date.now()}`,
      orderId: `mock_order_${Date.now()}`,
      productId,
      purchaseTime: Date.now(),
      packageName: 'com.kolayfit.app'
    };

    return this.validatePurchase(mockPurchaseInfo, productId, userId);
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
        console.error('Purchase validation error:', error);
        return false;
      }

      console.log('Purchase validated successfully:', data);
      return true;
    } catch (error) {
      console.error('Purchase validation failed:', error);
      return false;
    }
  }

  async restorePurchases(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Restore purchases not available on web');
      return false;
    }

    try {
      await NativePurchases.restorePurchases();
      console.log('Purchases restored successfully');
      return true;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
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