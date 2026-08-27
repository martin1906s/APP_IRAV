import { Pressable, StyleSheet, View } from 'react-native';
import type { BibleVersion } from '../../domain/entities/BibleVersion';
import { colors, fonts, radius, spacing } from '../theme';
import { AppText } from '../atoms/AppText';

type Props = { version: BibleVersion; onPress: () => void; index?: number };

/** Versión bíblica — fila editorial */
export function VersionCard({ version, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.mark}>
        <AppText invert variant="caption" style={styles.markText}>
          {version.shortName}
        </AppText>
      </View>
      <View style={styles.body}>
        <AppText variant="subtitle">{version.name}</AppText>
        <AppText muted style={styles.lang}>
          {version.language}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mark: {
    minWidth: 52,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  markText: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
  },
  body: { flex: 1, gap: 2 },
  lang: {
    fontSize: 13,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
