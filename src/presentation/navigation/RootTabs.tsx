import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeStack } from './HomeStack';
import { ChallengeStack } from './ChallengeStack';
import { GuardedChatScreen } from '../auth/guardedScreens';
import { BibleStack } from './BibleStack';
import { AdminTabs } from './AdminTabs';
import { BottomNavBar } from '../components/BottomNavBar';
import { colors } from '../theme';
import { View } from 'react-native';

const Tab = createBottomTabNavigator();

/** Tabs principales: Home, Biblia, Chat AI, Retos y Admin (condicional) */
export function RootTabs({ isAdmin }: { isAdmin?: boolean }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Tab.Navigator
        tabBar={(props) => <BottomNavBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          // Evitar que el contenido quede debajo de la barra flotante absoluta
          sceneStyle: { paddingBottom: 80, backgroundColor: colors.bg },
        }}
      >
        <Tab.Screen name="HomeTab" component={HomeStack} />
        <Tab.Screen name="BibleTab" component={BibleStack} />
        <Tab.Screen
          name="ChatTab"
          component={GuardedChatScreen}
          options={{ sceneStyle: { paddingBottom: 0, backgroundColor: colors.bg } }}
        />
        <Tab.Screen name="ChallengeTab" component={ChallengeStack} />
        {isAdmin && <Tab.Screen name="AdminTab" component={AdminTabs} />}
      </Tab.Navigator>
    </View>
  );
}
