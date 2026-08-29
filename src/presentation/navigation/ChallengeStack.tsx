import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GuardedChallengeScreen } from '../auth/guardedScreens';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

/** Reto de 30 días */
export function ChallengeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Screen name="ChallengeMain" component={GuardedChallengeScreen} />
    </Stack.Navigator>
  );
}
