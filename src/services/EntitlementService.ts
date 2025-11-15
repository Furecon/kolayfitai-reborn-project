import { Capacitor } from '@capacitor/core';

// RevenueCat Purchases plugin - will be available on native platforms
let Purchases: any = null;

// Try to import Purchases plugin (only available on native)
if (Capacitor.isNativePlatform()) {
  import('@revenuecat/purchases-capacitor')
    .then((module) => {
      Purchases = module.Purchases;
      console.log('✅ RevenueCat Purchases plugin loaded for entitlements');
    })
    .catch((error) => {
      console.warn('⚠️ RevenueCat Purchases plugin not available:', error);
    });
}

export interface EntitlementInfo {
  identifier: string;
  isActive: boolean;
  willRenew: boolean;
  periodType: string;
  latestPurchaseDate: string;
  originalPurchaseDate: string;
  expirationDate?: string;
  store: string;
  productIdentifier: string;
  isSandbox: boolean;
  unsubscribeDetectedAt?: string;
  billingIssueDetectedAt?: string;
}

export interface CustomerInfo {
  entitlements: {
    all: Record<string, EntitlementInfo>;
    active: Record<string, EntitlementInfo>;
  };
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  latestExpirationDate?: string;
  originalAppUserId: string;
  requestDate: string;
  firstSeen: string;
  originalApplicationVersion?: string;
  managementURL?: string;
}

class EntitlementService {
  private static instance: EntitlementService;

  private constructor() {}

  static getInstance(): EntitlementService {
    if (!EntitlementService.instance) {
      EntitlementService.instance = new EntitlementService();
    }
    return EntitlementService.instance;
  }

  /**
   * Check if user has an active entitlement
   * @param entitlementId - The entitlement identifier (e.g., "premium")
   * @returns true if user has active entitlement, false otherwise
   */
  async checkEntitlement(entitlementId: string): Promise<boolean> {
    const isNative = Capacitor.isNativePlatform();

    if (!isNative || !Purchases) {
      console.log('⚠️ Entitlement check only available on native platforms');
      return false;
    }

    try {
      console.log(`🔍 Checking entitlement: ${entitlementId}`);

      const customerInfo = await Purchases.getCustomerInfo();
      const entitlements = customerInfo.customerInfo.entitlements.active;

      const hasEntitlement = entitlementId in entitlements;

      console.log(`${hasEntitlement ? '✅' : '❌'} Entitlement "${entitlementId}" is ${hasEntitlement ? 'ACTIVE' : 'NOT ACTIVE'}`);

      if (hasEntitlement) {
        const entitlement = entitlements[entitlementId];
        console.log('📊 Entitlement details:', {
          productId: entitlement.productIdentifier,
          willRenew: entitlement.willRenew,
          periodType: entitlement.periodType,
          expirationDate: entitlement.expirationDate,
          store: entitlement.store,
        });
      }

      return hasEntitlement;
    } catch (error) {
      console.error(`❌ Failed to check entitlement "${entitlementId}":`, error);
      return false;
    }
  }

  /**
   * Get customer information including all entitlements
   * @returns CustomerInfo object or null if unavailable
   */
  async getCustomerInfo(): Promise<CustomerInfo | null> {
    const isNative = Capacitor.isNativePlatform();

    if (!isNative || !Purchases) {
      console.log('⚠️ Customer info only available on native platforms');
      return null;
    }

    try {
      console.log('📋 Fetching customer info...');

      const result = await Purchases.getCustomerInfo();
      const customerInfo = result.customerInfo;

      console.log('✅ Customer info retrieved:', {
        activeSubscriptions: customerInfo.activeSubscriptions,
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
        latestExpiration: customerInfo.latestExpirationDate,
        managementURL: customerInfo.managementURL,
      });

      return customerInfo;
    } catch (error) {
      console.error('❌ Failed to get customer info:', error);
      return null;
    }
  }

  /**
   * Check if user has Premium entitlement
   * This is a convenience method for the most common use case
   */
  async hasPremiumAccess(): Promise<boolean> {
    return this.checkEntitlement('premium');
  }

  /**
   * Get all active entitlements for the user
   * @returns Array of active entitlement identifiers
   */
  async getActiveEntitlements(): Promise<string[]> {
    const customerInfo = await this.getCustomerInfo();
    if (!customerInfo) {
      return [];
    }

    return Object.keys(customerInfo.entitlements.active);
  }

  /**
   * Get entitlement details
   * @param entitlementId - The entitlement identifier
   * @returns EntitlementInfo or null if not found
   */
  async getEntitlementInfo(entitlementId: string): Promise<EntitlementInfo | null> {
    const customerInfo = await this.getCustomerInfo();
    if (!customerInfo) {
      return null;
    }

    const entitlement = customerInfo.entitlements.all[entitlementId];
    return entitlement || null;
  }

  /**
   * Check if any entitlement will renew
   * Useful for determining if user has auto-renewal enabled
   */
  async willRenew(): Promise<boolean> {
    const customerInfo = await this.getCustomerInfo();
    if (!customerInfo) {
      return false;
    }

    const activeEntitlements = Object.values(customerInfo.entitlements.active);
    return activeEntitlements.some(e => e.willRenew);
  }

  /**
   * Get subscription management URL
   * This URL allows users to manage their subscription in the app store
   */
  async getManagementURL(): Promise<string | null> {
    const customerInfo = await this.getCustomerInfo();
    return customerInfo?.managementURL || null;
  }

  /**
   * Check if user is in sandbox/test mode
   */
  async isSandbox(): Promise<boolean> {
    const customerInfo = await this.getCustomerInfo();
    if (!customerInfo) {
      return false;
    }

    const activeEntitlements = Object.values(customerInfo.entitlements.active);
    return activeEntitlements.some(e => e.isSandbox);
  }
}

export const entitlementService = EntitlementService.getInstance();
