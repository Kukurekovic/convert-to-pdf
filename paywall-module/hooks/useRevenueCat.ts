import Purchases from 'react-native-purchases';
import { usePaywallConfig } from '../contexts/PaywallConfigContext';
import { UseRevenueCat } from '../types';

/**
 * Hook for handling RevenueCat purchases and restorations
 *
 * This hook manages the purchase and restore logic for subscriptions.
 * It uses the entitlement ID from the PaywallConfig context.
 *
 * @param setIsSubscriber - Callback to update subscriber status
 * @param setShowPaywall - Callback to show/hide paywall
 * @returns Object with subscribe and restore functions
 */
export function useRevenueCat(
  setIsSubscriber: (v: boolean) => void,
  setShowPaywall: (v: boolean) => void
): UseRevenueCat {
  const config = usePaywallConfig();
  const ENTITLEMENT_ID = config.revenueCat.entitlementId;

  const subscribe = async (pkg: any) => {
    try {
      if (!pkg) {
        console.warn('[PaywallModule] ⚠️ No package provided for purchase');
        return;
      }

      // Log the plan selection details
      console.log('[PaywallModule] 🛒 User selected plan:', {
        identifier: pkg.identifier,
        packageType: pkg.packageType,
        productTitle: pkg.product?.title,
        productId: pkg.product?.identifier,
        price: pkg.product?.priceString,
        currencyCode: pkg.product?.currencyCode,
        introductoryPrice: pkg.product?.introductoryPrice,
        subscriptionPeriod: pkg.product?.subscriptionPeriod,
      });

      // Log trial information
      if (pkg.product?.introductoryPrice) {
        console.log('[PaywallModule] 🎁 TRIAL DETECTED:', {
          trialPeriod: pkg.product.introductoryPrice.subscriptionPeriod,
          trialPrice: pkg.product.introductoryPrice.priceString,
          paymentMode: pkg.product.introductoryPrice.paymentMode,
        });

        if (pkg.packageType === 'WEEKLY') {
          console.log('[PaywallModule] ✅ 3-DAY TRIAL ACTIVE - User will get 3 days free, then $0.99/week');
          console.log('[PaywallModule] 📅 WEEKLY SUBSCRIPTION - Duration: 1 Week (7 days)');
          console.log('[PaywallModule] ℹ️  Note: In testing, this will be shortened to 3 minutes. In production, it will last the full week.');
        }
      } else {
        console.log('[PaywallModule] ℹ️ No trial period detected for this package');
      }

      console.log('[PaywallModule] 💳 Starting purchase process...');
      const res = await Purchases.purchasePackage(pkg);

      // Log purchase result
      console.log('[PaywallModule] ✅ Purchase completed:', {
        transactionId: res?.customerInfo?.originalPurchaseDate,
        productId: res?.productIdentifier,
        entitlements: Object.keys(res?.customerInfo?.entitlements?.active || {}),
      });

      const active = Boolean(res?.customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]);

      if (active) {
        console.log('[PaywallModule] 🎉 User successfully subscribed to premium!');
        setIsSubscriber(active);
        setShowPaywall(false);
      } else {
        console.warn('[PaywallModule] ⚠️ Purchase completed but premium entitlement not active');
        setIsSubscriber(active);
      }
    } catch (error) {
      console.error('[PaywallModule] ❌ Purchase failed:', error);
    }
  };

  const restore = async () => {
    try {
      console.log('[PaywallModule] 🔄 Restoring purchases...');
      await Purchases.restorePurchases();
      const info = await Purchases.getCustomerInfo();
      const active = Boolean(info?.entitlements?.active?.[ENTITLEMENT_ID]);

      if (active) {
        console.log('[PaywallModule] ✅ Purchases restored successfully - Premium access granted');
        setIsSubscriber(active);
        setShowPaywall(false);
      } else {
        console.log('[PaywallModule] ℹ️ No active subscriptions found to restore');
        setIsSubscriber(active);
      }
    } catch (error) {
      console.error('[PaywallModule] ❌ Failed to restore purchases:', error);
    }
  };

  return { subscribe, restore };
}
