import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import { colors, fonts, radius, spacing, shadows } from '../../theme';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

/** Parámetros globales del sistema con estética litúrgica */
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
    try {
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
    } catch {
      /* conservar ajustes ya mostrados */
    }
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
      setTimeout(() => setSaved(false), 2000);
    } catch {
      Alert.alert('Error', 'No se pudieron guardar los ajustes. Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    Alert.alert('Cerrar sesión', '¿Deseas salir del panel de administración?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
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
          subtitle="Parámetros Globales e Infraestructura"
          onBack={nav.canGoBack() ? () => nav.goBack() : undefined}
        />

        {/* SECCIÓN: RETENCIÓN DE CHAT */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: colors.purpleSoft }]}>
              <Ionicons name="chatbubbles" size={18} color={colors.purple} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="subtitle" style={styles.cardTitle}>Chat y Depuración</AppText>
              <AppText muted style={styles.cardSub}>Políticas de almacenamiento</AppText>
            </View>
          </View>

          <Spacer size="xs" />
          <FormField
            label="Retención de mensajes de chat (días)"
            kind="documentNumeric"
            value={chatRetentionDays}
            onChangeText={setChatRetentionDays}
          />
          <AppText muted style={styles.fieldHint}>
            Los mensajes más antiguos se depuran automáticamente para optimizar la base de datos.
          </AppText>
        </View>

        <Spacer size="md" />

        {/* SECCIÓN: INTELIGENCIA ARTIFICIAL */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: '#FFF9E6' }]}>
              <Ionicons name="sparkles" size={18} color={colors.goldDark} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="subtitle" style={styles.cardTitle}>Inteligencia Artificial Gemini</AppText>
              <AppText muted style={styles.cardSub}>Resumen pastoral y acompañamiento</AppText>
            </View>
          </View>

          <Spacer size="xs" />
          <FormField
            label="Límite máximo de palabras (Resumen pastoral)"
            kind="documentNumeric"
            value={pastoralSummaryMaxWords}
            onChangeText={setPastoralSummaryMaxWords}
          />
          <AppText muted style={styles.fieldHint}>
            Longitud óptima para lectura rápida: entre 80 y 120 palabras.
          </AppText>
          <Spacer size="xs" />
          <FormField
            label="Modelo Gemini (Opcional)"
            kind="text"
            value={geminiModelOverride}
            onChangeText={setGeminiModelOverride}
            placeholder="gemini-2.5-flash"
          />
          <AppText muted style={styles.fieldHint}>
            Por defecto: gemini-2.5-flash. Modifícalo solo si utilizas otra variante.
          </AppText>
        </View>

        <Spacer size="md" />

        {/* SECCIÓN: PREFERENCIAS PREDETERMINADAS */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: '#EBF3FB' }]}>
              <Ionicons name="book" size={18} color={colors.info} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="subtitle" style={styles.cardTitle}>Preferencias de Nuevos Miembros</AppText>
              <AppText muted style={styles.cardSub}>Configuración inicial automática</AppText>
            </View>
          </View>

          <Spacer size="xs" />
          <AppText variant="caption" style={styles.fieldLabel}>Versión Bíblica Predeterminada</AppText>
          <View style={styles.chipGrid}>
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
          <AppText variant="caption" style={styles.fieldLabel}>Hora de Recordatorio Matutino</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
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
          <View style={styles.switchRow}>
            <View style={styles.switchBody}>
              <AppText style={styles.switchLabel}>Notificaciones activas por defecto</AppText>
              <AppText muted style={styles.switchHint}>
                Habilitar recordatorios diarios al registrar un nuevo miembro
              </AppText>
            </View>
            <Switch
              value={notificationsEnabledByDefault}
              onValueChange={setNotificationsEnabledByDefault}
              trackColor={{ false: colors.border, true: colors.purpleSoft }}
              thumbColor={notificationsEnabledByDefault ? colors.purple : colors.textMuted}
            />
          </View>

          <View style={[styles.switchRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, marginTop: spacing.xs, paddingTop: spacing.sm }]}>
            <View style={styles.switchBody}>
              <AppText style={styles.switchLabel}>Registro de ánimo obligatorio</AppText>
              <AppText muted style={styles.switchHint}>
                Solicitar el estado de ánimo antes de acceder a la lectura bíblica
              </AppText>
            </View>
            <Switch
              value={dailyMoodRequired}
              onValueChange={setDailyMoodRequired}
              trackColor={{ false: colors.border, true: colors.purpleSoft }}
              thumbColor={dailyMoodRequired ? colors.purple : colors.textMuted}
            />
          </View>
        </View>

        {settings?.updatedAt ? (
          <>
            <Spacer size="sm" />
            <AppText muted style={styles.updatedText}>
              Última actualización sincronizada: {new Date(settings.updatedAt).toLocaleString('es-EC')}
            </AppText>
          </>
        ) : null}

        <Spacer size="lg" />
        <AppButton
          label={saved ? '¡Ajustes guardados! ✓' : busy ? 'Guardando…' : 'Guardar configuración'}
          onPress={save}
          disabled={busy}
        />
        <Spacer size="sm" />
        <Pressable style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <AppText style={styles.logoutText}>Cerrar sesión de administrador</AppText>
        </Pressable>
        <Spacer size="xxl" />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#EFEAE2',
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: fonts.serifSemi,
    fontSize: 15,
    color: colors.text,
  },
  cardSub: {
    fontSize: 12,
  },
  fieldLabel: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  fieldHint: {
    fontSize: 12,
    marginTop: 4,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  chipScroll: {
    marginTop: 2,
    marginBottom: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  switchBody: { flex: 1 },
  switchLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.text,
  },
  switchHint: {
    fontSize: 12,
    marginTop: 2,
  },
  updatedText: {
    fontSize: 12,
    textAlign: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: 'rgba(220, 76, 94, 0.08)',
  },
  logoutText: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: colors.danger,
  },
});
