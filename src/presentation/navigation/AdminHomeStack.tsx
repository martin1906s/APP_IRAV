import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GuardedAdminDashboardScreen } from '../auth/guardedScreens';
import { colors } from '../theme';

export type AdminHomeStackParamList = {
  AdminDashboard: undefined;
};

const Stack = createNativeStackNavigator<AdminHomeStackParamList>();

/** Panel principal del administrador */
export function AdminHomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Screen name="AdminDashboard" component={GuardedAdminDashboardScreen} />
    </Stack.Navigator>
  );
}
