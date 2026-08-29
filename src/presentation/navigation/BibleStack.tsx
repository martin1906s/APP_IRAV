import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  GuardedBooksScreen,
  GuardedChapterScreen,
  GuardedVersionsScreen,
} from '../auth/guardedScreens';
import { colors } from '../theme';

export type BibleStackParamList = {
  Versions: undefined;
  Books: { versionId: string; versionName: string };
  Chapter: {
    versionId: string;
    versionName: string;
    bookId: number;
    bookName: string;
    chapters: number;
    chapter: number;
    verse?: number;
  };
};

const Stack = createNativeStackNavigator<BibleStackParamList>();

/** Stack Biblia */
export function BibleStack() {
  return (
    <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="Versions" component={GuardedVersionsScreen} />
        <Stack.Screen name="Books" component={GuardedBooksScreen} />
        <Stack.Screen name="Chapter" component={GuardedChapterScreen} />
      </Stack.Navigator>
  );
}
