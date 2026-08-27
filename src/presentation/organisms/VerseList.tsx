import { useEffect, useRef } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { Verse } from '../../domain/entities/Verse';
import { colors, fonts, spacing } from '../theme';
import { AppText } from '../atoms/AppText';

type Props = {
  verses: Verse[];
  focusVerse?: number;
};

/** Lectura de versículos */
export function VerseList({ verses, focusVerse }: Props) {
  const listRef = useRef<FlatList<Verse>>(null);
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

  return (
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
      renderItem={({ item }) => (
        <View style={[styles.row, item.number === focusVerse && styles.focused]}>
          <AppText variant="verse">
            <AppText style={styles.num}>{item.number} </AppText>
            {item.text}
          </AppText>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: spacing.xxl },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  focused: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomColor: colors.accent,
    borderBottomWidth: 2,
  },
  num: {
    fontFamily: fonts.sansSemi,
    color: colors.accent,
    fontSize: 15,
  },
});
