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
};

const TONE_BG: Record<NonNullable<Props['tone']>, string> = {
  pink: '#2A1820',
  mint: '#142220',
  sky: '#141E28',
  gold: '#1C1A14',
};

const TONE_BORDER: Record<NonNullable<Props['tone']>, string> = {
  pink: colors.pink,
  mint: colors.mint,
  sky: colors.sky,
  gold: colors.gold,
};

/** Opción seleccionable */
export function Chip({ label, selected, onPress, tone = 'gold', style, disabled }: Props) {
  const border = TONE_BORDER[tone];
  const bg = TONE_BG[tone];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.chip,
        { borderColor: selected ? border : colors.border, backgroundColor: selected ? bg : colors.bgCard },
        disabled && styles.disabled,
        style,
      ]}
    >
      <AppText
        variant="body"
        numberOfLines={1}
        style={[styles.label, selected && { color: colors.text }]}
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
