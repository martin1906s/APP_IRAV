import 'react-native-gesture-handler';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, LogBox, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import type { NavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Fraunces_400Regular,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { Syne_600SemiBold, Syne_700Bold } from '@expo-google-fonts/syne';
// import * as Notifications from 'expo-notifications';
import { container } from './src/composition/container';
import { RootTabs } from './src/presentation/navigation/RootTabs';
import { AuthProvider } from './src/presentation/auth/AuthContext';
import { AppErrorBoundary } from './src/presentation/components/AppErrorBoundary';
import { DailyMoodScreen } from './src/presentation/screens/DailyMoodScreen';
import { LoginScreen } from './src/presentation/screens/LoginScreen';
import { RegisterScreen } from './src/presentation/screens/RegisterScreen';
import { getStoredUser, clearSession } from './src/infrastructure/api/authStore';
import type { UserProfile } from './src/domain/entities/UserProfile';
import { colors } from './src/presentation/theme';
import { setAuthRefreshHandler } from './src/infrastructure/api/authRefresh';
import { registerPushToken } from './src/infrastructure/adapters/push/registerPushToken';
import { syncReminderFromSettings } from './src/infrastructure/adapters/inspiration/DailyNotification';
import { syncChallengeReminders } from './src/infrastructure/adapters/challenges/ChallengeNotifications';

LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported in Expo Go',
]);

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bgElevated,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

type AuthView = 'login' | 'register';

function handleDeepLink(
  url: string | null,
  navigation: NavigationContainerRef<any> | null,
  openMoodIfNeeded: () => void,
) {
  if (!url) return;
  if (url.includes('mood')) {
    openMoodIfNeeded();
    return;
  }
  if (url.includes('announcement')) {
    const id = url.split('announcement/')[1]?.split(/[?#/]/)[0];
    if (id && navigation) {
      navigation.navigate('HomeTab', {
        screen: 'AnnouncementDetail',
        params: { announcementId: id },
      });
    }
    return;
  }
  if (url.includes('challenge')) {
    navigation?.navigate('ChallengeTab');
    return;
  }
  if (!navigation) return;
  if (url.includes('chat')) {
    navigation.navigate('ChatTab');
    return;
  }
  if (url.includes('settings')) {
    navigation.navigate('SettingsTab');
    return;
  }
  if (url.includes('verse') || url.includes('home')) {
    navigation.navigate('HomeTab');
  }
}

export default function App() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const sessionRef = useRef<UserProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<UserProfile | null>(null);
  sessionRef.current = session;
  const [authView, setAuthView] = useState<AuthView>('login');
  const [needsMood, setNeedsMood] = useState(false);
  const [dailyMoodRequired, setDailyMoodRequired] = useState(true);

  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Syne_600SemiBold,
    Syne_700Bold,
  });

  const hydrateExtras = useCallback(async (user: UserProfile) => {
    container.ai.setProfile(user);
    void registerPushToken();
    try {
      const appConfig = await container.config.get();
      setDailyMoodRequired(appConfig.dailyMoodRequired);
      if (!appConfig.dailyMoodRequired) {
        setNeedsMood(false);
      } else {
        const today = await container.getTodayInspiration.execute();
        setNeedsMood(!today.mood);
      }
    } catch {
      try {
        const today = await container.getTodayInspiration.execute();
        setNeedsMood(!today.mood);
      } catch {
        setNeedsMood(false);
      }
    }
    try {
      const challenge = await container.challenges.getStatus();
      await syncChallengeReminders({
        enrolled: challenge.enrolled,
        hasChallengeToday: challenge.hasChallengeToday,
        todayCompleted: challenge.todayCompleted,
        notificationsEnabled: user.notificationsEnabled,
      });
    } catch {
      /* reto opcional al iniciar */
    }
    try {
      await syncReminderFromSettings(user);
    } catch {
      /* recordatorio opcional */
    }
  }, []);

  const restoreLocalSession = useCallback(async () => {
    const cached = await getStoredUser();
    if (!cached) {
      setSession(null);
      setReady(true);
      return;
    }
    container.ai.setProfile(cached);
    setSession(cached);
    setReady(true);
    void hydrateExtras(cached);
  }, [hydrateExtras]);

  const handleUnauthorized = useCallback(async () => {
    await clearSession();
    setSession(null);
    setAuthView('login');
    setReady(true);
  }, []);

  useEffect(() => {
    void restoreLocalSession();
    setAuthRefreshHandler(handleUnauthorized);
  }, [restoreLocalSession, handleUnauthorized]);

  useEffect(() => {
    const openMoodIfNeeded = async () => {
      try {
        const appConfig = await container.config.get();
        if (!appConfig.dailyMoodRequired) return;
        const today = await container.getTodayInspiration.execute();
        if (!today.mood) setNeedsMood(true);
      } catch {
        /* no interrumpir la navegación */
      }
    };

    Linking.getInitialURL().then((url) =>
      handleDeepLink(url, navigationRef.current, () => void openMoodIfNeeded()),
    );
    const linkSub = Linking.addEventListener('url', ({ url }) =>
      handleDeepLink(url, navigationRef.current, () => void openMoodIfNeeded()),
    );
    // COMENTADO POR AHORA PARA EXPO GO (SDK 53+ NO LO SOPORTA)
    // const notifSub = Notifications.addNotificationResponseReceivedListener((response) => {
    //   const uri = response.notification.request.content.data?.uri;
    //   if (typeof uri === 'string') {
    //     handleDeepLink(uri, navigationRef.current, () => void openMoodIfNeeded());
    //   }
    // });
    return () => {
      linkSub.remove();
      // notifSub.remove();
    };
  }, []);

  const onLoggedIn = async () => {
    const cached = await getStoredUser();
    if (!cached) return;
    container.ai.setProfile(cached);
    setSession(cached);
    void hydrateExtras(cached);
  };

  if (!ready || !fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!session) {
    return (
      <SafeAreaProvider>
        <AppErrorBoundary>
          {authView === 'login' ? (
            <LoginScreen
              onLoggedIn={onLoggedIn}
              onRegister={() => setAuthView('register')}
            />
          ) : (
            <RegisterScreen
              onDone={onLoggedIn}
              onLogin={() => setAuthView('login')}
            />
          )}
        </AppErrorBoundary>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider onUnauthorized={handleUnauthorized}>
        <AppErrorBoundary>
          <View style={{ flex: 1 }}>
            <NavigationContainer ref={navigationRef} theme={theme}>
              <RootTabs isAdmin={session.role === 'ADMIN'} />
            </NavigationContainer>
            {needsMood && dailyMoodRequired && session.role !== 'ADMIN' ? (
              <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 20 }}>
                <DailyMoodScreen onDone={() => setNeedsMood(false)} />
              </View>
            ) : null}
          </View>
        </AppErrorBoundary>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
