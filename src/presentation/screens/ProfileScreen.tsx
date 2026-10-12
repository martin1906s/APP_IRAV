import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { Card } from '../components/Card';
import { AppText } from '../atoms/AppText';
import { colors, radius, spacing, typography } from '../theme';
import { getStoredUser, clearSession } from '../../infrastructure/api/authStore';
import type { UserProfile } from '../../domain/entities/UserProfile';
import { AppButton } from '../atoms/AppButton';

export function ProfileScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadUser() {
      const stored = await getStoredUser();
      setUser(stored);
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Salir', 
        style: 'destructive',
        onPress: async () => {
          await clearSession();
          // The auth listener in App.tsx or similar should handle redirection
        }
      }
    ]);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <AppHeader title="Mi Perfil" showLogo={false} />
        <View style={styles.center}>
          <AppText>Cargando perfil...</AppText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Mi Perfil" showLogo={false} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarLarge}>
             <Ionicons name="person" size={40} color={colors.gold} />
          </View>
          <View style={styles.profileInfo}>
            <AppText variant="title" style={styles.name}>{user.name}</AppText>
            <AppText style={styles.role}>{user.role === 'ADMIN' ? 'Administrador' : 'Miembro'}</AppText>
            <View style={styles.statusBadge}>
              <AppText style={styles.statusText}>Activo</AppText>
            </View>
          </View>
        </Card>

        {/* Info Personal */}
        <View style={styles.section}>
          <AppText variant="subtitle" style={styles.sectionTitle}>Información Personal</AppText>
          <Card style={styles.detailsCard}>
            <InfoRow icon="globe-outline" label="País" value={user.country} />
            <InfoRow icon="call-outline" label="Teléfono" value={user.phone} />
            <InfoRow icon="calendar-outline" label="Nacimiento" value={user.birthDate.toString()} />
            <InfoRow icon="id-card-outline" label={`Documento (${user.documentType})`} value={user.documentId} noBorder />
          </Card>
        </View>

        {/* Preferencias */}
        <View style={styles.section}>
          <AppText variant="subtitle" style={styles.sectionTitle}>Preferencias de la App</AppText>
          <Card style={styles.detailsCard}>
            <InfoRow icon="book-outline" label="Versión de Biblia" value={user.preferredVersionId} />
            <InfoRow icon="notifications-outline" label="Notificaciones" value={user.notificationsEnabled ? 'Activadas' : 'Desactivadas'} />
            <InfoRow icon="time-outline" label="Hora de Recordatorio" value={`${user.reminderHour.toString().padStart(2, '0')}:${user.reminderMinute.toString().padStart(2, '0')}`} />
            <InfoRow icon="mic-outline" label="Interacción por Voz" value={user.voiceEnabled ? 'Activada' : 'Desactivada'} noBorder />
          </Card>
        </View>

        <AppButton label="Cerrar sesión" onPress={handleLogout} variant="boxed" style={styles.logoutBtn} />

        <AppText style={styles.footerSlogan}>Creciendo en fe juntos</AppText>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value, noBorder }: { icon: any, label: string, value: string, noBorder?: boolean }) {
  return (
    <View style={[styles.infoRow, !noBorder && styles.rowBorder]}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={20} color={colors.purple} />
      </View>
      <View style={styles.infoTextContainer}>
        <AppText variant="caption" style={styles.infoLabel}>{label}</AppText>
        <AppText variant="body" style={styles.infoValue}>{value}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: spacing.md,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.vellumDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    color: colors.text,
    marginBottom: 4,
  },
  role: {
    fontFamily: typography.body.fontFamily,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: colors.textOnGold,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.md,
    marginLeft: spacing.sm,
  },
  detailsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.vellum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    color: colors.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    color: colors.text,
  },
  logoutBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.vellumDark,
  },
  footerSlogan: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
