import { ReactNode } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../theme';

type Props = {
  title?: string;
  subtitle?: string;
  onAvatarPress?: () => void;
  showLogo?: boolean;
  transparent?: boolean;
  rightAction?: ReactNode;
};

export function AppHeader({
  title,
  subtitle,
  onAvatarPress,
  showLogo = true,
  transparent = false,
  rightAction,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Math.max(insets.top, spacing.md) },
        transparent && styles.transparentContainer,
      ]}
    >
      <View style={styles.leftSection}>
        {showLogo && (
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/images/IRAV.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        )}
        <View style={styles.textStack}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      {rightAction ? (
        rightAction
      ) : (
        <Pressable 
          onPress={onAvatarPress} 
          style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}
        >
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={20} color={colors.textLight} />
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.purple,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  transparentContainer: {
    backgroundColor: 'transparent',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 2,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    color: colors.textLight,
    fontFamily: typography.subtitle.fontFamily,
    fontSize: typography.subtitle.fontSize,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
  },
  textStack: {
    justifyContent: 'center',
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.gold,
  },
  pressed: {
    opacity: 0.7,
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: colors.textLight,
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
  },
});
