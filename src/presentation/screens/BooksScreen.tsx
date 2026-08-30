import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { Book } from '../../domain/entities/Book';
import { container } from '../../composition/container';
import { ScreenShell } from '../templates/ScreenShell';
import { AppHeader } from '../organisms/AppHeader';
import { BookCard } from '../molecules/BookCard';
import { SearchField } from '../molecules/SearchField';
import { AlphabetIndex } from '../molecules/AlphabetIndex';
import { Chip } from '../atoms/Chip';
import { Spacer } from '../atoms/Spacer';
import {
  buildIndexKeys,
  getBookIndexKey,
  sortBooksAlphabetically,
} from '../../shared/utils/bookSort';
import { spacing } from '../theme';

/** Pantalla: libros con índice alfabético */
export function BooksScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { versionId, versionName } = route.params;

  const listRef = useRef<FlatList<Book>>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'ALL' | 'AT' | 'NT'>('ALL');
  const [activeKey, setActiveKey] = useState<string>();

  useEffect(() => {
    void container.getBooks.execute().then(setBooks).catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    const list = books.filter((b) => {
      const okTab = tab === 'ALL' || b.testament === tab;
      const okQ = !q || b.name.toLowerCase().includes(q.toLowerCase());
      return okTab && okQ;
    });
    return sortBooksAlphabetically(list);
  }, [books, q, tab]);

  const indexKeys = useMemo(() => buildIndexKeys(filtered), [filtered]);

  const scrollToKey = (key: string) => {
    const idx = filtered.findIndex((b) => getBookIndexKey(b.name) === key);
    if (idx < 0) return;
    setActiveKey(key);
    listRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0 });
  };

  const openBook = (book: Book) => {
    nav.navigate('Chapter', {
      versionId,
      versionName,
      bookId: book.id,
      bookName: book.name,
      chapters: book.chapters,
      chapter: 1,
    });
  };

  return (
    <ScreenShell>
      <AppHeader title={versionName} subtitle="Elige un libro" onBack={() => nav.goBack()} />
      <SearchField value={q} onChangeText={setQ} placeholder="Buscar libro…" />
      <Spacer size="xs" />
      <Chip label="Todos" selected={tab === 'ALL'} onPress={() => setTab('ALL')} tone="sky" />
      <Chip label="Antiguo" selected={tab === 'AT'} onPress={() => setTab('AT')} tone="pink" />
      <Chip label="Nuevo" selected={tab === 'NT'} onPress={() => setTab('NT')} tone="mint" />
      <Spacer size="sm" />
      <View style={styles.listWrap}>
        <FlatList
          ref={listRef}
          data={filtered}
          keyExtractor={(b) => String(b.id)}
          renderItem={({ item }) => <BookCard book={item} onPress={() => openBook(item)} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              listRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
                viewPosition: 0,
              });
            }, 120);
          }}
          onMomentumScrollEnd={(e) => {
            const rowH = 64;
            const idx = Math.round(e.nativeEvent.contentOffset.y / rowH);
            const book = filtered[Math.min(idx, filtered.length - 1)];
            if (book) setActiveKey(getBookIndexKey(book.name));
          }}
        />
        {!q ? (
          <AlphabetIndex keys={indexKeys} activeKey={activeKey} onSelect={scrollToKey} />
        ) : null}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  listWrap: {
    flex: 1,
    position: 'relative',
  },
  listContent: {
    paddingRight: spacing.xl,
    paddingBottom: spacing.xxl,
  },
});
