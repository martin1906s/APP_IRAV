import { useEffect, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { Book } from '../../domain/entities/Book';
import { container } from '../../composition/container';
import { ScreenShell } from '../templates/ScreenShell';
import { AppHeader } from '../organisms/AppHeader';
import { BookGrid } from '../organisms/BookGrid';
import { SearchField } from '../molecules/SearchField';
import { Chip } from '../atoms/Chip';
import { Spacer } from '../atoms/Spacer';

/** Pantalla: libros */
export function BooksScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { versionId, versionName } = route.params;

  const [books, setBooks] = useState<Book[]>([]);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'ALL' | 'AT' | 'NT'>('ALL');

  useEffect(() => {
    container.getBooks.execute().then(setBooks);
  }, []);

  const filtered = useMemo(() => {
    return books.filter((b) => {
      const okTab = tab === 'ALL' || b.testament === tab;
      const okQ = !q || b.name.toLowerCase().includes(q.toLowerCase());
      return okTab && okQ;
    });
  }, [books, q, tab]);

  return (
    <ScreenShell>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader title={versionName} subtitle="Elige un libro" onBack={() => nav.goBack()} />
        <SearchField value={q} onChangeText={setQ} placeholder="Buscar libro…" />
        <Spacer size="xs" />
        <Chip label="Todos" selected={tab === 'ALL'} onPress={() => setTab('ALL')} tone="sky" />
        <Chip label="Antiguo" selected={tab === 'AT'} onPress={() => setTab('AT')} tone="pink" />
        <Chip label="Nuevo" selected={tab === 'NT'} onPress={() => setTab('NT')} tone="mint" />
        <Spacer size="sm" />
        <BookGrid
          books={filtered}
          onSelect={(book) =>
            nav.navigate('Chapter', {
              versionId,
              versionName,
              bookId: book.id,
              bookName: book.name,
              chapters: book.chapters,
              chapter: 1,
            })
          }
        />
      </ScrollView>
    </ScreenShell>
  );
}
