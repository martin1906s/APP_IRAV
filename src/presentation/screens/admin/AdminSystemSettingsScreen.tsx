import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScreenShell } from '../../templates/ScreenShell';
import { AppHeader } from '../../organisms/AppHeader';
import { AppText } from '../../atoms/AppText';
import { AppButton } from '../../atoms/AppButton';
import { Chip } from '../../atoms/Chip';
import { FormField } from '../../molecules/FormField';
import { Spacer } from '../../atoms/Spacer';
import { BIBLE_VERSIONS } from '../../../shared/constants/bibleVersions';
import { container } from '../../../composition/container';
import { refreshAuth } from '../../../infrastructure/api/authRefresh';
import type {
  SystemSettings,
  UpdateSystemSettingsPayload,
} from '../../../infrastructure/adapters/admin/ApiAdminAdapter';
import { colors, fonts, radius, spacing } from '../../theme';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

/** Parámetros globales del sistema (solo admin) */
export function AdminSystemSettingsScreen() {
  const nav = useNavigation();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [chatRetentionDays, setChatRetentionDays] = useState('30');
  const [pastoralSummaryMaxWords, setPastoralSummaryMaxWords] = useState('100');
  const [defaultBibleVersion, setDefaultBibleVersion] = useState('NVI');
  const [defaultReminderHour, setDefaultReminderHour] = useState(8);
  const [defaultReminderMinute, setDefaultReminderMinute] = useState(0);
  const [dailyMoodRequired, setDailyMoodRequired] = useState(true);
  const [notificationsEnabledByDefault, setNotificationsEnabledByDefault] = useState(true);
  const [geminiModelOverride, setGeminiModelOverride] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const data = await container.admin.getSettings();
    setSettings(data);
    setChatRetentionDays(String(data.chatRetentionDays));
    setPastoralSummaryMaxWords(String(data.pastoralSummaryMaxWords));
    setDefaultBibleVersion(data.defaultBibleVersion);
    setDefaultReminderHour(data.defaultReminderHour);
    setDefaultReminderMinute(data.defaultReminderMinute);
    setDailyMoodRequired(data.dailyMoodRequired);
    setNotificationsEnabledByDefault(data.notificationsEnabledByDefault);
    setGeminiModelOverride(data.geminiModelOverride ?? '');
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const save = async () => {
    const retention = Number(chatRetentionDays);
    const maxWords = Number(pastoralSummaryMaxWords);

    if (!Number.isFinite(retention) || retention < 7 || retention > 365) {
      Alert.alert('Valor inválido', 'La retención de chat debe estar entre 7 y 365 días.');
      return;
    }
    if (!Number.isFinite(maxWords) || maxWords < 40 || maxWords > 300) {
      Alert.alert('Valor inválido', 'El resumen pastoral debe estar entre 40 y 300 palabras.');
      return;
    }

    const payload: UpdateSystemSettingsPayload = {
      chatRetentionDays: retention,
      pastoralSummaryMaxWords: maxWords,
      defaultBibleVersion,
      defaultReminderHour,
      defaultReminderMinute,
      dailyMoodRequired,
      notificationsEnabledByDefault,
      geminiModelOverride: geminiModelOverride.trim() || '',
    };

    setBusy(true);
    try {
      const updated = await container.admin.updateSettings(payload);
      setSettings(updated);
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <AppHeader
          title="Sistema"
          subtitle="Parámetros globales de IRAV"
          onBack={nav.canGoBack() ? () => nav.goBack() : undefined}
        />

        <View style={styles.section}>
          <AppText variant="caption" style={styles.sectionTitle}>
            Chat y datos
          </AppText>
          <FormField
            label="Retención de mensajes (días)"
            kind="documentNumeric"
            value={chatRetentionDays}
            onChangeText={setChatRetentionDays}
          />
          <AppText muted style={styles.fieldHint}>
            Los mensajes más antiguos se borran automáticamente cada noche.
          </AppText>
        </View>

        <Spacer size="md" />

        <View style={styles.section}>
          <AppText variant="caption" style={styles.sectionTitle}>
            Resumen pastoral IA
          </AppText>
          <FormField
            label="Máximo de palabras"
            kind="documentNumeric"
            value={pastoralSummaryMaxWords}
            onChangeText={setPastoralSummaryMaxWords}
          />
          <AppText muted style={styles.fieldHint}>
            Resúmenes cortos y precisos. Recomendado: 80–120 palabras.
          </AppText>
          <Spacer size="sm" />
          <FormField
            label="Modelo Gemini (opcional)"
            kind="text"
            value={geminiModelOverride}
            onChangeText={setGeminiModelOverride}
            placeholder="gemini-2.0-flash"
          />
          <AppText muted style={styles.fieldHint}>
            Deja vacío para usar el modelo por defecto del servidor.
          </AppText>
        </View>

        <Spacer size="md" />

        <View style={styles.section}>
          <AppText variant="caption" style={styles.sectionTitle}>
            Nuevos usuarios
          </AppText>
          <AppText variant="caption">Versión de Biblia por defecto</AppText>
          <View style={styles.wrap}>
            {BIBLE_VERSIONS.filter((v) => v.language === 'Español').map((v) => (
              <Chip
                key={v.id}
                label={v.shortName}
                selected={defaultBibleVersion === v.id}
                onPress={() => setDefaultBibleVersion(v.id)}
              />
            ))}
          </View>
          <Spacer size="sm" />
          <AppText variant="caption">Hora de recordatorio por defecto</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourScroll}>
            {HOURS.map((h) => (
              <Chip
                key={h}
                label={`${String(h).padStart(2, '0')}:00`}
                selected={defaultReminderHour === h && defaultReminderMinute === 0}
                onPress={() => {
                  setDefaultReminderHour(h);
                  setDefaultReminderMinute(0);
                }}
                tone="mint"
              />
            ))}
          </ScrollView>
          <Spacer size="xs" />
          <View style={styles.wrap}>
            {MINUTES.filter((m) => m > 0).map((m) => (
              <Chip
                key={m}
                label={`:${String(m).padStart(2, '0')}`}
                selected={defaultReminderMinute === m}
                onPress={() => setDefaultReminderMinute(m)}
              />
            ))}
          </View>
          <Spacer size="sm" />
          <View style={styles.switchRow}>
            <View style={styles.switchBody}>
              <AppText style={styles.switchLabel}>Notificaciones activas por defecto</AppText>
              <AppText muted style={styles.switchHint}>
                Al crear un joven desde el panel
              </AppText>
            </View>
            <Switch
              value={notificationsEnabledByDefault}
              onValueChange={setNotificationsEnabledByDefault}
              trackColor={{ false: colors.border, true: colors.accentSoft }}
              thumbColor={notificationsEnabledByDefault ? colors.accent : colors.textMuted}
            />
          </View>
        </View>

        <Spacer size="md" />

        <View style={styles.section}>
          <AppText variant="caption" style={styles.sectionTitle}>
            Experiencia del joven
          </AppText>
          <View style={styles.switchRow}>
            <View style={styles.switchBody}>
              <AppText style={styles.switchLabel}>Ánimo diario obligatorio</AppText>
              <AppText muted style={styles.switchHint}>
                El joven debe registrar su ánimo antes de usar la app
              </AppText>
            </View>
            <Switch
              value={dailyMoodRequired}
              onValueChange={setDailyMoodRequired}
              trackColor={{ false: colors.border, true: colors.accentSoft }}
              thumbColor={dailyMoodRequired ? colors.accent : colors.textMuted}
            />
          </View>
        </View>

        {settings?.updatedAt ? (
          <>
            <Spacer size="sm" />
            <AppText muted style={styles.updated}>
              Última actualización: {new Date(settings.updatedAt).toLocaleString('es-EC')}
            </AppText>
          </>
        ) : null}

        <Spacer size="lg" />
        <AppButton
          label={saved ? 'Guardado ✓' : busy ? 'Guardando…' : 'Guardar cambios'}
          onPress={save}
          disabled={busy}
        />
        <Spacer size="md" />
        <AppButton label="Cerrar sesión" onPress={logout} variant="ghost" />
        <Spacer size="xxl" />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl },
  section: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.accentWarm,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  switchBody: { flex: 1 },
  switchLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 15,
    color: colors.text,
    textTransform: 'none',
    letterSpacing: 0,
  },
  switchHint: {
    fontSize: 12,
    marginTop: 2,
    textTransform: 'none',
    letterSpacing: 0,
  },
  updated: {
    fontSize: 12,
    textAlign: 'center',
    textTransform: 'none',
    letterSpacing: 0,
  },
  fieldHint: {
    fontSize: 12,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    textTransform: 'none',
    letterSpacing: 0,
  },
  hourScroll: { marginTop: spacing.xs, marginBottom: spacing.xs },
});
