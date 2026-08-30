import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScreenShell } from '../../templates/ScreenShell';
import { AppHeader } from '../../organisms/AppHeader';
import { AppText } from '../../atoms/AppText';
import { Spacer } from '../../atoms/Spacer';
import { MoodDistributionChart } from '../../components/admin/MoodDistributionChart';
import { ActivityChart } from '../../components/admin/ActivityChart';
import { NewUsersChart } from '../../components/admin/NewUsersChart';
import { container } from '../../../composition/container';
import type { AdminAnalytics } from '../../../infrastructure/adapters/admin/ApiAdminAdapter';
import { colors, radius, spacing } from '../../theme';

/** Panel principal del administrador con estadísticas y accesos */
export function AdminDashboardScreen() {
  const nav = useNavigation<any>();
  const [name, setName] = useState('');
  const [userCount, setUserCount] = useState(0);
  const [moodCount, setMoodCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [highlightCount, setHighlightCount] = useState(0);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const hasDataRef = useRef(false);

  const load = useCallback(async () => {
    const silent = hasDataRef.current;
    if (!silent) setLoading(true);
    try {
      const [profile, stats, data] = await Promise.all([
        container.getProfile.execute(),
        container.admin.getStats(),
        container.admin.getAnalytics(),
      ]);

      if (profile) setName(profile.name);
      setUserCount(stats.users);
      setMoodCount(stats.moods);
      setChatCount(stats.chats);
      setHighlightCount(stats.highlights);
      setAnalytics(data);
      hasDataRef.current = true;
    } catch {
      /* conservar estadísticas ya mostradas */
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const firstName = name.trim().split(/\s+/)[0] || 'Admin';

  return (
    <ScreenShell>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <AppHeader title="Administración" subtitle={`Bienvenido, ${firstName}`} />

        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <AppText muted style={styles.statLabel}>Jóvenes</AppText>
            <AppText style={styles.statValue}>{userCount}</AppText>
          </View>
          <View style={styles.statCard}>
            <AppText muted style={styles.statLabel}>Ánimos</AppText>
            <AppText style={styles.statValue}>{moodCount}</AppText>
          </View>
        </View>
        <Spacer size="sm" />
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <AppText muted style={styles.statLabel}>Chat</AppText>
            <AppText style={styles.statValue}>{chatCount}</AppText>
          </View>
          <View style={styles.statCard}>
            <AppText muted style={styles.statLabel}>Subrayados</AppText>
            <AppText style={styles.statValue}>{highlightCount}</AppText>
          </View>
        </View>

        <Spacer size="lg" />

        {loading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : analytics ? (
          <View style={styles.charts}>
            <MoodDistributionChart data={analytics.moodsByType} />
            <Spacer size="sm" />
            <ActivityChart data={analytics.activityLast7Days} />
            <Spacer size="sm" />
            <NewUsersChart data={analytics.newUsersByMonth} />
          </View>
        ) : null}

        <Spacer size="lg" />

        <View style={styles.menu}>
          <Pressable
            style={styles.row}
            onPress={() => nav.getParent()?.navigate('AdminUsersTab')}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="people-outline" size={20} color={colors.text} />
            </View>
            <View style={styles.rowBody}>
              <AppText variant="subtitle">Jóvenes</AppText>
              <AppText muted style={styles.rowHint}>Listado, perfiles y seguimiento pastoral</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>

          <Pressable
            style={styles.row}
            onPress={() => nav.getParent()?.navigate('AdminAnnouncementsTab')}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="megaphone-outline" size={20} color={colors.text} />
            </View>
            <View style={styles.rowBody}>
              <AppText variant="subtitle">Anuncios</AppText>
              <AppText muted style={styles.rowHint}>Crear, editar y notificar a los jóvenes</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>

          <Pressable
            style={[styles.row, styles.rowLast]}
            onPress={() => nav.getParent()?.navigate('AdminSystemTab')}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="settings-outline" size={20} color={colors.text} />
            </View>
            <View style={styles.rowBody}>
              <AppText variant="subtitle">Ajustes del sistema</AppText>
              <AppText muted style={styles.rowHint}>Retención, IA, recordatorios y más</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl },
  statRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  statLabel: {
    fontSize: 13,
    textTransform: 'none',
    letterSpacing: 0,
  },
  statValue: {
    marginTop: spacing.xs,
    fontSize: 28,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.text,
    textTransform: 'none',
    letterSpacing: 0,
  },
  loader: { marginVertical: spacing.xl },
  charts: { gap: 0 },
  menu: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.bgCard,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1, gap: 2 },
  rowHint: {
    fontSize: 13,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
