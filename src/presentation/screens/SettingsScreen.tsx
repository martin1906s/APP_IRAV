import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { ScreenShell } from '../templates/ScreenShell';
import { AppHeader } from '../organisms/AppHeader';
import { CountrySelect } from '../molecules/CountrySelect';
import { AppText } from '../atoms/AppText';
import { AppInput } from '../atoms/AppInput';
import { AppButton } from '../atoms/AppButton';
import { Chip } from '../atoms/Chip';
import { Spacer } from '../atoms/Spacer';
import { COUNTRIES } from '../../shared/constants/countries';
import { BIBLE_VERSIONS } from '../../shared/constants/bibleVersions';
import { container } from '../../composition/container';
import type { UserProfile } from '../../domain/entities/UserProfile';
import { DEFAULT_PROFILE } from '../../domain/entities/UserProfile';
import { syncReminderFromSettings } from '../../infrastructure/adapters/inspiration/DailyNotification';
import { colors, fonts, spacing } from '../theme';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

/** Ajustes del usuario */
export function SettingsScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('Ecuador');
  const [versionId, setVersionId] = useState(DEFAULT_PROFILE.preferredVersionId);
  const [notifications, setNotifications] = useState(true);
  const [voice, setVoice] = useState(true);
  const [hour, setHour] = useState(8);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    container.getProfile.execute().then((p) => {
      if (!p) return;
      setProfile(p);
      setName(p.name);
      setAge(String(p.age));
      setCountry(p.country);
      setVersionId(p.preferredVersionId);
      setNotifications(p.notificationsEnabled);
      setVoice(p.voiceEnabled);
      setHour(p.reminderHour);
    });
  }, []);

  const ageNum = useMemo(() => Number(age), [age]);
  const valid = name.trim().length >= 2 && ageNum >= 10 && ageNum <= 99;

  const save = async () => {
    if (!valid || busy) return;
    setBusy(true);
    const next: UserProfile = {
      name: name.trim(),
      age: ageNum,
      country,
      preferredVersionId: versionId,
      notificationsEnabled: notifications,
      voiceEnabled: voice,
      reminderHour: hour,
      reminderMinute: profile?.reminderMinute ?? 0,
    };
    await container.saveProfile.execute(next);
    container.ai.setProfile(next);
    await syncReminderFromSettings(next);
    setProfile(next);
    setSaved(true);
    setBusy(false);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <ScreenShell>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader title="Ajustes" subtitle="Tu perfil y preferencias" />

        <AppText variant="caption">Nombre</AppText>
        <AppInput value={name} onChangeText={setName} autoCapitalize="words" />
        <Spacer size="sm" />

        <AppText variant="caption">Edad</AppText>
        <AppInput value={age} onChangeText={setAge} keyboardType="number-pad" maxLength={2} />
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
            trackColor={{ true: colors.accent, false: colors.border }}
            thumbColor={notifications ? colors.onAccent : colors.accent}
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
            trackColor={{ true: colors.accent, false: colors.border }}
            thumbColor={voice ? colors.onAccent : colors.accent}
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
