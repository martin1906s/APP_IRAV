import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../atoms/AppText';
import { colors, radius, spacing } from '../theme';

type Props = {
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

/** Desplegable de país */
export function CountrySelect({ value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <AppText variant="body">{value || 'Elige tu país'}</AppText>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <AppText variant="subtitle" style={styles.title}>
              País
            </AppText>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              style={styles.list}
              renderItem={({ item }) => {
                const selected = item === value;
                return (
                  <Pressable
                    style={[styles.option, selected && styles.optionSelected]}
                    onPress={() => {
                      onChange(item);
                      setOpen(false);
                    }}
                  >
                    <AppText
                      variant="body"
                      style={selected ? { color: colors.accent } : undefined}
                    >
                      {item}
                    </AppText>
                    {selected ? (
                      <Ionicons name="checkmark" size={18} color={colors.accent} />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '70%',
    paddingTop: spacing.md,
    overflow: 'hidden',
  },
  title: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  list: { paddingBottom: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  optionSelected: {
    backgroundColor: colors.bg,
  },
});
