import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScreenShell } from '../../templates/ScreenShell';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../atoms/AppText';
import { Spacer } from '../../atoms/Spacer';
import { MoodDistributionChart } from '../../components/admin/MoodDistributionChart';
import { ActivityChart } from '../../components/admin/ActivityChart';
import { NewUsersChart } from '../../components/admin/NewUsersChart';
import { container } from '../../../composition/container';
import type { AdminAnalytics } from '../../../infrastructure/adapters/admin/ApiAdminAdapter';
import { colors, fonts, radius, spacing, shadows } from '../../theme';

/** Panel principal del administrador con estadísticas litúrgicas y accesos premium */
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

  const firstName = name.trim().split(/\s+/)[0] || 'Líder';

  return (
    <ScreenShell padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <AppHeader
          title="Administración"
          subtitle={`Bienvenido, ${firstName}`}
          onAvatarPress={() => nav.navigate('Profile')}
        />

        <View style={styles.content}>
          {/* BANNER HERO LITÚRGICO */}
          <LinearGradient
            colors={[colors.purpleDark, colors.purple, colors.purpleLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            <View style={styles.heroHeader}>
              <View style={styles.heroBadge}>
                <Ionicons name="sparkles" size={13} color={colors.gold} />
                <AppText style={styles.heroBadgeText}>Comunidad IRAV</AppText>
              </View>
              <AppText style={styles.heroDate}>
                {new Date().toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric', month: 'short' })}
              </AppText>
            </View>

            <AppText style={styles.heroTitle}>Cuidado Pastoral y Guía</AppText>
            <AppText style={styles.heroSubtitle}>
              Monitorea el crecimiento espiritual, ánimo y necesidades de tus jóvenes en tiempo real.
            </AppText>

            {/* METRICS ROW INSIDE HERO */}
            <View style={styles.heroMetrics}>
              <View style={styles.metricItem}>
                <AppText style={styles.metricVal}>{userCount}</AppText>
                <AppText style={styles.metricLbl}>Jóvenes</AppText>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <AppText style={styles.metricVal}>{moodCount}</AppText>
                <AppText style={styles.metricLbl}>Ánimos</AppText>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <AppText style={styles.metricVal}>{chatCount}</AppText>
                <AppText style={styles.metricLbl}>Mensajes</AppText>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <AppText style={styles.metricVal}>{highlightCount}</AppText>
                <AppText style={styles.metricLbl}>Subrayados</AppText>
              </View>
            </View>
          </LinearGradient>

          <Spacer size="md" />

          {/* ACCESOS DIRECTOS DESTACADOS */}
          <View style={styles.quickNavGrid}>
            <Pressable
              style={styles.quickNavCard}
              onPress={() => nav.getParent()?.navigate('AdminUsersTab')}
            >
              <View style={[styles.quickNavIconWrap, { backgroundColor: colors.purpleSoft }]}>
                <Ionicons name="people" size={20} color={colors.purple} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={styles.quickNavTitle}>Jóvenes</AppText>
                <AppText muted style={styles.quickNavSub}>Fichas y perfiles</AppText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </Pressable>

            <Pressable
              style={styles.quickNavCard}
              onPress={() => nav.getParent()?.navigate('AdminAnnouncementsTab')}
            >
              <View style={[styles.quickNavIconWrap, { backgroundColor: '#FFF9E6' }]}>
                <Ionicons name="megaphone" size={20} color={colors.goldDark} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={styles.quickNavTitle}>Anuncios</AppText>
                <AppText muted style={styles.quickNavSub}>Push notifications</AppText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </Pressable>
          </View>

          <Spacer size="sm" />

          {/* CHARTS SECTION */}
          {loading ? (
            <ActivityIndicator color={colors.purple} style={styles.loader} />
          ) : analytics ? (
            <View style={styles.charts}>
              <View style={styles.sectionHeader}>
                <Ionicons name="analytics" size={18} color={colors.purple} />
                <AppText style={styles.sectionTitle}>Métricas Comunitarias</AppText>
              </View>
              <MoodDistributionChart data={analytics.moodsByType} />
              <Spacer size="sm" />
              <ActivityChart data={analytics.activityLast7Days} />
              <Spacer size="sm" />
              <NewUsersChart data={analytics.newUsersByMonth} />
            </View>
          ) : null}

          <Spacer size="lg" />

          {/* MENÚ DE AJUSTES */}
          <Pressable
            style={styles.settingsRow}
            onPress={() => nav.getParent()?.navigate('AdminSystemTab')}
          >
            <View style={[styles.quickNavIconWrap, { backgroundColor: colors.vellumDark }]}>
              <Ionicons name="settings" size={20} color={colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={styles.quickNavTitle}>Ajustes del Sistema</AppText>
              <AppText muted style={styles.quickNavSub}>Retención de chat, IA Gemini, horarios y más</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxl },
  content: { paddingHorizontal: spacing.lg },
  heroBanner: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  heroBadgeText: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    color: colors.gold,
  },
  heroDate: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    textTransform: 'capitalize',
  },
  heroTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 4,
  },
  heroSubtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    lineHeight: 18,
  },
  heroMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.md,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontFamily: fonts.sansBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  metricLbl: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickNavGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickNavCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.card,
  },
  quickNavIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickNavTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: colors.text,
  },
  quickNavSub: {
    fontSize: 11,
    marginTop: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontFamily: fonts.serifSemi,
    fontSize: 15,
    color: colors.text,
  },
  loader: { marginVertical: spacing.xl },
  charts: { gap: 0 },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.card,
  },
});
