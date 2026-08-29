import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  GuardedAdminAnnouncementFormScreen,
  GuardedAdminAnnouncementsScreen,
} from '../auth/guardedScreens';
import { colors } from '../theme';

export type AdminAnnouncementsStackParamList = {
  AdminAnnouncements: undefined;
  AdminAnnouncementForm: { announcementId?: string };
};

const Stack = createNativeStackNavigator<AdminAnnouncementsStackParamList>();

/** Anuncios y notificaciones */
export function AdminAnnouncementsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Screen name="AdminAnnouncements" component={GuardedAdminAnnouncementsScreen} />
      <Stack.Screen name="AdminAnnouncementForm" component={GuardedAdminAnnouncementFormScreen} />
    </Stack.Navigator>
  );
}
