import { View, StyleSheet } from 'react-native';
import type { Book } from '../../domain/entities/Book';
import { BookCard } from '../molecules/BookCard';

type Props = { books: Book[]; onSelect: (book: Book) => void };

/** Lista de libros */
export function BookGrid({ books, onSelect }: Props) {
  return (
    <View style={styles.list}>
      {books.map((book) => (
        <BookCard key={book.id} book={book} onPress={() => onSelect(book)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
});
