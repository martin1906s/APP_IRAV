import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { refreshAuth } from '../../infrastructure/api/authRefresh';
import { AppText } from '../atoms/AppText';
import { AppErrorView } from './AppErrorView';
import { colors, fonts, radius, spacing } from '../theme';

type Props = { children: ReactNode };
type State = { hasError: boolean; error?: Error };

/** Evita que un fallo de render deje la app en blanco. */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[IRAV] Error de pantalla', error.message, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <AppErrorView
        error={this.state.error?.message}
        onRetry={() => {
          this.setState({ hasError: false, error: undefined });
          refreshAuth();
        }}
      />
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
