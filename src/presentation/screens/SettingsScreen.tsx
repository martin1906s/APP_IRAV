import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, View, TouchableOpacity } from 'react-native';
import { ScreenShell } from '../templates/ScreenShell';
import { AppHeader } from '../components/AppHeader';
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
import { getStoredUser, updateStoredUser } from '../../infrastructure/api/authStore';
import { colors, fonts, spacing, radius, shadows, typography } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Ecuador');
  const [versionId, setVersionId] = useState(DEFAULT_PROFILE.preferredVersionId);
  const [notifications, setNotifications] = useState(true);
  const [voice, setVoice] = useState(true);
  const [hour, setHour] = useState(8);
  const [highlightColor, setHighlightColor] = useState('#FFD700');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void getStoredUser().then((p) => {
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
      if (p.highlightColor) setHighlightColor(p.highlightColor);
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
      highlightColor,
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
      } catch {}
      
      await updateStoredUser(next);
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

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Mi Perfil" showLogo={false} transparent />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* Header Visual */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <AppText style={styles.avatarText}>{initial}</AppText>
          </View>
          <AppText style={styles.profileName}>{name || 'Cargando...'}</AppText>
          <AppText style={styles.profileRole}>Miembro de la Comunidad</AppText>
        </View>

        {/* Sección Personal */}
        <View style={styles.section}>
          <AppText variant="subtitle" style={styles.sectionTitle}>Información Personal</AppText>
          <View style={styles.cardGroup}>
            <View style={styles.fieldRow}>
              <Ionicons name="person" size={20} color={colors.purple} style={styles.fieldIcon} />
              <View style={styles.fieldInputWrapper}>
                <FormField label="Nombre Completo" kind="name" value={name} onChangeText={setName} />
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.fieldRow}>
              <Ionicons name="calendar" size={20} color={colors.purple} style={styles.fieldIcon} />
              <View style={styles.fieldInputWrapper}>
                <DatePickerField label="Fecha de nacimiento" value={birthDate} onChange={setBirthDate} />
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.fieldRow}>
              <Ionicons name="call" size={20} color={colors.purple} style={styles.fieldIcon} />
              <View style={styles.fieldInputWrapper}>
                <FormField label="Teléfono" kind="phone" value={phone} onChangeText={setPhone} />
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.fieldRow}>
              <Ionicons name="earth" size={20} color={colors.purple} style={styles.fieldIcon} />
              <View style={styles.fieldInputWrapper}>
                <AppText variant="caption" style={styles.label}>País</AppText>
                <CountrySelect value={country} options={COUNTRIES} onChange={setCountry} />
              </View>
            </View>
          </View>
        </View>

        {/* Sección Preferencias */}
        <View style={styles.section}>
          <AppText variant="subtitle" style={styles.sectionTitle}>Preferencias de la App</AppText>
          <View style={styles.cardGroup}>
            
            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <AppText style={styles.settingTitle}>Versión de la Biblia</AppText>
                <AppText style={styles.settingSubtitle}>Selecciona tu versión favorita</AppText>
              </View>
            </View>
            
            <View style={styles.chipScrollWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                {BIBLE_VERSIONS.filter((v) => v.language === 'Español').map((v) => (
                  <Chip
                    key={v.id}
                    label={v.shortName}
                    selected={versionId === v.id}
                    onPress={() => setVersionId(v.id)}
                    tone="purple"
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <AppText style={styles.settingTitle}>Notificaciones Diarias</AppText>
                <AppText style={styles.settingSubtitle}>Un mensaje de ánimo cada día</AppText>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ true: colors.purpleLight, false: colors.border }}
                thumbColor={notifications ? colors.purple : colors.textMuted}
              />
            </View>

            {notifications && (
              <View style={styles.subSettingRow}>
                <AppText style={styles.settingSubtitle}>¿A qué hora prefieres recibirlo?</AppText>
                <View style={styles.chipScrollWrapper}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                    {HOURS.map((h) => (
                      <Chip
                        key={h}
                        label={`${String(h).padStart(2, '0')}:00`}
                        selected={hour === h}
                        onPress={() => setHour(h)}
                        tone="gold"
                      />
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <AppText style={styles.settingTitle}>Voz de Jesús</AppText>
                <AppText style={styles.settingSubtitle}>Habilitar lectura de mensajes en el chat</AppText>
              </View>
              <Switch
                value={voice}
                onValueChange={setVoice}
                trackColor={{ true: colors.purpleLight, false: colors.border }}
                thumbColor={voice ? colors.purple : colors.textMuted}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <AppText style={styles.settingTitle}>Color de Subrayado</AppText>
                <AppText style={styles.settingSubtitle}>Personaliza el color para la Biblia</AppText>
              </View>
            </View>
            <View style={styles.chipScrollWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                {['#FFD700', '#FF69B4', '#87CEFA', '#98FB98', '#FFB6C1', '#E6E6FA'].map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setHighlightColor(color)}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color },
                      highlightColor === color && styles.colorCircleSelected
                    ]}
                  />
                ))}
              </ScrollView>
            </View>

          </View>
        </View>

        <Spacer size="xl" />
        <AppButton 
          label={saved ? '¡Guardado con éxito!' : 'Guardar Cambios'} 
          onPress={save} 
          disabled={!valid || busy} 
          style={saved && {backgroundColor: colors.success}} 
        />
        <Spacer size="md" />
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <AppText style={styles.logoutText}>Cerrar Sesión</AppText>
        </TouchableOpacity>
        <Spacer size="xxl" />
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  avatarText: {
    fontSize: 40,
    color: '#fff',
    fontFamily: fonts.sansBold,
  },
  profileName: {
    fontSize: 22,
    fontFamily: fonts.sansBold,
    color: colors.text,
  },
  profileRole: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    marginLeft: spacing.xs,
    marginBottom: spacing.sm,
    color: colors.textMuted,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardGroup: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.xl,
    paddingVertical: spacing.sm,
    ...shadows.card,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  fieldIcon: {
    marginRight: spacing.md,
    opacity: 0.8,
  },
  fieldInputWrapper: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.bg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
  },
  label: {
    marginBottom: 4,
    color: colors.textMuted,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  settingTextGroup: {
    flex: 1,
    paddingRight: spacing.md,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: fonts.sansSemi,
    color: colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  subSettingRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  chipScrollWrapper: {
    marginTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  chipScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 16,
    fontFamily: fonts.sansSemi,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleSelected: {
    borderColor: colors.text,
  },
});
