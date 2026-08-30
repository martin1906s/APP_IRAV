import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { Chapter } from '../../domain/entities/Verse';
import type { VerseHighlight } from '../../domain/entities/VerseHighlight';
import { container } from '../../composition/container';
import { saveLastReading } from '../../infrastructure/adapters/reading/LastReadingStore';
import { ScreenShell } from '../templates/ScreenShell';
import { AppHeader } from '../organisms/AppHeader';
import { VerseList } from '../organisms/VerseList';
import { Chip } from '../atoms/Chip';
import { AppText } from '../atoms/AppText';
import { Spacer } from '../atoms/Spacer';
import { colors, fonts, spacing } from '../theme';

export function ChapterScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { versionId, versionName, bookId, bookName, chapters, verse } = route.params;

  const [chapter, setChapter] = useState(route.params.chapter ?? 1);
  const [data, setData] = useState<Chapter | null>(null);
  const [highlights, setHighlights] = useState<VerseHighlight[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHighlights = useCallback(async () => {
    try {
      const rows = await container.highlights.listForChapter(versionId, bookId, chapter);
      setHighlights(rows);
    } catch {
      setHighlights([]);
    }
  }, [versionId, bookId, chapter]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await container.getChapter.execute(versionId, bookId, chapter);
      setData(result);
      await loadHighlights();
      await saveLastReading({
        versionId,
        versionName,
        bookId,
        bookName,
        chapters,
        chapter,
        verse,
      });
    } catch {
      /* conservar el capítulo ya mostrado */
    } finally {
      setLoading(false);
    }
  }, [versionId, versionName, bookId, bookName, chapters, chapter, verse, loadHighlights]);

  useEffect(() => {
    load();
  }, [load]);

  const handleHighlight = async (v: { number: number; text: string }, color: string) => {
    try {
      const saved = await container.highlights.upsert({
        versionId,
        bookId,
        bookName,
        chapter,
        verse: v.number,
        verseText: v.text,
        color,
      });
      setHighlights((prev) => {
        const rest = prev.filter((h) => h.verse !== v.number);
        return [...rest, saved].sort((a, b) => a.verse - b.verse);
      });
    } catch {
      /* el subrayado no debe sacar de la lectura */
    }
  };

  const handleRemove = async (v: { number: number }) => {
    try {
      const existing = highlights.find((h) => h.verse === v.number);
      if (existing) {
        await container.highlights.remove(existing.id);
      } else {
        await container.highlights.removeByVerse(versionId, bookId, chapter, v.number);
      }
      setHighlights((prev) => prev.filter((h) => h.verse !== v.number));
    } catch {
      /* el subrayado no debe sacar de la lectura */
    }
  };

  const goBack = () => {
    if (nav.canGoBack()) {
      nav.goBack();
      return;
    }
    nav.navigate('Books', { versionId, versionName });
  };

  return (
    <ScreenShell>
      <AppHeader title={`${bookName} ${chapter}`} subtitle={versionName} onBack={goBack} />
      <AppText style={styles.hint}>Mantén presionado un versículo para subrayar</AppText>
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
            tone="gold"
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
          highlights={highlights}
          onHighlight={handleHighlight}
          onRemoveHighlight={handleRemove}
        />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'none',
    letterSpacing: 0,
  },
  chips: { flexGrow: 0, flexShrink: 0 },
  chipsContent: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
  },
  chip: { marginBottom: 0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
