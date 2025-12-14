import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalization } from '../contexts/LocalizationContext';
import { useFontFamily } from '../hooks/useFontFamily';
import { usePaywallTheme } from '../contexts/PaywallThemeContext';
import { UpgradeModalProps } from '../types';

/**
 * Upgrade Modal Component
 *
 * Shows when a user tries to access a premium feature without a subscription.
 * Typically triggered when attempting to save workouts or access unlimited sessions.
 *
 * @param visible - Controls modal visibility
 * @param onClose - Callback when user dismisses modal
 * @param onLearnMore - Callback when user clicks "Learn More" (typically shows main paywall)
 * @param onRestore - Callback when user clicks "Already Paid?" (restores purchases)
 */
const UpgradeModal: React.FC<UpgradeModalProps> = ({ visible, onClose, onLearnMore, onRestore }) => {
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
                  fontSize: 24 * (theme.fontScale?.title || 1),
                  color: theme.colors.text.primary,
                },
              ]}
              className="text-center mb-2"
            >
              {t('upgrade.title')}
            </Text>

            {/* Message */}
            <Text
              style={[
                getFontFamily('regular'),
                {
                  fontSize: 16 * (theme.fontScale?.body || 1),
                  color: theme.colors.text.secondary,
                },
              ]}
              className="text-center"
            >
              {t('upgrade.message')}
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
                {t('upgrade.buttons.learnMore')}
              </Text>
              <Feather name="chevron-right" size={20} color={theme.colors.primaryText} />
            </TouchableOpacity>

            {/* Already Paid Button */}
            <TouchableOpacity
              className="py-4 rounded-xl mb-3"
              style={{ borderWidth: 2, borderColor: theme.colors.border.default }}
              onPress={onRestore}
            >
              <Text
                style={[
                  getFontFamily('semiBold'),
                  {
                    fontSize: 16 * (theme.fontScale?.body || 1),
                    color: theme.colors.text.primary,
                  },
                ]}
                className="text-center"
              >
                {t('upgrade.buttons.alreadyPaid')}
              </Text>
            </TouchableOpacity>

            {/* No Thanks Button */}
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
                {t('upgrade.buttons.noThanks')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UpgradeModal;
