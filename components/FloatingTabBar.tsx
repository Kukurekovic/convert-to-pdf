import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RF, RS } from '../utils/responsive';
import theme from '../theme/theme';

export default function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const getIconName = (routeName: string): keyof typeof Ionicons.glyphMap => {
    switch (routeName) {
      case 'Convert':
        return 'document-text-outline';
      case 'HistoryStack':
        return 'time-outline';
      case 'Settings':
        return 'settings-outline';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          bottom: Math.max(insets.bottom, RS(12)) + RS(12),
          left: RS(16) + insets.left,
          right: RS(16) + insets.right,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const descriptor = descriptors[route.key];
        if (!descriptor) return null;

        const { options } = descriptor;
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                isFocused && styles.iconContainerActive,
              ]}
            >
              <Ionicons
                name={getIconName(route.name)}
                size={RF(20)}
                color={isFocused ? '#2350E0' : '#000000'}
              />
            </View>
            <Text
              style={[
                styles.label,
                {
                  fontFamily: isFocused
                    ? 'Urbanist_700Bold'
                    : 'Urbanist_600SemiBold',
                  color: isFocused ? '#2350E0' : '#000000',
                },
              ]}
            >
              {typeof label === 'string' ? label : route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: RS(28),
    paddingVertical: RS(6),
    paddingHorizontal: RS(12),
    justifyContent: 'space-around',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: RS(2),
  },
  iconContainer: {
    width: RS(32),
    height: RS(32),
    borderRadius: RS(16),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  iconContainerActive: {
    backgroundColor: '#e1e5f2',
  },
  label: {
    fontSize: RF(10),
    marginTop: RS(2),
    textAlign: 'center',
  },
});
