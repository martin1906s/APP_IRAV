import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { GoldButton } from '../GoldButton';
import { ProgressBar } from '../ProgressBar';
import { colors, spacing, typography } from '../../theme';

type Props = {
  dayNumber: number;
  totalDays?: number;
  title: string;
  isCompleted: boolean;
  onComplete: () => void;
};

export function DailyChallengeCard({ dayNumber, totalDays = 30, title, isCompleted, onComplete }: Props) {
  const progress = dayNumber / totalDays;

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dayLabel}>Día {dayNumber}</Text>
        {isCompleted && <Ionicons name="checkmark-circle" size={24} color={colors.gold} />}
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} label={`Día ${dayNumber} / ${totalDays}`} />
      </View>

      {!isCompleted ? (
        <GoldButton title="Completar" onPress={onComplete} style={styles.button} />
      ) : (
        <View style={styles.completedBanner}>
          <Text style={styles.completedText}>¡Completado por hoy!</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dayLabel: {
    fontFamily: typography.caption.fontFamily,
    color: colors.textMuted,
    fontSize: 14,
  },
  title: {
    fontFamily: typography.subtitle.fontFamily,
    fontSize: typography.subtitle.fontSize,
    color: colors.text,
    marginBottom: spacing.md,
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  button: {
    width: '100%',
  },
  completedBanner: {
    backgroundColor: colors.vellum,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedText: {
    color: colors.purple,
    fontFamily: typography.sansBold,
  },
});
