import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from '../screens/HomeScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { BibleStack } from './BibleStack';
import { colors, fonts } from '../theme';

const Tab = createBottomTabNavigator();

/** Tabs principales */
export function RootTabs() {
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
            SettingsTab: focused ? 'settings' : 'settings-outline',
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
                : 'Ajustes',
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="BibleTab" component={BibleStack} />
      <Tab.Screen name="ChatTab" component={ChatScreen} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
