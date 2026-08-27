import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { Chapter } from '../../domain/entities/Verse';
import { container } from '../../composition/container';
import { ScreenShell } from '../templates/ScreenShell';
import { AppHeader } from '../organisms/AppHeader';
import { VerseList } from '../organisms/VerseList';
import { Chip } from '../atoms/Chip';
import { Spacer } from '../atoms/Spacer';
import { colors, spacing } from '../theme';

/** Pantalla: lectura de capítulo */
export function ChapterScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { versionId, versionName, bookId, bookName, chapters, verse } = route.params;

  const [chapter, setChapter] = useState(route.params.chapter ?? 1);
  const [data, setData] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await container.getChapter.execute(versionId, bookId, chapter);
    setData(result);
    setLoading(false);
  }, [versionId, bookId, chapter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScreenShell>
      <AppHeader
        title={`${bookName} ${chapter}`}
        subtitle={versionName}
        onBack={() => nav.goBack()}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chips}
        contentContainerStyle={styles.chipsContent}
      >
        {Array.from({ length: chapters }, (_, i) => i + 1).map((n) => (
          <Chip
            key={n}
            label={String(n)}
            selected={n === chapter}
            onPress={() => setChapter(n)}
            tone="sky"
            style={styles.chip}
          />
        ))}
      </ScrollView>
      <Spacer size="xs" />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <VerseList
          verses={data?.verses ?? []}
          focusVerse={chapter === route.params.chapter ? verse : undefined}
        />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexGrow: 0,
    flexShrink: 0,
    overflow: 'visible',
  },
  chipsContent: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
  },
  chip: {
    marginBottom: 0,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
