import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, fonts, radius, spacing, typography } from '../theme';

/** Átomo: campo de texto */
export function AppInput(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    ...typography.body,
    fontFamily: fonts.sans,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
