import { TextInput, StyleSheet, TextInputProps, View } from 'react-native';
import { colors, fonts, radius, spacing, typography } from '../theme';

type Props = TextInputProps & {
  variant?: 'boxed' | 'underline' | 'glass';
};

/** Campo de texto */
export function AppInput({ variant = 'boxed', ...props }: Props) {
  if (variant === 'underline') {
    return (
      <View style={styles.underlineWrap}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          {...props}
          style={[styles.underline, props.style]}
        />
        <View style={styles.underlineBar} />
      </View>
    );
  }

  if (variant === 'glass') {
    return (
      <TextInput
        placeholderTextColor="rgba(255, 255, 255, 0.4)"
        {...props}
        style={[styles.glass, props.style]}
      />
    );
  }

  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      {...props}
      style={[styles.boxed, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  underlineWrap: { marginBottom: spacing.sm },
  underline: {
    ...typography.body,
    fontFamily: fonts.sans,
    color: colors.text,
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
    fontSize: 16,
  },
  underlineBar: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
  },
  boxed: {
    ...typography.body,
    fontFamily: fonts.sans,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    minHeight: 48,
  },
  glass: {
    ...typography.body,
    fontFamily: fonts.sans,
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    fontSize: 16,
    minHeight: 48,
  }
});
