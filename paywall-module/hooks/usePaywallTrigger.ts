import { useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { usePaywallVisibility } from '../contexts/PaywallVisibilityContext';
import { usePaywallGate } from './usePaywallGate';
import { useLocalization } from '../contexts/LocalizationContext';

/**
 * Hook that provides safe paywall trigger with subscription pre-check.
 *
 * This hook prevents the paywall from briefly flashing for already subscribed users
 * by checking subscription status BEFORE setting paywall visibility.
 *
 * @returns Object with tryShowPaywall function
 *
 * @example
 * ```tsx
 * function SettingsScreen() {
 *   const { tryShowPaywall } = usePaywallTrigger();
 *
 *   return (
 *     <TouchableOpacity onPress={tryShowPaywall}>
 *       <Text>Unlock Premium</Text>
 *     </TouchableOpacity>
 *   );
 * }
 * ```
 */
export function usePaywallTrigger() {
  const { setShowPaywall } = usePaywallVisibility();
  const { isSubscriber } = usePaywallGate();
  const { t } = useLocalization();

  const tryShowPaywall = useCallback(() => {
    // Pre-flight check: If already subscribed, show toast instead
    if (isSubscriber) {
      Toast.show({
        type: 'alreadySubscribed',
        text1: t('alreadySubscribed.message'),
        visibilityTime: 2500,
        autoHide: true,
      });
      return;
    }

    // Not subscribed - show paywall normally
    setShowPaywall(true);
  }, [isSubscriber, setShowPaywall, t]);

  return { tryShowPaywall };
}
