import { Pressable, StyleSheet } from 'react-native';
import type { Book } from '../../domain/entities/Book';
import { colors, fonts, spacing } from '../theme';
import { AppText } from '../atoms/AppText';

type Props = { book: Book; onPress: () => void };

/** Libro — fila limpia */
export function BookCard({ book, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <AppText variant="subtitle" numberOfLines={1} style={styles.name}>
        {book.name}
      </AppText>
      <AppText muted style={styles.meta}>
        {book.chapters} · {book.testament === 'AT' ? 'Antiguo' : 'Nuevo'}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: { fontFamily: fonts.displaySemi },
  meta: {
    marginTop: 2,
    fontSize: 13,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
