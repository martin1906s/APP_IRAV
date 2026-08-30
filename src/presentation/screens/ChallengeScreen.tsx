import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenShell } from '../templates/ScreenShell';
import { AppHeader } from '../organisms/AppHeader';
import { AppText } from '../atoms/AppText';
import { AppButton } from '../atoms/AppButton';
import { Spacer } from '../atoms/Spacer';
import { container } from '../../composition/container';
import type {
  ChallengeCategory,
  ChallengeDayState,
  ChallengeStatus,
} from '../../domain/entities/Challenge';
import { syncChallengeReminders } from '../../infrastructure/adapters/challenges/ChallengeNotifications';
import { getStoredUser } from '../../infrastructure/api/authStore';
import { colors, fonts, radius, spacing } from '../theme';

const CATEGORY_META: Record<ChallengeCategory, { emoji: string; color: string }> = {
  oración: { emoji: '🙏', color: colors.accent },
  alabanza: { emoji: '🎵', color: '#7C9EFF' },
  lectura: { emoji: '📖', color: '#6BCB9A' },
  servicio: { emoji: '🤝', color: '#E8A87C' },
  gratitud: { emoji: '💛', color: '#F2C94C' },
  silencio: { emoji: '🤫', color: '#B8A9C9' },
};

async function syncRemindersFromStatus(status: ChallengeStatus) {
  const profile = await getStoredUser();
  await syncChallengeReminders({
    enrolled: status.enrolled,
    hasChallengeToday: status.hasChallengeToday,
    todayCompleted: status.todayCompleted,
    notificationsEnabled: profile?.notificationsEnabled ?? true,
  });
}

function dayStateStyle(state: ChallengeDayState) {
  switch (state) {
    case 'completed':
      return styles.dayDone;
    case 'missed':
      return styles.dayMissed;
    case 'today':
      return styles.dayToday;
    case 'locked':
      return styles.dayLocked;
    default:
      return styles.dayUnavailable;
  }
}

function DayIcon({ state }: { state: ChallengeDayState }) {
  if (state === 'completed') {
    return <Ionicons name="checkmark" size={14} color={colors.accent} />;
  }
  if (state === 'missed') {
    return <Ionicons name="close" size={12} color={colors.textMuted} />;
  }
  if (state === 'locked') {
    return <Ionicons name="lock-closed" size={11} color={colors.textMuted} />;
  }
  return null;
}

/** Reto espiritual mensual (días 1–30 del calendario) */
export function ChallengeScreen() {
  const [status, setStatus] = useState<ChallengeStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await container.challenges.getStatus();
      setStatus(data);
      setError('');
      await syncRemindersFromStatus(data);
    } catch {
      setError('No pudimos cargar el reto. Intenta de nuevo.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const complete = async () => {
    setBusy(true);
    try {
      const data = await container.challenges.completeToday();
      setStatus(data);
      await syncRemindersFromStatus(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo marcar como completado.';
      Alert.alert('Error', msg);
    } finally {
      setBusy(false);
    }
  };

  const progress = status
    ? Math.round((status.completedDays.length / status.totalDays) * 100)
    : 0;

  const meta = status
    ? CATEGORY_META[status.todayChallenge.category]
    : CATEGORY_META.oración;

  return (
    <ScreenShell>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Reto mensual"
          subtitle={status ? `${status.monthLabel} · se reinicia cada mes` : 'Crece cada día del mes'}
        />

        {error ? (
          <>
            <AppText muted>{error}</AppText>
            <Spacer />
            <AppButton label="Reintentar" onPress={() => void load()} />
          </>
        ) : !status ? (
          <AppText muted>Cargando reto…</AppText>
        ) : (
          <>
            <View style={styles.infoCard}>
              <AppText muted style={styles.body}>
                Cada día del mes (1 al 30) tiene un reto. Si entras a mitad de mes, los días
                anteriores aparecen como no disponibles. Al iniciar un mes nuevo, todo se habilita
                de nuevo.
              </AppText>
            </View>

            <Spacer />

            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <AppText variant="subtitle">
                  Día {status.calendarDay <= 30 ? status.calendarDay : 30} de {status.totalDays}
                </AppText>
                <AppText muted>{progress}%</AppText>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <AppText muted style={styles.progressHint}>
                {status.completedDays.length} completados · {status.missedDays.length} no
                disponibles
              </AppText>
            </View>

            <Spacer />

            {!status.hasChallengeToday ? (
              <View style={styles.todayCard}>
                <AppText variant="subtitle">Sin reto hoy</AppText>
                <Spacer size="sm" />
                <AppText muted style={styles.body}>
                  El reto mensual usa los días 1 al 30. Mañana comienza un nuevo mes con retos
                  frescos.
                </AppText>
              </View>
            ) : (
              <View style={[styles.todayCard, { borderColor: meta.color }]}>
                <View style={styles.todayBadge}>
                  <AppText style={styles.emoji}>{meta.emoji}</AppText>
                  <AppText variant="caption" style={{ color: meta.color }}>
                    {status.todayChallenge.category}
                  </AppText>
                </View>
                <AppText variant="title" style={styles.todayTitle}>
                  {status.todayChallenge.title}
                </AppText>
                <AppText muted style={styles.body}>
                  {status.todayChallenge.description}
                </AppText>

                {status.finished ? (
                  <>
                    <Spacer />
                    <View style={styles.doneRow}>
                      <Ionicons name="trophy" size={22} color={colors.accent} />
                      <AppText variant="subtitle" style={styles.doneText}>
                        ¡Completaste el reto del mes! Gloria a Dios.
                      </AppText>
                    </View>
                  </>
                ) : status.todayCompleted ? (
                  <>
                    <Spacer />
                    <View style={styles.doneRow}>
                      <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                      <AppText variant="subtitle" style={styles.doneText}>
                        Completaste el reto de hoy
                      </AppText>
                    </View>
                  </>
                ) : (
                  <>
                    <Spacer size="lg" />
                    <AppButton
                      label={busy ? 'Guardando…' : 'Marcar como completado'}
                      onPress={() => void complete()}
                      disabled={busy}
                    />
                  </>
                )}
              </View>
            )}

            <Spacer size="lg" />
            <AppText variant="caption">Calendario del mes</AppText>
            <Spacer size="xs" />
            <View style={styles.legend}>
              <LegendDot color={colors.accent} label="Hecho" />
              <LegendDot color={colors.textMuted} label="No disp." />
              <LegendDot color={colors.border} label="Próximo" />
            </View>
            <Spacer size="sm" />
            <View style={styles.grid}>
              {status.catalog.map((item) => {
                const state = status.dayStates[item.day] ?? 'locked';
                return (
                  <View key={item.day} style={[styles.dayCell, dayStateStyle(state)]}>
                    <AppText
                      variant="caption"
                      style={[styles.dayNum, state === 'today' && styles.dayNumToday]}
                    >
                      {item.day}
                    </AppText>
                    <DayIcon state={state} />
                  </View>
                );
              })}
            </View>
          </>
        )}

        <Spacer size="xxl" />
      </ScrollView>
    </ScreenShell>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <AppText muted style={styles.legendLabel}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    textTransform: 'none',
    letterSpacing: 0,
  },
  progressCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
  },
  progressHint: {
    fontSize: 13,
    textTransform: 'none',
    letterSpacing: 0,
  },
  todayCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  emoji: { fontSize: 20 },
  todayTitle: { marginBottom: spacing.sm },
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  doneText: { flex: 1, textTransform: 'none', letterSpacing: 0 },
  legend: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    textTransform: 'none',
    letterSpacing: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  dayCell: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  dayDone: {
    borderColor: colors.accentGlow,
    backgroundColor: colors.bgElevated,
  },
  dayMissed: {
    opacity: 0.55,
    backgroundColor: colors.bg,
  },
  dayToday: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  dayLocked: {
    opacity: 0.7,
  },
  dayUnavailable: {
    opacity: 0.35,
  },
  dayNum: {
    fontSize: 12,
    textTransform: 'none',
    letterSpacing: 0,
  },
  dayNumToday: {
    color: colors.accent,
    fontFamily: fonts.sansSemi,
  },
});
