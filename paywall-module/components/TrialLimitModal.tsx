import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalization } from '../contexts/LocalizationContext';
import { useFontFamily } from '../hooks/useFontFamily';
import { usePaywallTheme } from '../contexts/PaywallThemeContext';
import { TrialLimitModalProps } from '../types';

/**
 * Trial Limit Modal Component
 *
 * Shows when a user reaches the free trial limit (e.g., 7 workouts in 7 days).
 * Encourages users to upgrade to premium to continue using the app.
 *
 * The trial limits are configurable via PaywallConfig.trial settings.
 *
 * @param visible - Controls modal visibility
 * @param onClose - Callback when user dismisses modal ("Maybe Later")
 * @param onLearnMore - Callback when user clicks "Learn More" (typically shows main paywall)
 */
const TrialLimitModal: React.FC<TrialLimitModalProps> = ({ visible, onClose, onLearnMore }) => {
  const { t } = useLocalization();
  const getFontFamily = useFontFamily();
  const theme = usePaywallTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-center items-center px-6"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <View
          className="rounded-2xl p-6 w-full max-w-sm"
          style={{ backgroundColor: theme.colors.background }}
        >
          {/* Title and Message */}
          <View className="items-center mb-4">
            {/* Title */}
            <Text
              style={[
                getFontFamily('bold'),
                {
                  fontSize: 22 * (theme.fontScale?.title || 1),
                  color: theme.colors.text.primary,
                },
              ]}
              className="text-center mb-3"
            >
              {t('trialLimit.title')}
            </Text>

            {/* Message */}
            <Text
              style={[
                getFontFamily('regular'),
                {
                  fontSize: 15 * (theme.fontScale?.body || 1),
                  lineHeight: 22,
                  color: theme.colors.text.secondary,
                },
              ]}
              className="text-center"
            >
              {t('trialLimit.message')}
            </Text>
          </View>

          {/* Buttons */}
          <View className="mt-6">
            {/* Learn More Button */}
            <TouchableOpacity
              className="py-4 rounded-xl mb-3 flex-row items-center justify-center"
              style={{ backgroundColor: theme.colors.primary }}
              onPress={onLearnMore}
            >
              <Text
                style={[
                  getFontFamily('semiBold'),
                  {
                    fontSize: 16 * (theme.fontScale?.body || 1),
                    color: theme.colors.primaryText,
                  },
                ]}
                className="mr-2"
              >
                {t('trialLimit.buttons.learnMore')}
              </Text>
              <Feather name="chevron-right" size={20} color={theme.colors.primaryText} />
            </TouchableOpacity>

            {/* Maybe Later Button */}
            <TouchableOpacity
              className="py-3"
              onPress={onClose}
            >
              <Text
                style={[
                  getFontFamily('regular'),
                  {
                    fontSize: 14 * (theme.fontScale?.body || 1),
                    color: theme.colors.text.muted,
                  },
                ]}
                className="text-center"
              >
                {t('trialLimit.buttons.maybeLater')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TrialLimitModal;
