import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import type { Verse } from '../../domain/entities/Verse';
import type { VerseHighlight } from '../../domain/entities/VerseHighlight';
import { colors, fonts, spacing } from '../theme';
import { AppText } from '../atoms/AppText';
import { HighlightColorPicker } from '../molecules/HighlightColorPicker';

type Props = {
  verses: Verse[];
  focusVerse?: number;
  highlights: VerseHighlight[];
  onHighlight: (verse: Verse, color: string) => void;
  onRemoveHighlight: (verse: Verse) => void;
};

/** Lectura con subrayado por color */
export function VerseList({
  verses,
  focusVerse,
  highlights,
  onHighlight,
  onRemoveHighlight,
}: Props) {
  const listRef = useRef<FlatList<Verse>>(null);
  const [pickerVerse, setPickerVerse] = useState<Verse | null>(null);

  const focusIndex = focusVerse
    ? verses.findIndex((verse) => verse.number === focusVerse)
    : -1;

  useEffect(() => {
    if (focusIndex < 0) return;
    const timer = setTimeout(() => {
      listRef.current?.scrollToIndex({
        index: focusIndex,
        animated: true,
        viewPosition: 0.25,
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [focusIndex]);

  const getHighlight = (n: number) =>
    highlights.find((h) => h.verse === n);

  const openPicker = (verse: Verse) => setPickerVerse(verse);
  const closePicker = () => setPickerVerse(null);

  const current = pickerVerse ? getHighlight(pickerVerse.number) : undefined;

  return (
    <>
      <FlatList
        ref={listRef}
        data={verses}
        keyExtractor={(v) => String(v.number)}
        contentContainerStyle={styles.list}
        onScrollToIndexFailed={({ index }) => {
          setTimeout(() => {
            listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.25 });
          }, 300);
        }}
        renderItem={({ item }) => {
          const hl = getHighlight(item.number);
          const isFocus = item.number === focusVerse;
          return (
            <Pressable
              onLongPress={() => openPicker(item)}
              delayLongPress={280}
              style={[
                styles.row,
                isFocus && styles.focused,
                hl && { borderLeftColor: hl.color, borderLeftWidth: 4 },
              ]}
            >
              {hl ? (
                <View
                  style={[
                    styles.highlightBar,
                    { backgroundColor: `${hl.color}33` },
                  ]}
                />
              ) : null}
              <AppText variant="verse" style={styles.verseText}>
                <AppText style={[styles.num, hl && { color: hl.color }]}>
                  {item.number}{' '}
                </AppText>
                <AppText style={hl ? { textDecorationLine: 'underline', textDecorationColor: hl.color } : undefined}>
                  {item.text}
                </AppText>
              </AppText>
            </Pressable>
          );
        }}
      />

      <HighlightColorPicker
        visible={!!pickerVerse}
        verseNumber={pickerVerse?.number ?? 0}
        currentColor={current?.color}
        onClose={closePicker}
        onSelect={(color) => {
          if (pickerVerse) onHighlight(pickerVerse, color);
          closePicker();
        }}
        onRemove={() => {
          if (pickerVerse) onRemoveHighlight(pickerVerse);
          closePicker();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: spacing.xxl },
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    borderLeftWidth: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  focused: {
    backgroundColor: colors.accentSoft,
  },
  highlightBar: {
    ...StyleSheet.absoluteFillObject,
    opacity: 1,
  },
  verseText: { zIndex: 1 },
  num: {
    fontFamily: fonts.sansSemi,
    color: colors.accent,
    fontSize: 15,
  },
});
