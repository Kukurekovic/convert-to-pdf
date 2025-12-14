import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Switch, Animated, Linking, Platform, ScrollView, Dimensions } from 'react-native';
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
  const { isTablet, scaleSpacing, scaleFont, isAndroidMediumOrSmall, scaleAndroidCondensed, isAndroidSmall, scaleAndroidExtraCondensed } = useResponsive();

  // Additional detection for screen sizes
  const { width, height } = Dimensions.get('window');
  const minDimension = Math.min(width, height);
  const isLargeScreen = minDimension >= 768;
  const isSmallScreen = minDimension < 376;

  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'trial'>('trial');
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(true);
  const giftRotateValue = useRef(new Animated.Value(0)).current;
  const giftScaleValue = useRef(new Animated.Value(1)).current;

  // Gift animation effect
  useEffect(() => {
    if (visible) {
      giftRotateValue.setValue(0);
      giftScaleValue.setValue(1);

      const startGiftAnimation = () => {
        Animated.sequence([
          Animated.delay(1000),
          Animated.loop(
            Animated.sequence([
              Animated.parallel([
                Animated.sequence([
                  Animated.timing(giftRotateValue, { toValue: 10, duration: 130, useNativeDriver: true }),
                  Animated.timing(giftRotateValue, { toValue: -10, duration: 130, useNativeDriver: true }),
                  Animated.timing(giftRotateValue, { toValue: 8, duration: 150, useNativeDriver: true }),
                  Animated.timing(giftRotateValue, { toValue: -8, duration: 150, useNativeDriver: true }),
                  Animated.timing(giftRotateValue, { toValue: 6, duration: 170, useNativeDriver: true }),
                  Animated.timing(giftRotateValue, { toValue: -6, duration: 170, useNativeDriver: true }),
                  Animated.timing(giftRotateValue, { toValue: 0, duration: 190, useNativeDriver: true }),
                ]),
                Animated.sequence([
                  Animated.timing(giftScaleValue, { toValue: 1.05, duration: 500, useNativeDriver: true }),
                  Animated.timing(giftScaleValue, { toValue: 1, duration: 350, useNativeDriver: true }),
                ]),
              ]),
              Animated.delay(2000),
            ])
          )
        ]).start();
      };

      startGiftAnimation();
    } else {
      giftRotateValue.setValue(0);
      giftScaleValue.setValue(1);
    }
  }, [visible, giftRotateValue, giftScaleValue]);

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

  const annualPackage = getPackageByType('ANNUAL');
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

  // Use gift image from config, or default
  const giftImage = config.assets?.giftImage || require('../assets/gift.png');

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
        <View
          style={{
            paddingHorizontal: isLargeScreen ? scaleSpacing(48) : (isAndroidMediumOrSmall ? (isAndroidSmall ? scaleAndroidExtraCondensed(24) : scaleAndroidCondensed(24)) : scaleSpacing(24)),
            alignSelf: 'center',
            width: '100%',
          }}
        >
          {/* Close Button */}
          <View style={{
            position: 'absolute',
            top: isLargeScreen ? scaleSpacing(32) : scaleSpacing(64),
            left: isLargeScreen ? scaleSpacing(16) : (isTablet ? scaleSpacing(48) : scaleSpacing(24)),
            padding: isAndroidSmall ? scaleAndroidExtraCondensed(8) : scaleSpacing(8),
            zIndex: 10,
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: isAndroidSmall ? scaleAndroidExtraCondensed(28) : scaleSpacing(28),
                height: isAndroidSmall ? scaleAndroidExtraCondensed(28) : scaleSpacing(28),
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Feather
                name="x"
                size={isTablet ? responsiveDimensions.iconSize.large.tablet : (isAndroidSmall ? scaleAndroidExtraCondensed(responsiveDimensions.iconSize.large.phone) : responsiveDimensions.iconSize.large.phone)}
                color="#C7C5C5"
              />
            </TouchableOpacity>
          </View>

          {/* Top Section - Gift Image and Title */}
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: isLargeScreen ? scaleSpacing(16) : (isAndroidMediumOrSmall ? (isAndroidSmall ? scaleAndroidExtraCondensed(56) : scaleAndroidCondensed(56)) : scaleSpacing(56)),
            width: '100%',
          }}>
            {/* Animated Gift Image */}
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: giftRotateValue.interpolate({
                      inputRange: [-15, 15],
                      outputRange: ['-15deg', '15deg'],
                    }),
                  },
                  { scale: giftScaleValue },
                ],
              }}
            >
              <Image
                source={giftImage}
                style={{
                  width: Platform.OS === 'android'
                    ? (isTablet ? scaleSpacing(140) : (isAndroidSmall ? scaleAndroidExtraCondensed(160) : scaleSpacing(160)))
                    : (isTablet ? scaleSpacing(160) : scaleSpacing(192)),
                  height: Platform.OS === 'android'
                    ? (isTablet ? scaleSpacing(140) : (isAndroidSmall ? scaleAndroidExtraCondensed(160) : scaleSpacing(160)))
                    : (isTablet ? scaleSpacing(160) : scaleSpacing(192)),
                  marginBottom: isAndroidMediumOrSmall ? (isAndroidSmall ? scaleAndroidExtraCondensed(8) : scaleAndroidCondensed(8)) : scaleSpacing(8),
                }}
                resizeMode="contain"
              />
            </Animated.View>

            {/* Title */}
            <Text
              style={[
                getFontFamily('bold'),
                {
                  fontSize: Platform.OS === 'android'
                    ? (isTablet ? 32 : (isAndroidSmall ? Math.round(responsiveDimensions.fontSize.xl.phone * 0.85) : (isSmallScreen ? 18 : responsiveDimensions.fontSize.xl.phone)))
                    : (isTablet ? 36 : (isSmallScreen ? 20 : responsiveDimensions.fontSize['2xl'].phone)),
                  color: theme.colors.text.primary,
                  textAlign: 'center',
                  alignSelf: 'stretch',
                  marginHorizontal: 0,
                },
              ]}
            >
              {t('paywall.title')}
            </Text>
          </View>

          {/* Middle Section - Features and Plans */}
          <View
            className="flex-1 justify-center items-center"
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
              {/* Yearly Plan */}
              <TouchableOpacity
                style={{
                  width: isLargeScreen ? 'auto' : '100%',
                  borderWidth: 2,
                  borderColor: selectedPlan === 'yearly' ? theme.colors.border.selected : theme.colors.border.default,
                  backgroundColor: selectedPlan === 'yearly' ? `${theme.colors.primary}10` : theme.colors.background,
                  borderRadius: 12,
                  padding: 8,
                  marginBottom: 12,
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

              {/* Trial Plan */}
              <TouchableOpacity
                style={{
                  width: isLargeScreen ? 'auto' : '100%',
                  borderWidth: 2,
                  borderColor: selectedPlan === 'trial' ? theme.colors.border.selected : theme.colors.border.default,
                  backgroundColor: selectedPlan === 'trial' ? `${theme.colors.primary}10` : theme.colors.background,
                  borderRadius: 12,
                  padding: 8,
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
                      fontSize: isTablet ? 20 : (isAndroidSmall ? Math.round(18 * 0.8) : (isSmallScreen ? 16 : 18)),
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
