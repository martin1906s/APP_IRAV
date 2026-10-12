import { View, Text, StyleSheet, Image } from 'react-native';
import { GoldButton } from '../GoldButton';
import { colors, radius, spacing, typography, shadows } from '../../theme';

type Props = {
  title: string;
  timeLabel: string;
  onJoin: () => void;
};

export function LiveServiceBanner({ title, timeLabel, onJoin }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.mediaContainer}>
        {/* Aquí irá el reproductor HLS / expo-video más adelante.
            Por ahora un placeholder con el diseño actual */}
        <View style={styles.videoPlaceholder}>
          <Text style={styles.liveBadge}>LIVE</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.timeLabel}>{timeLabel}</Text>
        <GoldButton title="Unirse" onPress={onJoin} style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card,
    marginBottom: spacing.lg,
  },
  mediaContainer: {
    width: '100%',
    height: 180,
    backgroundColor: colors.vellumDark,
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.danger,
    color: colors.textLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.xs,
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  content: {
    padding: spacing.md,
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.subtitle.fontFamily,
    fontSize: 18,
    color: colors.text,
    marginBottom: 4,
  },
  timeLabel: {
    fontFamily: typography.body.fontFamily,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  button: {
    width: '100%',
  },
});
