import { useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { ScreenShell } from '../templates/ScreenShell';
import { LogoMark } from '../molecules/LogoMark';
import { AppText } from '../atoms/AppText';
import { Chip } from '../atoms/Chip';
import { Spacer } from '../atoms/Spacer';
import { MOOD_OPTIONS, type MoodType } from '../../domain/entities/MoodLog';
import { container } from '../../composition/container';
import { ensureDailyNotification } from '../../infrastructure/adapters/inspiration/DailyNotification';
import { refreshHomeWidgets } from '../widgets/refreshHomeWidgets';
import { colors, fonts, spacing } from '../theme';

type Props = { onDone: () => void };

/** Pantalla obligatoria una vez al día */
export function DailyMoodScreen({ onDone }: Props) {
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<MoodType | null>(null);
  const pulse = useRef(new Animated.Value(1)).current;

  const confirm = async (mood: MoodType) => {
    if (busy) return;
    setSelected(mood);
    Animated.sequence([
      Animated.timing(pulse, { toValue: 0.97, duration: 90, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 140, useNativeDriver: true }),
    ]).start();
    setBusy(true);
    try {
      const inspiration = await container.saveMoodAndInspire.execute(mood);
      const profile = await container.getProfile.execute();
      await ensureDailyNotification(inspiration, profile);
      await refreshHomeWidgets(inspiration);
      onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.brand}>
          <LogoMark size={76} />
          <Spacer size="md" />
          <AppText variant="hero" style={styles.title}>
            ¿Cómo te sientes?
          </AppText>
          <AppText style={styles.sub}>
            Una vez al día. Así te damos la palabra que necesitas.
          </AppText>
        </View>

        <Animated.View style={[styles.grid, { transform: [{ scale: pulse }] }]}>
          {MOOD_OPTIONS.map((mood) => (
            <Chip
              key={mood}
              label={mood}
              selected={selected === mood}
              onPress={() => confirm(mood)}
              tone={
                mood === 'Alegría' || mood === 'Fuerza'
                  ? 'pink'
                  : mood === 'Paz' || mood === 'Gratitud'
                    ? 'mint'
                    : 'sky'
              }
            />
          ))}
        </Animated.View>

        {busy ? (
          <AppText muted style={styles.wait}>
            Preparando tu palabra…
          </AppText>
        ) : null}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
    flexGrow: 1,
    justifyContent: 'center',
  },
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  title: {
    textAlign: 'center',
    fontSize: 34,
    color: colors.accent,
  },
  sub: {
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  wait: {
    textAlign: 'center',
    marginTop: spacing.lg,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
