import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AppHeader } from '../components/AppHeader';
import { AppText } from '../atoms/AppText';
import { Spacer } from '../atoms/Spacer';
import { getStoredUser } from '../../infrastructure/api/authStore';
import { container } from '../../composition/container';
import type { Announcement } from '../../infrastructure/adapters/announcements/ApiAnnouncementsAdapter';
import type { DailyInspiration } from '../../domain/entities/DailyInspiration';
import { colors, fonts, radius, spacing, shadows } from '../theme';

/** Pantalla de Inicio renovada: Funcional, interactiva y con identidad visual IRAV */
export function HomeScreen() {
  const nav = useNavigation<any>();
  const [userName, setUserName] = useState('');
  const [inspiration, setInspiration] = useState<DailyInspiration | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [user, insp, annList] = await Promise.all([
        getStoredUser(),
        container.getDailyInspiration.execute().catch(() => null),
        container.announcements.list().catch(() => []),
      ]);

      if (user?.name) setUserName(user.name);
      if (insp) setInspiration(insp);
      setAnnouncements(annList.slice(0, 3));
    } catch {
      /* conservar información */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const firstName = userName.trim().split(/\s+/)[0] || 'Joven';

  return (
    <View style={styles.container}>
      {/* Header oficial con logo IRAV */}
      <AppHeader
        title="IRAV"
        subtitle={`¡Hola, ${firstName}!`}
        onAvatarPress={() => nav.navigate('Profile')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO CARD: DIÁLOGO CON JESÚS Y ACCESO AL CHAT */}
        <LinearGradient
          colors={[colors.purpleDark, colors.purple, colors.purpleLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroRow}>
            <View style={styles.heroTextContent}>
              <View style={styles.heroBadge}>
                <Image
                  source={require('../../../assets/images/IRAV.png')}
                  style={styles.heroBadgeLogo}
                  resizeMode="contain"
                />
                <AppText style={styles.heroBadgeText}>Palabra de Vida</AppText>
              </View>

              <AppText style={styles.heroTitle}>
                &quot;No temas, porque yo estoy contigo&quot;
              </AppText>
              <AppText style={styles.heroSub}>
                ¿Tienes alguna inquietud o necesitas oración hoy? Jesús está listo para escucharte.
              </AppText>

              <Pressable
                style={styles.chatCtaBtn}
                onPress={() => nav.getParent()?.navigate('ChatTab')}
              >
                <Ionicons name="chatbubbles" size={16} color={colors.purpleDark} />
                <AppText style={styles.chatCtaText}>Hablar con Jesús</AppText>
              </Pressable>
            </View>

            <Image
              source={require('../../../assets/images/jesusRelajadoSentado.png')}
              style={styles.jesusHeroImage}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>

        <Spacer size="md" />

        {/* ACCESOS DIRECTOS FUNCIONALES */}
        <View style={styles.quickGrid}>
          <Pressable
            style={styles.quickCard}
            onPress={() => nav.getParent()?.navigate('BibleTab')}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: '#FFF9E6' }]}>
              <Ionicons name="book" size={22} color={colors.goldDark} />
            </View>
            <AppText style={styles.quickTitle}>Lectura Bíblica</AppText>
            <AppText muted style={styles.quickSub}>Capítulo de hoy</AppText>
          </Pressable>

          <Pressable
            style={styles.quickCard}
            onPress={() => nav.getParent()?.navigate('ChallengeTab')}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="trophy" size={22} color={colors.success} />
            </View>
            <AppText style={styles.quickTitle}>Reto del Mes</AppText>
            <AppText muted style={styles.quickSub}>Meta de fe activa</AppText>
          </Pressable>

          <Pressable
            style={styles.quickCard}
            onPress={() => nav.navigate('Announcements')}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: colors.purpleSoft }]}>
              <Ionicons name="megaphone" size={22} color={colors.purple} />
            </View>
            <AppText style={styles.quickTitle}>Avisos</AppText>
            <AppText muted style={styles.quickSub}>Noticias IRAV</AppText>
          </Pressable>
        </View>

        <Spacer size="md" />

        {/* ESTADO DEL DEVOCIONAL / ÁNIMO DEL DÍA O VERSÍCULO */}
        {inspiration ? (
          <View style={styles.verseCard}>
            <View style={styles.verseHeader}>
              <View style={styles.verseIconBadge}>
                <Ionicons name="sparkles" size={16} color={colors.goldWarm} />
              </View>
              <AppText style={styles.verseBadgeTitle}>
                {inspiration.mood ? `Palabra de hoy para ti (${inspiration.mood})` : 'Versículo para meditar'}
              </AppText>
            </View>

            <AppText style={styles.verseText}>
              &quot;{typeof inspiration.verse === 'object' ? inspiration.verse?.text : inspiration.verse}&quot;
            </AppText>

            <View style={styles.verseFooter}>
              <View style={styles.verseRefPill}>
                <Ionicons name="bookmark-outline" size={13} color={colors.purple} />
                <AppText style={styles.verseRefText}>
                  {typeof inspiration.verse === 'object' ? (inspiration.verse?.reference || inspiration.reference) : inspiration.reference}
                </AppText>
              </View>

              <Pressable
                style={styles.verseActionBtn}
                onPress={() => nav.getParent()?.navigate('BibleTab')}
              >
                <AppText style={styles.verseActionText}>Leer en la Biblia</AppText>
                <Ionicons name="arrow-forward" size={14} color={colors.purple} />
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.moodPromptCard}>
            <View style={styles.moodPromptLeft}>
              <View style={styles.moodPromptIcon}>
                <Ionicons name="sunny" size={20} color={colors.goldDark} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={styles.moodPromptTitle}>¿Cómo estás hoy?</AppText>
                <AppText muted style={styles.moodPromptSub}>
                  Registra tu ánimo para recibir tu versículo guiado.
                </AppText>
              </View>
            </View>
            <Pressable
              style={styles.moodPromptBtn}
              onPress={() => nav.getParent()?.navigate('BibleTab')}
            >
              <AppText style={styles.moodPromptBtnText}>Explorar</AppText>
            </Pressable>
          </View>
        )}

        <Spacer size="md" />

        {/* SECCIÓN DE COMUNICADOS / ANUNCIOS RECIENTES */}
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="newspaper-outline" size={18} color={colors.purple} />
            <AppText style={styles.sectionTitle}>Comunidad IRAV</AppText>
          </View>
          {announcements.length > 0 && (
            <Pressable onPress={() => nav.navigate('Announcements')}>
              <AppText style={styles.seeAllText}>Ver todos</AppText>
            </Pressable>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.purple} style={{ marginVertical: spacing.md }} />
        ) : announcements.length === 0 ? (
          <View style={styles.emptyAnnouncements}>
            <Image
              source={require('../../../assets/images/IRAV.png')}
              style={styles.emptyLogo}
              resizeMode="contain"
            />
            <AppText style={styles.emptyTitle}>Todo al día en la congregación</AppText>
            <AppText muted style={styles.emptySub}>
              Pronto compartiremos nuevos retiros, campamentos y encuentros juveniles.
            </AppText>
          </View>
        ) : (
          announcements.map((item) => (
            <Pressable
              key={item.id}
              style={styles.announcementCard}
              onPress={() => nav.navigate('AnnouncementDetail', { announcementId: item.id })}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.announcementThumb} resizeMode="cover" />
              ) : null}
              <View style={styles.announcementBody}>
                <AppText style={styles.announcementTitle} numberOfLines={2}>
                  {item.title}
                </AppText>
                <AppText muted style={styles.announcementExcerpt} numberOfLines={2}>
                  {item.body}
                </AppText>
                <View style={styles.announcementMeta}>
                  <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                  <AppText muted style={styles.announcementDate}>
                    {new Date(item.createdAt || '').toLocaleDateString('es-EC', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </AppText>
                </View>
              </View>
            </Pressable>
          ))
        )}

        <Spacer size="md" />

        {/* BANNER DE SERVICIO PRESENCIAL / EN VIVO */}
        <View style={styles.serviceBanner}>
          <View style={styles.serviceLeft}>
            <View style={styles.livePill}>
              <View style={styles.livePulse} />
              <AppText style={styles.livePillText}>Reunión General</AppText>
            </View>
            <AppText style={styles.serviceTitle}>Culto de Adoración</AppText>
            <AppText muted style={styles.serviceTime}>
              Domingos a las 10:00 AM y 17:00 PM
            </AppText>
          </View>
          <View style={styles.churchBadgeWrap}>
            <Image
              source={require('../../../assets/images/IRAV.png')}
              style={styles.churchBadgeLogo}
              resizeMode="contain"
            />
          </View>
        </View>

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
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    borderRadius: radius.xl,
    padding: spacing.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTextContent: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginBottom: spacing.xs,
  },
  heroBadgeLogo: {
    width: 14,
    height: 14,
  },
  heroBadgeText: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    color: colors.gold,
  },
  heroTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 17,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  heroSub: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    lineHeight: 17,
  },
  chatCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gold,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
    ...shadows.subtle,
  },
  chatCtaText: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: colors.purpleDark,
  },
  jesusHeroImage: {
    width: 115,
    height: 135,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickCard: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEAE2',
    ...shadows.subtle,
  },
  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  quickSub: {
    fontSize: 10,
    marginTop: 1,
    textAlign: 'center',
  },
  verseCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#EFEAE2',
    borderLeftWidth: 4,
    borderLeftColor: colors.purple,
    ...shadows.card,
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  verseIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseBadgeTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    color: colors.purple,
  },
  verseText: {
    fontFamily: fonts.serifSemi,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    fontStyle: 'italic',
  },
  verseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  verseRefPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.purpleSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  verseRefText: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: colors.purple,
  },
  verseActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verseActionText: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    color: colors.purple,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontFamily: fonts.serifSemi,
    fontSize: 16,
    color: colors.text,
  },
  seeAllText: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    color: colors.purple,
  },
  emptyAnnouncements: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyLogo: {
    width: 48,
    height: 48,
    marginBottom: spacing.xs,
    opacity: 0.85,
  },
  emptyTitle: {
    fontFamily: fonts.serifSemi,
    fontSize: 14,
    color: colors.text,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: spacing.md,
  },
  announcementCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFEAE2',
    ...shadows.card,
  },
  announcementThumb: {
    width: '100%',
    height: 120,
  },
  announcementBody: {
    padding: spacing.md,
  },
  announcementTitle: {
    fontFamily: fonts.serifSemi,
    fontSize: 15,
    color: colors.text,
    marginBottom: 4,
  },
  announcementExcerpt: {
    fontSize: 13,
    lineHeight: 18,
  },
  announcementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  announcementDate: {
    fontSize: 11,
  },
  serviceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#EFEAE2',
    ...shadows.card,
  },
  serviceLeft: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.purpleSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.purple,
  },
  livePillText: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: colors.purple,
  },
  serviceTitle: {
    fontFamily: fonts.serifSemi,
    fontSize: 16,
    color: colors.text,
  },
  serviceTime: {
    fontSize: 12,
    marginTop: 2,
  },
  churchBadgeWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.vellum,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  churchBadgeLogo: {
    width: 36,
    height: 36,
  },
  moodPromptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#EFEAE2',
    ...shadows.subtle,
  },
  moodPromptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  moodPromptIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF9E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodPromptTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: colors.text,
  },
  moodPromptSub: {
    fontSize: 11,
    marginTop: 1,
  },
  moodPromptBtn: {
    backgroundColor: colors.purpleSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  moodPromptBtnText: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    color: colors.purple,
  },
});
