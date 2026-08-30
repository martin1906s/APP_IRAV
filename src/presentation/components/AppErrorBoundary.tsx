import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../atoms/AppText';
import { colors, fonts, radius, spacing } from '../theme';

type Props = { children: ReactNode };
type State = { hasError: boolean };

/** Evita que un fallo de render deje la app en blanco. */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[IRAV] Error de pantalla', error.message, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.wrap}>
        <AppText variant="title">Algo se interrumpió</AppText>
        <AppText muted style={styles.hint}>
          Puedes continuar. Tu sesión sigue activa.
        </AppText>
        <Pressable style={styles.btn} onPress={() => this.setState({ hasError: false })}>
          <AppText style={styles.btnText}>Volver</AppText>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  hint: {
    textAlign: 'center',
    textTransform: 'none',
    letterSpacing: 0,
  },
  btn: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  btnText: {
    color: colors.onAccent,
    fontFamily: fonts.sansSemi,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
