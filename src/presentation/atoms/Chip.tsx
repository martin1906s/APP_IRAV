import { Platform, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { AppText } from './AppText';

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  tone?: 'pink' | 'mint' | 'sky';
  style?: ViewStyle;
};

/** Átomo: chip seleccionable */
export function Chip({ label, selected, onPress, tone = 'mint', style }: Props) {
  const bg = { pink: colors.pink, mint: colors.mint, sky: colors.sky }[tone];
  return (
    <Pressable
      onPress={onPress}
      style={[styles.base, selected ? { backgroundColor: bg } : styles.idle, style]}
    >
      <AppText
        invert={selected}
        variant="body"
        numberOfLines={1}
        style={[styles.label, selected && styles.labelOn]}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: radius.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  idle: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 15,
    lineHeight: 24,
    textTransform: 'none',
    letterSpacing: 0,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
  labelOn: {
    fontWeight: '600',
    color: colors.onAccent,
  },
});
