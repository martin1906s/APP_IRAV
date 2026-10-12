import { useRef, useState } from 'react';

import { ScrollView, StyleSheet, View } from 'react-native';

import { ScreenShell } from '../templates/ScreenShell';

import { AppText } from '../atoms/AppText';

import { Chip } from '../atoms/Chip';

import { MOOD_OPTIONS, type MoodType } from '../../domain/entities/MoodLog';

import { container } from '../../composition/container';
import { ensureDailyNotification } from '../../infrastructure/adapters/inspiration/DailyNotification';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { colors, spacing } from '../theme';



type Props = { onDone: () => void };



/** Registro diario de ánimo */

export function DailyMoodScreen({ onDone }: Props) {

  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<MoodType | null>(null);
  const handleError = useErrorHandler();
  const lock = useRef(false);



  const confirm = async (mood: MoodType) => {

    if (busy || lock.current) return;
    setSelected(mood);
    lock.current = true;
    setBusy(true);

    try {

      const inspiration = await container.saveMoodAndInspire.execute(mood);

      const profile = await container.getProfile.execute();

      try {

        await ensureDailyNotification(inspiration, profile);

        

      } catch {

        /* notificaciones/widgets no deben bloquear el flujo */

      }

      onDone();

    } catch (e: unknown) {
      handleError(e instanceof Error ? e : new Error('No pudimos guardar tu ánimo. Revisa tu conexión.'));
    } finally {

      setBusy(false);

      lock.current = false;

    }

  };



  return (

    <ScreenShell>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>

          <AppText variant="hero">¿Cómo te sientes hoy?</AppText>

          <AppText muted style={styles.sub}>

            Elige una opción para recibir tu palabra del día.

          </AppText>

        </View>



        <View style={styles.grid}>

          {MOOD_OPTIONS.map((mood) => (

            <Chip

              key={mood}

              label={mood}

              selected={selected === mood}

              onPress={() => confirm(mood)}

              disabled={busy}

              tone={

                mood === 'Alegría' || mood === 'Fuerza'

                  ? 'gold'

                  : mood === 'Paz' || mood === 'Gratitud'

                    ? 'mint'

                    : 'sky'

              }

            />

          ))}

        </View>



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

  header: {

    marginBottom: spacing.xl,

    paddingBottom: spacing.lg,

    borderBottomWidth: StyleSheet.hairlineWidth,

    borderBottomColor: colors.border,

  },

  sub: {

    marginTop: spacing.sm,

    fontSize: 15,

    lineHeight: 22,

    textTransform: 'none',

    letterSpacing: 0,

  },

  grid: {

    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: spacing.sm,

  },

  wait: {
    marginTop: spacing.lg,
    textTransform: 'none',
    letterSpacing: 0,
  },
});

