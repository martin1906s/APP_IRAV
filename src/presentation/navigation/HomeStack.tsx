import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  GuardedAnnouncementDetailScreen,
  GuardedAnnouncementsScreen,
  GuardedHomeScreen,
} from '../auth/guardedScreens';
import { colors } from '../theme';

export type HomeStackParamList = {
  HomeMain: undefined;
  Announcements: undefined;
  AnnouncementDetail: { announcementId: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

/** Inicio + anuncios */
export function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Screen name="HomeMain" component={GuardedHomeScreen} />
      <Stack.Screen name="Announcements" component={GuardedAnnouncementsScreen} />
      <Stack.Screen name="AnnouncementDetail" component={GuardedAnnouncementDetailScreen} />
    </Stack.Navigator>
  );
}
