import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeStack } from './HomeStack';
import { ChallengeStack } from './ChallengeStack';
import { AdminTabs } from './AdminTabs';
import {
  GuardedChatScreen,
  GuardedUserSettingsScreen,
} from '../auth/guardedScreens';
import { BibleStack } from './BibleStack';
import { colors, fonts } from '../theme';

const Tab = createBottomTabNavigator();

type Props = {
  isAdmin?: boolean;
};

/** Tabs principales — usuarios y administradores */
export function RootTabs({ isAdmin = false }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.bgElevated,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 56 + Math.max(insets.bottom, 6),
            paddingBottom: Math.max(insets.bottom, 6),
            paddingTop: 6,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontFamily: fonts.sansMedium,
            fontSize: 11,
            letterSpacing: 0.2,
          },
          tabBarIcon: ({ color, size, focused }) => {
            const map: Record<string, keyof typeof Ionicons.glyphMap> = {
              HomeTab: focused ? 'home' : 'home-outline',
              BibleTab: focused ? 'book' : 'book-outline',
              ChatTab: focused ? 'chatbubbles' : 'chatbubbles-outline',
              ChallengeTab: focused ? 'flame' : 'flame-outline',
              SettingsTab: focused ? 'settings' : 'settings-outline',
              AdminTab: focused ? 'shield' : 'shield-outline',
            };
            return <Ionicons name={map[route.name] ?? 'ellipse'} size={size} color={color} />;
          },
          tabBarLabel:
            route.name === 'HomeTab'
              ? 'Inicio'
              : route.name === 'BibleTab'
                ? 'Biblia'
                : route.name === 'ChatTab'
                  ? 'Jesús'
                  : route.name === 'ChallengeTab'
                    ? 'Reto'
                    : route.name === 'AdminTab'
                      ? 'Admin'
                      : 'Ajustes',
        })}
      >
        <Tab.Screen name="HomeTab" component={HomeStack} />
        <Tab.Screen name="BibleTab" component={BibleStack} />
        <Tab.Screen name="ChatTab" component={GuardedChatScreen} />
        <Tab.Screen name="ChallengeTab" component={ChallengeStack} />
        <Tab.Screen name="SettingsTab" component={GuardedUserSettingsScreen} />
        {isAdmin ? <Tab.Screen name="AdminTab" component={AdminTabs} /> : null}
      </Tab.Navigator>
  );
}
