import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { AppText } from './AppText';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'accent';
  style?: ViewStyle;
  disabled?: boolean;
};

/** Átomo: botón */
export function AppButton({ label, onPress, variant = 'primary', style, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'ghost' && styles.ghost,
        variant === 'accent' && styles.accent,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <AppText
        variant="subtitle"
        invert={variant === 'primary' || variant === 'accent'}
        style={variant === 'ghost' ? styles.ghostLabel : undefined}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primary: { backgroundColor: colors.accent },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  accent: { backgroundColor: colors.accentWarm },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
  disabled: { opacity: 0.4 },
  ghostLabel: { color: colors.accent },
});
