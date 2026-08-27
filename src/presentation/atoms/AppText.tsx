import { Text, TextProps, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

type Variant = keyof typeof typography;

type Props = TextProps & {
  variant?: Variant;
  muted?: boolean;
  dark?: boolean;
  invert?: boolean;
};

/** Átomo: tipografía */
export function AppText({ variant = 'body', muted, dark, invert, style, ...rest }: Props) {
  return (
    <Text
      {...rest}
      style={[
        styles.base,
        typography[variant],
        muted && styles.muted,
        dark && styles.dark,
        invert && styles.invert,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: { color: colors.text },
  muted: { color: colors.textMuted },
  dark: { color: colors.textDark },
  invert: { color: colors.onAccent },
});
