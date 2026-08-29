import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '../atoms/AppText';
import { LogoMark } from './LogoMark';
import { colors, spacing } from '../theme';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Layout de autenticación con marca IRAV */
export function AuthStage({ title, subtitle, children, footer }: Props) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <LogoMark size={64} />
          <AppText variant="hero" style={styles.title}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText muted style={styles.subtitle}>
              {subtitle}
            </AppText>
          ) : null}
        </View>

        <View style={styles.form}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: spacing.xxl, paddingTop: spacing.xl },
  header: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: { textAlign: 'center' },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 15,
    lineHeight: 22,
    textTransform: 'none',
    letterSpacing: 0,
    textAlign: 'center',
  },
  form: { gap: spacing.xs },
  footer: { marginTop: spacing.xl },
});
