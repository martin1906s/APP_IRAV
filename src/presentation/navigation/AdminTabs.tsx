import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GuardedAdminSettingsScreen } from '../auth/guardedScreens';
import { AdminHomeStack } from './AdminHomeStack';
import { AdminUsersStack } from './AdminUsersStack';
import { AdminAnnouncementsStack } from './AdminAnnouncementsStack';

const Stack = createNativeStackNavigator();

/** Stack del administrador (convertido de Tabs para evitar 2 bottom bars) */
export function AdminTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminPanel" component={AdminHomeStack} />
      <Stack.Screen name="AdminUsersTab" component={AdminUsersStack} />
      <Stack.Screen name="AdminAnnouncementsTab" component={AdminAnnouncementsStack} />
      <Stack.Screen name="AdminSystemTab" component={GuardedAdminSettingsScreen} />
    </Stack.Navigator>
  );
}
