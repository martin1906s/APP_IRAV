import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VersionsScreen } from '../screens/VersionsScreen';
import { BooksScreen } from '../screens/BooksScreen';
import { ChapterScreen } from '../screens/ChapterScreen';
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
      <Stack.Screen name="Versions" component={VersionsScreen} />
      <Stack.Screen name="Books" component={BooksScreen} />
      <Stack.Screen name="Chapter" component={ChapterScreen} />
    </Stack.Navigator>
  );
}
