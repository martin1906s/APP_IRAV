import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScreenShell } from '../templates/ScreenShell';
import { AppText } from '../atoms/AppText';
import { Spacer } from '../atoms/Spacer';
import { container } from '../../composition/container';
import type { DailyInspiration } from '../../domain/entities/DailyInspiration';
import type { MoodLog } from '../../domain/entities/MoodLog';
import { refreshHomeWidgets } from '../widgets/refreshHomeWidgets';
import {
  getLastReading,
  type LastReading,
} from '../../infrastructure/adapters/reading/LastReadingStore';
import { getStoredUser } from '../../infrastructure/api/authStore';
import { colors, fonts, radius, spacing } from '../theme';
import { LogoMark } from '../molecules/LogoMark';
import { BIBLE_VERSIONS } from '../../shared/constants/bibleVersions';

const QUICK_VERSES = [
  { label: 'Salmo 23', bookId: 19, bookName: 'Salmos', chapter: 23, chapters: 150 },
  { label: 'Juan 3:16', bookId: 43, bookName: 'Juan', chapter: 3, verse: 16, chapters: 21 },
  { label: 'Filipenses 4', bookId: 50, bookName: 'Filipenses', chapter: 4, chapters: 4 },
  { label: 'Proverbios 3', bookId: 20, bookName: 'Proverbios', chapter: 3, chapters: 31 },
];

const MOOD_EMOJI: Record<string, string> = {
  Paz: '🕊️',
  Alegría: '✨',
  Ansiedad: '🌊',
  Tristeza: '💧',
  Fuerza: '🔥',
  Gratitud: '🙏',
};

function todayLabel(): string {
  return new Date().toLocaleDateString('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/** Inicio */
export function HomeScreen() {
  const nav = useNavigation<any>();
  const [name, setName] = useState('');
  const [preferredVersion, setPreferredVersion] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [inspiration, setInspiration] = useState<DailyInspiration | null>(null);
  const [recentMoods, setRecentMoods] = useState<MoodLog[]>([]);
  const [lastReading, setLastReading] = useState<LastReading | null>(null);

  const load = useCallback(async () => {
    try {
      const [profile, today, moods, reading] = await Promise.all([
        container.getProfile.execute(),
        container.getTodayInspiration.execute(),
        container.getRecentMoods.execute(7),
        getLastReading(),
      ]);

      if (profile) {
        setName(profile.name);
        container.ai.setProfile(profile);
        const version = BIBLE_VERSIONS.find((v) => v.id === profile.preferredVersionId);
        setPreferredVersion({
          id: profile.preferredVersionId,
          name: version?.name ?? profile.preferredVersionId,
        });
      }
      setInspiration(today.inspiration);
      if (today.inspiration) void refreshHomeWidgets(today.inspiration);
      setRecentMoods(moods);
      setLastReading(reading);
    } catch {
      /* la pantalla sigue con los datos locales */
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void getStoredUser().then((profile) => {
        if (!profile) return;
        setName(profile.name);
        const version = BIBLE_VERSIONS.find((v) => v.id === profile.preferredVersionId);
        setPreferredVersion({
          id: profile.preferredVersionId,
          name: version?.name ?? profile.preferredVersionId,
        });
      });
      void load();
    }, [load]),
  );

  const openBibleChapter = (params: {
    versionId: string;
    versionName: string;
    bookId: number;
    bookName: string;
    chapters: number;
    chapter: number;
    verse?: number;
  }) => {
    nav.navigate('BibleTab', {
      state: {
        routes: [
          { name: 'Versions' },
          {
            name: 'Books',
            params: { versionId: params.versionId, versionName: params.versionName },
          },
          { name: 'Chapter', params },
        ],
        index: 2,
      },
    });
  };

  const openVerse = () => {
    if (!inspiration) return;
    openBibleChapter({
      versionId: inspiration.verse.versionId,
      versionName: inspiration.verse.versionName,
      bookId: inspiration.verse.bookId,
      bookName: inspiration.verse.bookName,
      chapters: inspiration.verse.chapters,
      chapter: inspiration.verse.chapter,
      verse: inspiration.verse.verse,
    });
  };

  const openLastReading = () => {
    if (!lastReading) return;
    openBibleChapter(lastReading);
  };

  const openQuickVerse = (item: (typeof QUICK_VERSES)[number]) => {
    const versionId = preferredVersion?.id ?? 'NVI';
    const versionName = preferredVersion?.name ?? 'NVI';
    openBibleChapter({
      versionId,
      versionName,
      bookId: item.bookId,
      bookName: item.bookName,
      chapters: item.chapters,
      chapter: item.chapter,
      verse: item.verse,
    });
  };

  const openBible = () => {
    nav.navigate('BibleTab', {
      state: {
        routes: [{ name: 'Versions' }],
        index: 0,
      },
    });
  };

  const streak = recentMoods.length;
  const firstName = name.trim().split(/\s+/)[0] || '';

  return (
    <ScreenShell>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.top}>
          <LogoMark size={40} />
          <View style={styles.topText}>
            <AppText variant="hero">{firstName ? `Hola, ${firstName}` : 'Inicio'}</AppText>
            <AppText muted style={styles.date}>{todayLabel()}</AppText>
          </View>
        </View>

        <Spacer size="md" />
        <Pressable style={styles.announceCard} onPress={() => nav.navigate('Announcements')}>
          <View style={styles.announceIcon}>
            <Ionicons name="megaphone-outline" size={20} color={colors.accent} />
          </View>
          <View style={styles.announceBody}>
            <AppText variant="subtitle">Anuncios IRAV</AppText>
            <AppText muted style={styles.announceHint}>
              Comunicados y avisos de la comunidad
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        {recentMoods.length > 0 ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <AppText variant="subtitle">Tu semana</AppText>
              <AppText muted style={styles.meta}>
                {streak} {streak === 1 ? 'día' : 'días'}
              </AppText>
            </View>
            <View style={styles.moodRow}>
              {recentMoods
                .slice()
                .reverse()
                .map((log) => (
                  <View key={log.date} style={styles.moodDot}>
                    <AppText style={styles.moodEmoji}>{MOOD_EMOJI[log.mood] ?? '·'}</AppText>
                    <AppText muted style={styles.moodDay}>
                      {log.date.slice(8, 10)}/{log.date.slice(5, 7)}
                    </AppText>
                  </View>
                ))}
            </View>
          </View>
        ) : null}

        {inspiration ? (
          <Pressable onPress={openVerse} style={styles.card}>
            <AppText muted style={styles.label}>
              Palabra de hoy · {inspiration.mood}
            </AppText>
            <AppText variant="subtitle" style={styles.phrase}>
              {inspiration.phrase}
            </AppText>
            <AppText variant="verse" style={styles.verse} numberOfLines={3}>
              “{inspiration.verse.text}”
            </AppText>
            <View style={styles.refRow}>
              <AppText style={styles.ref}>{inspiration.verse.reference}</AppText>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          </Pressable>
        ) : null}

        {lastReading ? (
          <Pressable onPress={openLastReading} style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name="bookmark-outline" size={20} color={colors.accent} />
            </View>
            <View style={styles.rowBody}>
              <AppText variant="subtitle">Continuar leyendo</AppText>
              <AppText muted style={styles.rowHint}>
                {lastReading.bookName} {lastReading.chapter} · {lastReading.versionName}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}

        <View style={styles.section}>
          <AppText muted style={styles.sectionTitle}>
            Accesos rápidos
          </AppText>
          <View style={styles.quickGrid}>
            {QUICK_VERSES.map((item) => (
              <Pressable key={item.label} style={styles.quickChip} onPress={() => openQuickVerse(item)}>
                <AppText style={styles.quickText}>{item.label}</AppText>
              </Pressable>
            ))}
          </View>
        </View>

        <Spacer size="md" />

        <View style={styles.menu}>
          <Pressable style={styles.row} onPress={() => nav.navigate('ChatTab')}>
            <View style={styles.rowIcon}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.text} />
            </View>
            <View style={styles.rowBody}>
              <AppText variant="subtitle">Hablar con Jesús</AppText>
              <AppText muted style={styles.rowHint}>Chat espiritual</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>

          <Pressable style={styles.row} onPress={openBible}>
            <View style={styles.rowIcon}>
              <Ionicons name="book-outline" size={20} color={colors.text} />
            </View>
            <View style={styles.rowBody}>
              <AppText variant="subtitle">Biblia</AppText>
              <AppText muted style={styles.rowHint}>Todas las versiones</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>

          <Pressable style={styles.row} onPress={() => nav.navigate('SettingsTab')}>
            <View style={styles.rowIcon}>
              <Ionicons name="person-outline" size={20} color={colors.text} />
            </View>
            <View style={styles.rowBody}>
              <AppText variant="subtitle">Perfil y ajustes</AppText>
              <AppText muted style={styles.rowHint}>Cuenta y preferencias</AppText>
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
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  topText: { flex: 1, gap: 4 },
  date: {
    fontSize: 14,
    textTransform: 'capitalize',
    letterSpacing: 0,
  },
  announceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  announceIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  announceBody: { flex: 1, gap: 2 },
  announceHint: {
    fontSize: 13,
    textTransform: 'none',
    letterSpacing: 0,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  meta: {
    fontSize: 13,
    textTransform: 'none',
    letterSpacing: 0,
  },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodDot: { alignItems: 'center', gap: 4 },
  moodEmoji: { fontSize: 18 },
  moodDay: {
    fontSize: 11,
    textTransform: 'none',
    letterSpacing: 0,
  },
  label: {
    fontSize: 13,
    marginBottom: spacing.sm,
    textTransform: 'none',
    letterSpacing: 0,
  },
  phrase: { marginBottom: spacing.sm },
  verse: { color: colors.text },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  ref: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.accent,
    textTransform: 'none',
    letterSpacing: 0,
  },
  section: { marginBottom: spacing.sm },
  sectionTitle: {
    fontSize: 13,
    marginBottom: spacing.sm,
    textTransform: 'none',
    letterSpacing: 0,
  },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.bgCard,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  quickText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.text,
    textTransform: 'none',
    letterSpacing: 0,
  },
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
