import 'react-native-gesture-handler';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Linking, LogBox, View } from 'react-native';
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
import * as Notifications from 'expo-notifications';
import { container } from './src/composition/container';
import { RootTabs } from './src/presentation/navigation/RootTabs';
import { AuthProvider } from './src/presentation/auth/AuthContext';
import { GuardedDailyMoodScreen } from './src/presentation/auth/guardedScreens';
import { LoginScreen } from './src/presentation/screens/LoginScreen';
import { RegisterScreen } from './src/presentation/screens/RegisterScreen';
import { getStoredUser, clearSession } from './src/infrastructure/api/authStore';
import { verifySession } from './src/infrastructure/api/sessionGuard';
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
  const [needsMood, setNeedsMood] = useState(true);
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

  const refreshSession = useCallback(async () => {
    const cached = await getStoredUser();
    if (!cached) {
      setSession(null);
      setReady(true);
      return;
    }
    const remote = await container.auth.me();
    const user = remote ?? cached;
    if (user) {
      container.ai.setProfile(user);
      setSession(user);
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
        const today = await container.getTodayInspiration.execute();
        setNeedsMood(!today.mood);
      }
      void registerPushToken();
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
    } else {
      setSession(null);
    }
    setReady(true);
  }, []);

  const handleUnauthorized = useCallback(async () => {
    await clearSession();
    setSession(null);
    setAuthView('login');
    setReady(true);
  }, []);

  const handleNavStateChange = useCallback(() => {
    if (!session) return;
    const role = session.role === 'ADMIN' ? 'ADMIN' : 'USER';
    void verifySession(role).then((user) => {
      if (!user) void handleUnauthorized();
    });
  }, [session, handleUnauthorized]);

  useEffect(() => {
    refreshSession();
    setAuthRefreshHandler(handleUnauthorized);
  }, [refreshSession, handleUnauthorized]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshSession();
    });
    return () => sub.remove();
  }, [refreshSession]);

  useEffect(() => {
    const openMoodIfNeeded = async () => {
      try {
        const appConfig = await container.config.get();
        if (!appConfig.dailyMoodRequired) return;
      } catch {
        /* usar comportamiento por defecto */
      }
      const today = await container.getTodayInspiration.execute();
      if (!today.mood) setNeedsMood(true);
    };

    Linking.getInitialURL().then((url) =>
      handleDeepLink(url, navigationRef.current, () => void openMoodIfNeeded()),
    );
    const linkSub = Linking.addEventListener('url', ({ url }) =>
      handleDeepLink(url, navigationRef.current, () => void openMoodIfNeeded()),
    );
    const notifSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const uri = response.notification.request.content.data?.uri;
      if (typeof uri === 'string') {
        handleDeepLink(uri, navigationRef.current, () => void openMoodIfNeeded());
      }
    });
    return () => {
      linkSub.remove();
      notifSub.remove();
    };
  }, []);

  const onLoggedIn = async () => {
    await refreshSession();
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
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider onUnauthorized={handleUnauthorized}>
        {needsMood && dailyMoodRequired && session.role !== 'ADMIN' ? (
          <GuardedDailyMoodScreen onDone={() => setNeedsMood(false)} />
        ) : (
          <NavigationContainer ref={navigationRef} theme={theme} onStateChange={handleNavStateChange}>
            <RootTabs isAdmin={session.role === 'ADMIN'} />
          </NavigationContainer>
        )}
      </AuthProvider>
    </SafeAreaProvider>
  );
}
