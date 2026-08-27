import 'react-native-gesture-handler';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Linking, LogBox, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import type { NavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Fraunces_400Regular, Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import * as Notifications from 'expo-notifications';
import { container } from './src/composition/container';
import { RootTabs } from './src/presentation/navigation/RootTabs';
import { OnboardingScreen } from './src/presentation/screens/OnboardingScreen';
import { DailyMoodScreen } from './src/presentation/screens/DailyMoodScreen';
import { colors } from './src/presentation/theme';

// Expo Go: push remoto no existe; las locales sí. Silenciamos el error conocido.
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
  const [ready, setReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(true);
  const [needsMood, setNeedsMood] = useState(true);

  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  const refreshGates = useCallback(async () => {
    const profile = await container.getProfile.execute();
    if (profile) {
      container.ai.setProfile(profile);
      setNeedsOnboarding(false);
      const today = await container.getTodayInspiration.execute();
      setNeedsMood(!today.mood);
    } else {
      setNeedsOnboarding(true);
      setNeedsMood(true);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    refreshGates();
  }, [refreshGates]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshGates();
    });
    return () => sub.remove();
  }, [refreshGates]);

  useEffect(() => {
    const openMoodIfNeeded = async () => {
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

  if (!ready || !fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      {needsOnboarding ? (
        <OnboardingScreen
          onDone={() => {
            setNeedsOnboarding(false);
            setNeedsMood(true);
          }}
        />
      ) : needsMood ? (
        <DailyMoodScreen onDone={() => setNeedsMood(false)} />
      ) : (
        <NavigationContainer ref={navigationRef} theme={theme}>
          <RootTabs />
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}
