import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GuardedAdminSettingsScreen } from '../auth/guardedScreens';
import { AdminHomeStack } from './AdminHomeStack';
import { AdminUsersStack } from './AdminUsersStack';
import { AdminAnnouncementsStack } from './AdminAnnouncementsStack';
import { colors, fonts } from '../theme';

const Tab = createBottomTabNavigator();

/** Tabs del administrador */
export function AdminTabs() {
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
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: fonts.sansMedium,
          fontSize: 11,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const map: Record<string, keyof typeof Ionicons.glyphMap> = {
            AdminPanel: focused ? 'grid' : 'grid-outline',
            AdminUsersTab: focused ? 'people' : 'people-outline',
            AdminAnnouncementsTab: focused ? 'megaphone' : 'megaphone-outline',
            AdminSystemTab: focused ? 'settings' : 'settings-outline',
          };
          return <Ionicons name={map[route.name] ?? 'ellipse'} size={size} color={color} />;
        },
        tabBarLabel:
          route.name === 'AdminPanel'
            ? 'Panel'
            : route.name === 'AdminUsersTab'
              ? 'Jóvenes'
              : route.name === 'AdminAnnouncementsTab'
                ? 'Anuncios'
                : 'Sistema',
      })}
    >
      <Tab.Screen name="AdminPanel" component={AdminHomeStack} />
      <Tab.Screen name="AdminUsersTab" component={AdminUsersStack} />
      <Tab.Screen name="AdminAnnouncementsTab" component={AdminAnnouncementsStack} />
      <Tab.Screen name="AdminSystemTab" component={GuardedAdminSettingsScreen} />
    </Tab.Navigator>
  );
}
