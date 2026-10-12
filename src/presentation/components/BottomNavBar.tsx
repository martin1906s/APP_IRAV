import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Keyboard, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StackActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, typography, shadows, spacing } from '../theme';

export function BottomNavBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (isKeyboardVisible) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
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

        let iconName: keyof typeof Ionicons.glyphMap = 'ellipse';
        let label = '';
        let isChallenge = false;

        switch (route.name) {
          case 'HomeTab':
            iconName = isFocused ? 'home' : 'home-outline';
            label = 'Home';
            break;
          case 'BibleTab':
            iconName = isFocused ? 'book' : 'book-outline';
            label = 'Biblia';
            break;
          case 'ChatTab':
            iconName = isFocused ? 'chatbubbles' : 'chatbubbles-outline';
            label = 'Chat AI';
            break;
          case 'ChallengeTab':
            iconName = isFocused ? 'calendar' : 'calendar-outline';
            label = 'Retos';
            isChallenge = true;
            break;
          case 'AdminTab':
            iconName = isFocused ? 'shield' : 'shield-outline';
            label = 'Admin';
            break;
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tabButton}
          >
            <View style={styles.iconContainer}>
              <Ionicons 
                name={iconName} 
                size={24} 
                color={isFocused ? colors.purple : colors.textMuted} 
              />
              {isChallenge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>30</Text>
                </View>
              )}
            </View>
            <Text 
              style={[
                styles.label, 
                { color: isFocused ? colors.purple : colors.textMuted }
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.tabBarBg,
    paddingTop: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...shadows.bottomBar,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  label: {
    fontFamily: typography.tabLabel.fontFamily,
    fontSize: typography.tabLabel.fontSize,
  },
  badge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.gold,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: colors.bgElevated,
  },
  badgeText: {
    color: colors.textOnGold,
    fontSize: 9,
    fontFamily: typography.caption.fontFamily,
    fontWeight: 'bold',
  },
});
