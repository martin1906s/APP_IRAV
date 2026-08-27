import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';
import { AppInput } from '../atoms/AppInput';

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
};

/** Búsqueda */
export function SearchField({ value, onChangeText, placeholder = 'Buscar…' }: Props) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="search" size={18} color={colors.textMuted} />
      <AppInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
});
