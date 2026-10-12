import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { AppText } from './AppText';

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  tone?: 'pink' | 'mint' | 'sky' | 'gold';
  style?: ViewStyle;
  disabled?: boolean;
  variant?: 'boxed' | 'glass';
};

const TONE_BG: Record<NonNullable<Props['tone']>, string> = {
  pink: 'rgba(220, 76, 94, 0.1)', // danger/pink light
  mint: 'rgba(42, 157, 143, 0.1)', // success/mint light
  sky: 'rgba(74, 127, 181, 0.1)', // info/sky light
  gold: 'rgba(255, 215, 0, 0.15)', // goldSoft
};

const TONE_BORDER: Record<NonNullable<Props['tone']>, string> = {
  pink: colors.pink,
  mint: colors.mint,
  sky: colors.sky,
  gold: colors.gold,
};

/** Opción seleccionable */
export function Chip({ label, selected, onPress, tone = 'gold', style, disabled, variant = 'boxed' }: Props) {
  const border = TONE_BORDER[tone];
  const bg = TONE_BG[tone];
  
  const glassUnselectedBg = 'rgba(255, 255, 255, 0.1)';
  const glassUnselectedBorder = 'rgba(255, 255, 255, 0.2)';
  const glassSelectedBg = 'rgba(255, 255, 255, 0.25)';
  
  const isGlass = variant === 'glass';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.chip,
        { 
          borderColor: selected ? border : (isGlass ? glassUnselectedBorder : colors.border), 
          backgroundColor: selected ? (isGlass ? glassSelectedBg : bg) : (isGlass ? glassUnselectedBg : colors.bgElevated) 
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      <AppText
        variant="body"
        numberOfLines={1}
        style={[
          styles.label, 
          isGlass && { color: 'rgba(255, 255, 255, 0.7)' },
          selected && { color: isGlass ? '#ffffff' : colors.text }
        ]}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    textTransform: 'none',
    letterSpacing: 0,
    color: colors.textMuted,
  },
  disabled: { opacity: 0.5 },
});
