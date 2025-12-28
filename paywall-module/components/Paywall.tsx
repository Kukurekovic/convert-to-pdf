import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Switch, Linking, Platform, ScrollView, Dimensions, StatusBar } from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
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

  // Calculate safe area top inset manually
  // iOS: Add statusBar height + extra for notch devices
  // Android: Use StatusBar height
  const statusBarHeight = StatusBar.currentHeight || 0;
  const safeAreaTopInset = Platform.OS === 'ios'
    ? (height >= 812 ? 44 : 20) // iPhone X and newer vs older iPhones
    : statusBarHeight;

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

  // Handle already subscribed users
  useEffect(() => {
    if (isSubscriber && visible) {
      Toast.show({
        type: 'alreadySubscribed',
        text1: t('alreadySubscribed.message'),
        visibilityTime: 2500,
        autoHide: true,
      });

      onClose();
    }
  }, [isSubscriber, visible, t, onClose]);

  if (!visible) return null;

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
      pointerEvents="box-none"
    >
      {/* Close Button - Positioned outside ScrollView for reliable touch handling */}
      <TouchableOpacity
        onPress={onClose}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={{
          position: 'absolute',
          top: safeAreaTopInset + (isLargeScreen ? scaleSpacing(12) : (isAndroidSmall ? scaleAndroidExtraCondensed(12) : scaleSpacing(16))),
          left: isLargeScreen ? scaleSpacing(20) : (isAndroidSmall ? scaleAndroidExtraCondensed(16) : scaleSpacing(16)),
          width: isAndroidSmall ? scaleAndroidExtraCondensed(40) : scaleSpacing(44),
          height: isAndroidSmall ? scaleAndroidExtraCondensed(40) : scaleSpacing(44),
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: isAndroidSmall ? scaleAndroidExtraCondensed(22) : scaleSpacing(22),
        }}
      >
        <Feather
          name="x"
          size={isTablet ? responsiveDimensions.iconSize.large.tablet : (isAndroidSmall ? scaleAndroidExtraCondensed(responsiveDimensions.iconSize.large.phone) : responsiveDimensions.iconSize.large.phone)}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{ paddingBottom: isAndroidMediumOrSmall ? (isAndroidSmall ? scaleAndroidExtraCondensed(32) : scaleAndroidCondensed(32)) : scaleSpacing(32) }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        pointerEvents="auto"
      >
        {/* Top Section - Full-Width Background Banner with Title */}
        <ImageBackground
          source={require('../../assets/images/background.png')}
          resizeMode="cover"
          style={{
            width: '100%',
            height: Platform.OS === 'android'
              ? (isTablet ? scaleSpacing(520) : (isAndroidSmall ? scaleAndroidExtraCondensed(450) : scaleAndroidCondensed(480)))
              : (isTablet ? scaleSpacing(530) : scaleSpacing(460)),
          }}
        >

          {/* Dark overlay for text readability */}
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: isLargeScreen ? scaleSpacing(48) : (isAndroidMediumOrSmall ? (isAndroidSmall ? scaleAndroidExtraCondensed(24) : scaleAndroidCondensed(24)) : scaleSpacing(24)),
            paddingTop: isAndroidSmall ? scaleAndroidExtraCondensed(40) : scaleSpacing(40),
          }}>
            {/* Title */}
            <Text
              style={[
                getFontFamily('bold'),
                {
                  fontSize: Platform.OS === 'android'
                    ? (isTablet ? 40 : (isAndroidSmall ? Math.round(responsiveDimensions.fontSize['2xl'].phone * 0.9) : (isSmallScreen ? 22 : responsiveDimensions.fontSize['2xl'].phone)))
                    : (isTablet ? 44 : (isSmallScreen ? 24 : responsiveDimensions.fontSize['3xl'].phone)),
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

            {/* Feature List */}
            <View
              style={{
                width: isLargeScreen ? '85%' : '92%',
                alignSelf: 'center',
                marginTop: isAndroidSmall ? scaleAndroidExtraCondensed(16) : scaleSpacing(20),
                paddingLeft: isAndroidSmall ? scaleAndroidExtraCondensed(16) : scaleSpacing(16),
              }}
            >
              {/* Feature: Saved Routines */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: isAndroidSmall ? scaleAndroidExtraCondensed(10) : scaleSpacing(12),
              }}>
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: isAndroidSmall ? scaleAndroidExtraCondensed(10) : scaleSpacing(10),
                }}>
                  <Feather
                    name="check"
                    size={isTablet ? responsiveDimensions.iconSize.medium.tablet : (isAndroidSmall ? scaleAndroidExtraCondensed(responsiveDimensions.iconSize.medium.phone) : responsiveDimensions.iconSize.medium.phone)}
                    color="#FFFFFF"
                  />
                </View>
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text
                    style={[
                      getFontFamily('semiBold'),
                      {
                        fontSize: isTablet ? 24 : (isAndroidSmall ? Math.round(responsiveDimensions.fontSize.lg.phone * 0.85) : (isSmallScreen ? 18 : responsiveDimensions.fontSize.lg.phone)),
                        color: '#FFFFFF',
                        textAlign: 'left',
                        textShadowColor: 'rgba(0, 0, 0, 0.5)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
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
                marginBottom: isAndroidSmall ? scaleAndroidExtraCondensed(10) : scaleSpacing(12),
              }}>
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: isAndroidSmall ? scaleAndroidExtraCondensed(10) : scaleSpacing(10),
                }}>
                  <Feather
                    name="check"
                    size={isTablet ? responsiveDimensions.iconSize.medium.tablet : (isAndroidSmall ? scaleAndroidExtraCondensed(responsiveDimensions.iconSize.medium.phone) : responsiveDimensions.iconSize.medium.phone)}
                    color="#FFFFFF"
                  />
                </View>
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text
                    style={[
                      getFontFamily('semiBold'),
                      {
                        fontSize: isTablet ? 24 : (isAndroidSmall ? Math.round(responsiveDimensions.fontSize.lg.phone * 0.85) : (isSmallScreen ? 18 : responsiveDimensions.fontSize.lg.phone)),
                        color: '#FFFFFF',
                        textAlign: 'left',
                        textShadowColor: 'rgba(0, 0, 0, 0.5)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
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
              }}>
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: isAndroidSmall ? scaleAndroidExtraCondensed(10) : scaleSpacing(10),
                }}>
                  <Feather
                    name="check"
                    size={isTablet ? responsiveDimensions.iconSize.medium.tablet : (isAndroidSmall ? scaleAndroidExtraCondensed(responsiveDimensions.iconSize.medium.phone) : responsiveDimensions.iconSize.medium.phone)}
                    color="#FFFFFF"
                  />
                </View>
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text
                    style={[
                      getFontFamily('semiBold'),
                      {
                        fontSize: isTablet ? 24 : (isAndroidSmall ? Math.round(responsiveDimensions.fontSize.lg.phone * 0.85) : (isSmallScreen ? 18 : responsiveDimensions.fontSize.lg.phone)),
                        color: '#FFFFFF',
                        textAlign: 'left',
                        textShadowColor: 'rgba(0, 0, 0, 0.5)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      },
                    ]}
                  >
                    {t('paywall.features.voiceCues')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Content Section with Padding */}
        <View
          style={{
            paddingHorizontal: isLargeScreen ? scaleSpacing(48) : (isAndroidMediumOrSmall ? (isAndroidSmall ? scaleAndroidExtraCondensed(24) : scaleAndroidCondensed(24)) : scaleSpacing(24)),
            alignSelf: 'center',
            width: '100%',
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: scaleSpacing(24),
            borderTopRightRadius: scaleSpacing(24),
            marginTop: -scaleSpacing(24),
          }}
        >

          {/* Middle Section - Plans */}
          <View
            style={{
              paddingHorizontal: 0,
              marginBottom: isAndroidMediumOrSmall ? (isAndroidSmall ? scaleAndroidExtraCondensed(24) : scaleAndroidCondensed(24)) : scaleSpacing(24),
              width: '100%',
            }}
          >
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
                  marginBottom: 8,
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
                <View style={{ backgroundColor: theme.colors.primary, padding: 8, borderRadius: 6, marginRight: 12 }}>
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
                  marginTop: 8,
                  paddingHorizontal: isAndroidSmall ? scaleAndroidExtraCondensed(16) : 16,
                  paddingVertical: isAndroidSmall ? scaleAndroidExtraCondensed(8) : 12,
                  backgroundColor: '#F5F5F5',
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
                      fontSize: Platform.OS === 'android'
                        ? (isTablet ? 20 : (isSmallScreen ? 14 : 16))
                        : (isTablet ? 24 : (isSmallScreen ? 16 : 18)),
                      color: theme.colors.text.primary,
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
                  trackColor={{ false: '#E5E7EB', true: '#46D367' }}
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
                paddingVertical: isAndroidSmall ? scaleAndroidExtraCondensed(32) : 32,
                marginBottom: isAndroidSmall ? scaleAndroidExtraCondensed(16) : 16,
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
                    fontSize: Platform.OS === 'android'
                      ? (isTablet ? 22 : (isSmallScreen ? 16 : 18))
                      : (isTablet ? 26 : (isSmallScreen ? 18 : 20)),
                    color: theme.colors.primaryText,
                  },
                ]}
              >
                {selectedPlan === 'yearly' ? t('paywall.buttons.unlockNow') : t('paywall.buttons.tryFree')}
              </Text>
              <View
                style={{
                  position: 'absolute',
                  right: isAndroidSmall ? scaleAndroidExtraCondensed(16) : 16,
                }}
              >
                <Feather
                  name="arrow-right"
                  size={Platform.OS === 'android'
                    ? (isTablet ? 20 : (isSmallScreen ? 16 : 18))
                    : (isTablet ? 24 : (isSmallScreen ? 18 : 20))}
                  color={theme.colors.primaryText}
                />
              </View>
            </TouchableOpacity>

            {/* Links */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', columnGap: 24 }}>
              <TouchableOpacity onPress={onRestore}>
                <Text
                  style={[
                    getFontFamily('regular'),
                    {
                      fontSize: isAndroidSmall ? Math.round(12 * 0.8) : 12,
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
                      fontSize: isAndroidSmall ? Math.round(12 * 0.8) : 12,
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
