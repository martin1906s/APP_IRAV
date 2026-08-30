import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { ScreenShell } from '../templates/ScreenShell';
import { AppHeader } from '../organisms/AppHeader';
import { CountrySelect } from '../molecules/CountrySelect';
import { DatePickerField } from '../molecules/DatePickerField';
import { FormField } from '../molecules/FormField';
import { AppText } from '../atoms/AppText';
import { AppButton } from '../atoms/AppButton';
import { Chip } from '../atoms/Chip';
import { Spacer } from '../atoms/Spacer';
import { COUNTRIES } from '../../shared/constants/countries';
import { BIBLE_VERSIONS } from '../../shared/constants/bibleVersions';
import { container } from '../../composition/container';
import type { UserProfile } from '../../domain/entities/UserProfile';
import { DEFAULT_PROFILE } from '../../domain/entities/UserProfile';
import { syncReminderFromSettings } from '../../infrastructure/adapters/inspiration/DailyNotification';
import { syncChallengeReminders } from '../../infrastructure/adapters/challenges/ChallengeNotifications';
import { registerPushToken } from '../../infrastructure/adapters/push/registerPushToken';
import { isValidBirthDate } from '../../shared/utils/dateFormat';
import { refreshAuth } from '../../infrastructure/api/authRefresh';
import { colors, fonts, spacing } from '../theme';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

/** Ajustes del usuario */
export function SettingsScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Ecuador');
  const [versionId, setVersionId] = useState(DEFAULT_PROFILE.preferredVersionId);
  const [notifications, setNotifications] = useState(true);
  const [voice, setVoice] = useState(true);
  const [hour, setHour] = useState(8);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void container.getProfile.execute().then((p) => {
      if (!p) return;
      setProfile(p);
      setName(p.name);
      setBirthDate(p.birthDate);
      setPhone(p.phone);
      setCountry(p.country);
      setVersionId(p.preferredVersionId);
      setNotifications(p.notificationsEnabled);
      setVoice(p.voiceEnabled);
      setHour(p.reminderHour);
    }).catch(() => undefined);
  }, []);

  const valid = useMemo(
    () => name.trim().length >= 2 && isValidBirthDate(birthDate) && phone.trim().length >= 8,
    [name, birthDate, phone],
  );

  const save = async () => {
    if (!valid || busy || !profile) return;
    setBusy(true);
    const next: UserProfile = {
      ...profile,
      name: name.trim(),
      birthDate,
      phone: phone.trim(),
      country,
      preferredVersionId: versionId,
      notificationsEnabled: notifications,
      voiceEnabled: voice,
      reminderHour: hour,
      reminderMinute: profile.reminderMinute ?? 0,
    };
    try {
      await container.saveProfile.execute(next);
      container.ai.setProfile(next);
      if (next.notificationsEnabled) {
        void registerPushToken();
      }
      await syncReminderFromSettings(next);
      try {
        const challenge = await container.challenges.getStatus();
        await syncChallengeReminders({
          enrolled: challenge.enrolled,
          hasChallengeToday: challenge.hasChallengeToday,
          todayCompleted: challenge.todayCompleted,
          notificationsEnabled: next.notificationsEnabled,
        });
      } catch {
        /* reto opcional */
      }
      setProfile(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch {
      Alert.alert('Error', 'No se pudieron guardar los ajustes. Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await container.auth.logout();
          refreshAuth();
        },
      },
    ]);
  };

  return (
    <ScreenShell>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader title="Ajustes" subtitle="Tu perfil y preferencias" />

        <FormField label="Nombre" kind="name" value={name} onChangeText={setName} />
        <Spacer size="sm" />

        <DatePickerField label="Fecha de nacimiento" value={birthDate} onChange={setBirthDate} />
        <Spacer size="sm" />

        <FormField label="Teléfono" kind="phone" value={phone} onChangeText={setPhone} />
        <Spacer size="sm" />

        <AppText variant="caption">País</AppText>
        <CountrySelect value={country} options={COUNTRIES} onChange={setCountry} />
        <Spacer size="md" />

        <AppText variant="caption">Versión de Biblia</AppText>
        <View style={styles.wrap}>
          {BIBLE_VERSIONS.filter((v) => v.language === 'Español').map((v) => (
            <Chip
              key={v.id}
              label={v.shortName}
              selected={versionId === v.id}
              onPress={() => setVersionId(v.id)}
              tone="sky"
            />
          ))}
        </View>
        <Spacer size="md" />

        <View style={styles.row}>
          <View style={styles.rowText}>
            <AppText variant="subtitle">Notificaciones</AppText>
            <AppText muted style={styles.hint}>
              Un recordatorio al día
            </AppText>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ true: colors.accentGlow, false: colors.border }}
            thumbColor={notifications ? colors.accent : colors.textMuted}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <AppText variant="subtitle">Voz de Jesús</AppText>
            <AppText muted style={styles.hint}>
              Leer respuestas en voz alta
            </AppText>
          </View>
          <Switch
            value={voice}
            onValueChange={setVoice}
            trackColor={{ true: colors.accentGlow, false: colors.border }}
            thumbColor={voice ? colors.accent : colors.textMuted}
          />
        </View>

        {notifications ? (
          <>
            <AppText variant="caption">Hora del recordatorio</AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {HOURS.map((h) => (
                <Chip
                  key={h}
                  label={`${String(h).padStart(2, '0')}:00`}
                  selected={hour === h}
                  onPress={() => setHour(h)}
                  tone="mint"
                />
              ))}
            </ScrollView>
          </>
        ) : null}

        <Spacer size="lg" />
        <AppButton label={saved ? 'Guardado' : 'Guardar'} onPress={save} disabled={!valid || busy} />
        <Spacer size="md" />
        <AppButton label="Cerrar sesión" onPress={logout} variant="ghost" />
        <Spacer size="xxl" />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  rowText: { flex: 1, gap: 2 },
  hint: {
    fontFamily: fonts.sans,
    fontSize: 14,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
