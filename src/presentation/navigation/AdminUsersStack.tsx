import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  GuardedAdminUserDetailScreen,
  GuardedAdminUserFormScreen,
  GuardedAdminUsersScreen,
} from '../auth/guardedScreens';
import { colors } from '../theme';

export type AdminUsersStackParamList = {
  AdminUsers: undefined;
  AdminUserDetail: { userId: string };
  AdminUserForm: { userId?: string };
};

const Stack = createNativeStackNavigator<AdminUsersStackParamList>();

/** Gestión de jóvenes */
export function AdminUsersStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Screen name="AdminUsers" component={GuardedAdminUsersScreen} />
      <Stack.Screen name="AdminUserDetail" component={GuardedAdminUserDetailScreen} />
      <Stack.Screen name="AdminUserForm" component={GuardedAdminUserFormScreen} />
    </Stack.Navigator>
  );
}
