import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Switch, Linking, Platform, ScrollView, Dimensions } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useResponsive, responsiveDimensions } from '../hooks/useResponsive';
import { useLocalization } from '../contexts/LocalizationContext';
import { useFontFamily } from '../hooks/useFontFamily';
import { usePaywallTheme } from '../contexts/PaywallThemeContext';
import { usePaywallConfig } from '../contexts/PaywallConfigContext';
import { PaywallProps } from '../types';

/**
 * Main Paywall Component
 *
 * A fully-featured subscription paywall with:
 * - Two subscription plan options (Yearly and Trial/Monthly)
 * - Animated gift icon
 * - Feature list with icons
 * - Free trial toggle
 * - Restore purchases button
 * - Privacy policy link
 * - Responsive design for tablets and phones
 *
 * All styling is themeable via PaywallTheme context.
 * All configuration (privacy URL, gift image) comes from PaywallConfig context.
 */
const Paywall: React.FC<PaywallProps> = ({ visible, isSubscriber, offerings, onClose, onSubscribe, onRestore }) => {
  const { t } = useLocalization();
  const getFontFamily = useFontFamily();
  const theme = usePaywallTheme();
  const config = usePaywallConfig();
  const { isTablet, scaleSpacing, isAndroidMediumOrSmall, scaleAndroidCondensed, isAndroidSmall, scaleAndroidExtraCondensed } = useResponsive();

  // Additional detection for screen sizes
  const { width, height } = Dimensions.get('window');
  const minDimension = Math.min(width, height);
  const isLargeScreen = minDimension >= 768;
  const isSmallScreen = minDimension < 376;

  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'trial'>('trial');
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(true);

  // Log paywall display
  React.useEffect(() => {
    if (visible && offerings?.current) {
      const offering = offerings.current;
      console.log('[PaywallModule] 💰 Paywall displayed with offering:', offering.identifier);
      if (offering.availablePackages?.length > 0) {
        console.log('[PaywallModule] 📋 Packages shown to user:');
        offering.availablePackages.forEach((pkg: any, index: number) => {
          console.log(`  ${index + 1}. ${pkg.identifier} (${pkg.packageType}) - ${pkg.product?.priceString}`);
        });
      } else {
        console.warn('[PaywallModule] ⚠️ No packages available in offering');
      }
    }
  }, [visible, offerings]);

  if (!visible || isSubscriber) return null;

  const offering = offerings?.current;
  const firstPackage = offering?.availablePackages?.[0];

  // Get packages by type
  const getPackageByType = (type: string) => {
    if (!offering?.availablePackages) return null;
    return offering.availablePackages.find((pkg: any) =>
      pkg.packageType === type || pkg.identifier.includes(type.toLowerCase())
    );
  };

  // Get lifetime/annual package - supports both ANNUAL and LIFETIME package types
  const getLifetimePackage = () => {
    if (!offering?.availablePackages) return null;
    return offering.availablePackages.find((pkg: any) =>
      pkg.packageType === 'ANNUAL' ||
      pkg.packageType === 'LIFETIME' ||
      pkg.identifier.toLowerCase().includes('annual') ||
      pkg.identifier.toLowerCase().includes('lifetime')
    );
  };

  const annualPackage = getLifetimePackage();
  const monthlyPackage = getPackageByType('MONTHLY');

  // Get the appropriate package based on user selection
  const getSelectedPackage = () => {
    if (selectedPlan === 'yearly') {
      return annualPackage || firstPackage;
    } else {
      return monthlyPackage || firstPackage;
    }
  };

  const selectedPackage = getSelectedPackage();

  return (
    <View
      style={{
        flex: 1,
        zIndex: 1000,
        elevation: Platform.OS === 'android' ? 1000 : undefined,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.background,
      }}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: isAndroidMediumOrSmall ? (isAndroidSmall ? scaleAndroidExtraCondensed(32) : scaleAndroidCondensed(32)) : scaleSpacing(32) }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Section - Full-Width Background Banner with Title */}
        <ImageBackground
          source={require('../../assets/images/background.png')}
          resizeMode="cover"
          style={{
            width: '100%',
            height: Platform.OS === 'android'
              ? (isTablet ? scaleSpacing(390) : (isAndroidSmall ? scaleAndroidExtraCondensed(330) : scaleAndroidCondensed(360)))
              : (isTablet ? scaleSpacing(400) : scaleSpacing(340)),
          }}
        >
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: 'absolute',
              top: isLargeScreen ? scaleSpacing(16) : (isAndroidSmall ? scaleAndroidExtraCondensed(16) : scaleSpacing(24)),
              left: isLargeScreen ? scaleSpacing(24) : (isAndroidSmall ? scaleAndroidExtraCondensed(16) : scaleSpacing(20)),
              width: isAndroidSmall ? scaleAndroidExtraCondensed(32) : scaleSpacing(36),
              height: isAndroidSmall ? scaleAndroidExtraCondensed(32) : scaleSpacing(36),
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: isAndroidSmall ? scaleAndroidExtraCondensed(18) : scaleSpacing(18),
            }}
          >
            <Feather
              name="x"
              size={isTablet ? responsiveDimensions.iconSize.large.tablet : (isAndroidSmall ? scaleAndroidExtraCondensed(responsiveDimensions.iconSize.large.phone) : responsiveDimensions.iconSize.large.phone)}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* Dark overlay for text readability */}
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: isLargeScreen ? scaleSpacing(48) : (isAndroidMediumOrSmall ? (isAndroidSmall ? scaleAndroidExtraCondensed(24) : scaleAndroidCondensed(24)) : scaleSpacing(24)),
          }}>
            {/* Title */}
            <Text
              style={[
                getFontFamily('bold'),
                {
                  fontSize: Platform.OS === 'android'
                    ? (isTablet ? 32 : (isAndroidSmall ? Math.round(responsiveDimensions.fontSize.xl.phone * 0.85) : (isSmallScreen ? 18 : responsiveDimensions.fontSize.xl.phone)))
                    : (isTablet ? 36 : (isSmallScreen ? 20 : responsiveDimensions.fontSize['2xl'].phone)),
                  color: '#FFFFFF',
                  textAlign: 'center',
                  textShadowColor: 'rgba(0, 0, 0, 0.75)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                },
              ]}
            >
              {t('paywall.title')}
            </Text>
          </View>
        </ImageBackground>

        {/* Content Section with Padding */}
        <View
          style={{
            paddingHorizontal: isLargeScreen ? scaleSpacing(48) : (isAndroidMediumOrSmall ? (isAndroidSmall ? scaleAndroidExtraCondensed(24) : scaleAndroidCondensed(24)) : scaleSpacing(24)),
            alignSelf: 'center',
            width: '100%',
          }}
        >

          {/* Middle Section - Features and Plans */}
          <View
            style={{
              paddingHorizontal: 0,
              marginBottom: isAndroidMediumOrSmall ? (isAndroidSmall ? scaleAndroidExtraCondensed(24) : scaleAndroidCondensed(24)) : scaleSpacing(24),
              width: '100%',
            }}
          >
            {/* Feature List */}
            <View
              style={{
                width: isLargeScreen ? '80%' : '90%',
                alignSelf: 'center',
                marginTop: scaleSpacing(22),
                marginLeft: scaleSpacing(60),
              }}
            >
              {/* Feature: Saved Routines */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: isAndroidSmall ? scaleAndroidExtraCondensed(12) : scaleSpacing(12),
              }}>
                <View style={{
                  width: isAndroidSmall ? scaleAndroidExtraCondensed(40) : scaleSpacing(40),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FontAwesome5
                    name="dumbbell"
                    size={isTablet ? responsiveDimensions.iconSize.medium.tablet : (isAndroidSmall ? scaleAndroidExtraCondensed(responsiveDimensions.iconSize.medium.phone) : responsiveDimensions.iconSize.medium.phone)}
                    color={theme.colors.feature.icon}
                  />
                </View>
                <View style={{
                  flex: 1,
                  paddingLeft: isAndroidSmall ? scaleAndroidExtraCondensed(-15) : scaleSpacing(-15),
                  justifyContent: 'center',
                }}>
                  <Text
                    style={[
                      getFontFamily('regular'),
                      {
                        fontSize: isTablet ? 20 : (isAndroidSmall ? Math.round(responsiveDimensions.fontSize.base.phone * 0.8) : (isSmallScreen ? 16 : responsiveDimensions.fontSize.base.phone)),
                        color: theme.colors.text.primary,
                        textAlign: 'left',
                      },
                    ]}
                  >
                    {t('paywall.features.savedRoutines')}
                  </Text>
                </View>
              </View>

              {/* Feature: Unlimited Sessions */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: isAndroidSmall ? scaleAndroidExtraCondensed(12) : scaleSpacing(12),
              }}>
                <View style={{
                  width: isAndroidSmall ? scaleAndroidExtraCondensed(40) : scaleSpacing(40),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FontAwesome5
                    name="infinity"
                    size={isTablet ? responsiveDimensions.iconSize.medium.tablet : (isAndroidSmall ? scaleAndroidExtraCondensed(responsiveDimensions.iconSize.medium.phone) : responsiveDimensions.iconSize.medium.phone)}
                    color={theme.colors.feature.icon}
                  />
                </View>
                <View style={{
                  flex: 1,
                  paddingLeft: isAndroidSmall ? scaleAndroidExtraCondensed(-15) : scaleSpacing(-15),
                  justifyContent: 'center',
                }}>
                  <Text
                    style={[
                      getFontFamily('regular'),
                      {
                        fontSize: isTablet ? 20 : (isAndroidSmall ? Math.round(responsiveDimensions.fontSize.base.phone * 0.8) : (isSmallScreen ? 16 : responsiveDimensions.fontSize.base.phone)),
                        color: theme.colors.text.primary,
                        textAlign: 'left',
                      },
                    ]}
                  >
                    {t('paywall.features.unlimitedSessions')}
                  </Text>
                </View>
              </View>

              {/* Feature: Voice Cues */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: isAndroidSmall ? scaleAndroidExtraCondensed(12) : scaleSpacing(12),
              }}>
                <View style={{
                  width: isAndroidSmall ? scaleAndroidExtraCondensed(40) : scaleSpacing(40),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FontAwesome5
                    name="volume-up"
                    size={isTablet ? responsiveDimensions.iconSize.medium.tablet : (isAndroidSmall ? scaleAndroidExtraCondensed(responsiveDimensions.iconSize.medium.phone) : responsiveDimensions.iconSize.medium.phone)}
                    color={theme.colors.feature.icon}
                  />
                </View>
                <View style={{
                  flex: 1,
                  paddingLeft: isAndroidSmall ? scaleAndroidExtraCondensed(-15) : scaleSpacing(-15),
                  justifyContent: 'center',
                }}>
                  <Text
                    style={[
                      getFontFamily('regular'),
                      {
                        fontSize: isTablet ? 20 : (isAndroidSmall ? Math.round(responsiveDimensions.fontSize.base.phone * 0.8) : (isSmallScreen ? 16 : responsiveDimensions.fontSize.base.phone)),
                        color: theme.colors.text.primary,
                        textAlign: 'left',
                      },
                    ]}
                  >
                    {t('paywall.features.voiceCues')}
                  </Text>
                </View>
              </View>

              {/* Feature: Remove Paywalls */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: isAndroidSmall ? scaleAndroidExtraCondensed(12) : scaleSpacing(12),
              }}>
                <View style={{
                  width: isAndroidSmall ? scaleAndroidExtraCondensed(40) : scaleSpacing(40),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FontAwesome5
                    name="unlock"
                    size={isTablet ? responsiveDimensions.iconSize.medium.tablet : (isAndroidSmall ? scaleAndroidExtraCondensed(responsiveDimensions.iconSize.medium.phone) : responsiveDimensions.iconSize.medium.phone)}
                    color={theme.colors.feature.icon}
                  />
                </View>
                <View style={{
                  flex: 1,
                  paddingLeft: isAndroidSmall ? scaleAndroidExtraCondensed(-15) : scaleSpacing(-15),
                  justifyContent: 'center',
                }}>
                  <Text
                    style={[
                      getFontFamily('regular'),
                      {
                        fontSize: isTablet ? 20 : (isAndroidSmall ? Math.round(responsiveDimensions.fontSize.base.phone * 0.8) : (isSmallScreen ? 16 : responsiveDimensions.fontSize.base.phone)),
                        color: theme.colors.text.primary,
                        textAlign: 'left',
                      },
                    ]}
                  >
                    {t('paywall.features.removePaywalls')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Plan Selection Buttons */}
            <View style={{ width: '100%', marginTop: isLargeScreen ? scaleSpacing(14) : scaleSpacing(22) }}>
              {/* Trial Plan */}
              <TouchableOpacity
                style={{
                  width: isLargeScreen ? 'auto' : '100%',
                  borderWidth: 2,
                  borderColor: selectedPlan === 'trial' ? theme.colors.border.selected : theme.colors.border.default,
                  backgroundColor: selectedPlan === 'trial' ? `${theme.colors.primary}10` : theme.colors.background,
                  borderRadius: 12,
                  padding: 8,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => {
                  setSelectedPlan('trial');
                  setFreeTrialEnabled(true);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      getFontFamily('semiBold'),
                      {
                        fontSize: Platform.OS === 'android'
                          ? (isTablet ? 20 : (isSmallScreen ? 14 : 16))
                          : (isTablet ? 24 : (isSmallScreen ? 16 : 18)),
                        color: theme.colors.text.primary,
                      },
                    ]}
                  >
                    {t('paywall.plans.trial')}
                  </Text>
                  <Text
                    style={[
                      getFontFamily('regular'),
                      {
                        fontSize: Platform.OS === 'android'
                          ? (isTablet ? 18 : (isSmallScreen ? 12 : 14))
                          : (isTablet ? 20 : (isSmallScreen ? 14 : 16)),
                        color: theme.colors.text.primary,
                      },
                    ]}
                  >
                    {t('paywall.plans.trialPrice', { price: monthlyPackage?.product?.priceString || '$4.99' })}
                  </Text>
                </View>
                <Text
                  style={[
                    getFontFamily('semiBold'),
                    {
                      fontSize: Platform.OS === 'android'
                        ? (isTablet ? 18 : (isSmallScreen ? 14 : 16))
                        : (isTablet ? 20 : (isSmallScreen ? 16 : 18)),
                      marginRight: 12,
                    },
                  ]}
                >
                  {t('paywall.plans.freeTrial')}
                </Text>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: selectedPlan === 'trial' ? theme.colors.border.selected : theme.colors.border.default,
                    backgroundColor: selectedPlan === 'trial' ? theme.colors.border.selected : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selectedPlan === 'trial' && <Feather name="check" size={15} color={theme.colors.primaryText} />}
                </View>
              </TouchableOpacity>

              {/* Yearly Plan */}
              <TouchableOpacity
                style={{
                  width: isLargeScreen ? 'auto' : '100%',
                  borderWidth: 2,
                  borderColor: selectedPlan === 'yearly' ? theme.colors.border.selected : theme.colors.border.default,
                  backgroundColor: selectedPlan === 'yearly' ? `${theme.colors.primary}10` : theme.colors.background,
                  borderRadius: 12,
                  padding: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => {
                  setSelectedPlan('yearly');
                  setFreeTrialEnabled(false);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      getFontFamily('semiBold'),
                      {
                        fontSize: Platform.OS === 'android'
                          ? (isTablet ? 20 : (isSmallScreen ? 14 : 16))
                          : (isTablet ? 24 : (isSmallScreen ? 16 : 18)),
                        color: theme.colors.text.primary,
                      },
                    ]}
                  >
                    {t('paywall.plans.yearly')}
                  </Text>
                  <Text
                    style={[
                      getFontFamily('regular'),
                      {
                        fontSize: Platform.OS === 'android'
                          ? (isTablet ? 18 : (isSmallScreen ? 12 : 14))
                          : (isTablet ? 20 : (isSmallScreen ? 14 : 16)),
                        color: theme.colors.text.primary,
                      },
                    ]}
                  >
                    {t('paywall.plans.yearlyPrice', { price: annualPackage?.product?.priceString || '$19.99' })}
                  </Text>
                </View>
                <View style={{ backgroundColor: theme.colors.accent, padding: 8, borderRadius: 6, marginRight: 12 }}>
                  <Text
                    style={[
                      getFontFamily('semiBold'),
                      { fontSize: isSmallScreen ? 10 : 12, color: theme.colors.primaryText },
                    ]}
                  >
                    {t('paywall.plans.bestValue')}
                  </Text>
                </View>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: selectedPlan === 'yearly' ? theme.colors.border.selected : theme.colors.border.default,
                    backgroundColor: selectedPlan === 'yearly' ? theme.colors.border.selected : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selectedPlan === 'yearly' && <Feather name="check" size={15} color={theme.colors.primaryText} />}
                </View>
              </TouchableOpacity>
            </View>

            {/* Free Trial Toggle */}
            <View style={{ width: '100%' }}>
              <TouchableOpacity
                style={{
                  width: isLargeScreen ? 'auto' : '100%',
                  marginTop: isAndroidSmall ? scaleAndroidExtraCondensed(16) : 16,
                  paddingHorizontal: isAndroidSmall ? scaleAndroidExtraCondensed(16) : 16,
                  paddingVertical: isAndroidSmall ? scaleAndroidExtraCondensed(8) : 12,
                  backgroundColor: '#F3F4F6',
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={[
                    getFontFamily('semiBold'),
                    {
                      fontSize: isTablet ? 18 : (isAndroidSmall ? Math.round(16 * 0.8) : (isSmallScreen ? 14 : 16)),
                      color: '#111827',
                    },
                  ]}
                >
                  {t('paywall.freeTrialEnabled')}
                </Text>
                <Switch
                  value={freeTrialEnabled}
                  onValueChange={(value) => {
                    setFreeTrialEnabled(value);
                    if (value) {
                      setSelectedPlan('trial');
                    } else {
                      setSelectedPlan('yearly');
                    }
                  }}
                  trackColor={{ false: '#E5E7EB', true: theme.colors.primary }}
                  thumbColor={freeTrialEnabled ? '#FFFFFF' : '#F3F4F6'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Section - Button and Links */}
          <View style={{ paddingBottom: 32 }}>
            {/* Subscribe Button */}
            <TouchableOpacity
              style={{
                paddingVertical: isAndroidSmall ? scaleAndroidExtraCondensed(16) : 16,
                marginBottom: isAndroidSmall ? scaleAndroidExtraCondensed(24) : 24,
                backgroundColor: theme.colors.primary,
                borderRadius: 12,
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => onSubscribe(selectedPackage)}
            >
              <Text
                style={[
                  getFontFamily('semiBold'),
                  {
                    fontSize: isAndroidSmall ? Math.round(18 * 0.9) : (isSmallScreen ? 18 : 18),
                    marginRight: isAndroidSmall ? scaleAndroidExtraCondensed(8) : 8,
                    color: theme.colors.primaryText,
                  },
                ]}
              >
                {selectedPlan === 'yearly' ? t('paywall.buttons.unlockNow') : t('paywall.buttons.tryFree')}
              </Text>
              <Feather
                name="chevron-right"
                size={isAndroidSmall ? scaleAndroidExtraCondensed(26) : (isSmallScreen ? 22 : 26)}
                color={theme.colors.primaryText}
              />
            </TouchableOpacity>

            {/* Links */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', columnGap: 24 }}>
              <TouchableOpacity onPress={onRestore}>
                <Text
                  style={[
                    getFontFamily('regular'),
                    {
                      fontSize: isAndroidSmall ? Math.round(14 * 0.8) : (isSmallScreen ? 12 : 14),
                      color: theme.colors.text.muted,
                      textDecorationLine: 'underline',
                    },
                  ]}
                >
                  {t('paywall.buttons.restore')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL(config.links!.privacyPolicy)}>
                <Text
                  style={[
                    getFontFamily('regular'),
                    {
                      fontSize: isAndroidSmall ? Math.round(14 * 0.8) : (isSmallScreen ? 12 : 14),
                      color: theme.colors.text.muted,
                      textDecorationLine: 'underline',
                    },
                  ]}
                >
                  {t('paywall.links.privacy')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Paywall;
