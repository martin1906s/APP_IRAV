import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';

type Props = {
  isNightMode: boolean;
  onToggleNightMode: () => void;
  onIncreaseFont: () => void;
  onDecreaseFont: () => void;
  onToggleBookmark: () => void;
  isBookmarked: boolean;
  currentChapter?: number;
  onOpenChapterSelector?: () => void;
  onBack?: () => void;
};

export function BibleReaderHeader({ 
  isNightMode, 
  onToggleNightMode, 
  onIncreaseFont, 
  onDecreaseFont,
  onToggleBookmark,
  isBookmarked,
  currentChapter,
  onOpenChapterSelector,
  onBack
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable onPress={onBack} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={24} color={colors.textLight} />
        </Pressable>
        <Pressable onPress={onToggleNightMode} style={styles.nightModeToggle}>
          <Ionicons name={isNightMode ? "sunny" : "moon"} size={16} color={colors.textLight} />
          <Text style={styles.nightModeText}>{isNightMode ? "Día" : "Noche"}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.textLight} />
        </Pressable>
      </View>

      <View style={styles.controlsRow}>
        <View style={styles.fontControls}>
          <Pressable onPress={onDecreaseFont} style={styles.fontBtn}>
            <Text style={styles.fontBtnText}>- A</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable onPress={onIncreaseFont} style={styles.fontBtn}>
            <Text style={styles.fontBtnText}>A⁺</Text>
          </Pressable>
        </View>

        <Pressable onPress={onOpenChapterSelector} style={styles.chapterSelector}>
          <Text style={styles.chapterText}>Cap. {currentChapter || 1}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.text} />
        </Pressable>

        <Pressable onPress={onToggleBookmark}>
          <Ionicons 
            name={isBookmarked ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={colors.gold} 
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.purple,
    paddingTop: 50, // Safe area approx
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconButton: {
    padding: 4,
  },
  nightModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  nightModeText: {
    color: colors.textLight,
    fontFamily: typography.caption.fontFamily,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    padding: 8,
    borderRadius: radius.lg,
  },
  fontControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.vellumDark,
    borderRadius: radius.md,
  },
  fontBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fontBtnText: {
    fontFamily: typography.sansMedium,
    color: colors.text,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
  },
  chapterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.vellumDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  chapterText: {
    fontFamily: typography.sansMedium,
    color: colors.text,
  },
});
