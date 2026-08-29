import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../atoms/AppText';
import { HIGHLIGHT_COLORS } from '../../shared/constants/highlightColors';
import { colors, fonts, spacing } from '../theme';

type Props = {
  visible: boolean;
  verseNumber: number;
  currentColor?: string;
  onSelect: (color: string) => void;
  onRemove: () => void;
  onClose: () => void;
};

/** Selector de color para subrayar versículos */
export function HighlightColorPicker({
  visible,
  verseNumber,
  currentColor,
  onSelect,
  onRemove,
  onClose,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <AppText style={styles.heading}>Versículo {verseNumber}</AppText>
          <AppText style={styles.hint}>Elige un color para subrayar</AppText>

          <View style={styles.colors}>
            {HIGHLIGHT_COLORS.map((c) => {
              const active = currentColor?.toUpperCase() === c.hex.toUpperCase();
              return (
                <Pressable
                  key={c.id}
                  onPress={() => onSelect(c.hex)}
                  style={[styles.swatch, { backgroundColor: c.hex }, active && styles.swatchActive]}
                >
                  {active ? <Ionicons name="checkmark" size={18} color="#1A1208" /> : null}
                </Pressable>
              );
            })}
          </View>

          {currentColor ? (
            <Pressable onPress={onRemove} style={styles.removeBtn}>
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
              <AppText style={styles.removeText}>Quitar subrayado</AppText>
            </Pressable>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgCard,
    borderTopWidth: 3,
    borderTopColor: colors.accent,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heading: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    color: colors.text,
    textTransform: 'none',
    letterSpacing: 0,
  },
  hint: {
    marginTop: 4,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textMuted,
    textTransform: 'none',
    letterSpacing: 0,
  },
  colors: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchActive: {
    borderWidth: 2,
    borderColor: colors.text,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  removeText: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.danger,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
