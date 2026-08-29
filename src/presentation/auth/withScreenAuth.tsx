import { useCallback, useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { verifySession, type RequiredRole } from '../../infrastructure/api/sessionGuard';
import { useAuth } from './AuthContext';
import { colors } from '../theme';

function AuthGate({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </View>
  );
}

function useSessionGate(requiredRole: RequiredRole) {
  const { onUnauthorized } = useAuth();
  const [allowed, setAllowed] = useState(false);

  const revalidate = useCallback(() => {
    let active = true;
    setAllowed(false);

    void verifySession(requiredRole).then((user) => {
      if (!active) return;
      if (!user) {
        onUnauthorized();
        return;
      }
      setAllowed(true);
    });

    return () => {
      active = false;
    };
  }, [onUnauthorized, requiredRole]);

  return { allowed, revalidate };
}

function createFocusGuard<P extends object>(Screen: ComponentType<P>, requiredRole: RequiredRole) {
  return function FocusGuardedScreen(props: P) {
    const { allowed, revalidate } = useSessionGate(requiredRole);

    useFocusEffect(
      useCallback(() => {
        return revalidate();
      }, [revalidate]),
    );

    if (!allowed) {
      return (
        <AuthGate>
          <ActivityIndicator color={colors.accent} />
        </AuthGate>
      );
    }

    return <Screen {...props} />;
  };
}

function createMountGuard<P extends object>(Screen: ComponentType<P>, requiredRole: RequiredRole) {
  return function MountGuardedScreen(props: P) {
    const { allowed, revalidate } = useSessionGate(requiredRole);

    useEffect(() => revalidate(), [revalidate]);

    if (!allowed) {
      return (
        <AuthGate>
          <ActivityIndicator color={colors.accent} />
        </AuthGate>
      );
    }

    return <Screen {...props} />;
  };
}

/** Exige sesión válida y rol (al foco dentro de un navigator, o al montar fuera de él). */
export function withScreenAuth<P extends object>(
  Screen: ComponentType<P>,
  requiredRole: RequiredRole,
  mode: 'focus' | 'mount' = 'focus',
) {
  return mode === 'mount'
    ? createMountGuard(Screen, requiredRole)
    : createFocusGuard(Screen, requiredRole);
}
