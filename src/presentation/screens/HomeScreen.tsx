import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScreenShell } from '../templates/ScreenShell';
import { LogoMark } from '../molecules/LogoMark';
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
import { colors, fonts, radius, spacing } from '../theme';
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

/** Inicio: marca, palabra del día, continuar lectura y accesos rápidos */
export function HomeScreen() {
  const nav = useNavigation<any>();
  const [name, setName] = useState('');
  const [preferredVersion, setPreferredVersion] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [inspiration, setInspiration] = useState<DailyInspiration | null>(null);
  const [recentMoods, setRecentMoods] = useState<MoodLog[]>([]);
  const [lastReading, setLastReading] = useState<LastReading | null>(null);
  const rise = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    const profile = await container.getProfile.execute();
    if (profile) {
      setName(profile.name);
      container.ai.setProfile(profile);
      const version = BIBLE_VERSIONS.find((v) => v.id === profile.preferredVersionId);
      setPreferredVersion({
        id: profile.preferredVersionId,
        name: version?.name ?? profile.preferredVersionId,
      });
    }
    const today = await container.getTodayInspiration.execute();
    setInspiration(today.inspiration);
    if (today.inspiration) await refreshHomeWidgets(today.inspiration);
    const moods = await container.getRecentMoods.execute(7);
    setRecentMoods(moods);
    setLastReading(await getLastReading());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    Animated.spring(rise, {
      toValue: 1,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [rise]);

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

  return (
    <ScreenShell>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View
          style={{
            opacity: rise,
            transform: [
              {
                translateY: rise.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, 0],
                }),
              },
            ],
          }}
        >
          <View style={styles.brand}>
            <LogoMark size={88} />
            <AppText variant="hero" style={styles.brandName}>
              IRAV
            </AppText>
            <AppText style={styles.greet}>
              {name ? `Hola, ${name}` : 'Bienvenido'}
            </AppText>
          </View>

          {recentMoods.length > 0 ? (
            <View style={styles.moodCard}>
              <View style={styles.moodHeader}>
                <AppText variant="caption" style={styles.moodLabel}>
                  Tu semana
                </AppText>
                <AppText style={styles.streak}>
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
                      <AppText style={styles.moodDay}>
                        {log.date.slice(8, 10)}/{log.date.slice(5, 7)}
                      </AppText>
                    </View>
                  ))}
              </View>
            </View>
          ) : null}

          {inspiration ? (
            <Pressable onPress={openVerse} style={styles.word}>
              <AppText variant="caption" style={styles.wordLabel}>
                Palabra de hoy · {inspiration.mood}
              </AppText>
              <AppText variant="title" style={styles.phrase}>
                {inspiration.phrase}
              </AppText>
              <AppText variant="verse" style={styles.verse} numberOfLines={3}>
                “{inspiration.verse.text}”
              </AppText>
              <View style={styles.refRow}>
                <AppText style={styles.ref}>{inspiration.verse.reference}</AppText>
                <Ionicons name="arrow-forward" size={18} color={colors.accent} />
              </View>
            </Pressable>
          ) : null}

          {lastReading ? (
            <Pressable onPress={openLastReading} style={styles.continue}>
              <View style={styles.continueIcon}>
                <Ionicons name="bookmark" size={20} color={colors.accent} />
              </View>
              <View style={styles.continueBody}>
                <AppText variant="caption" style={styles.continueLabel}>
                  Continuar leyendo
                </AppText>
                <AppText variant="subtitle">
                  {lastReading.bookName} {lastReading.chapter}
                </AppText>
                <AppText muted style={styles.continueHint}>
                  {lastReading.versionName}
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          ) : null}

          <View style={styles.section}>
            <AppText variant="caption" style={styles.sectionLabel}>
              Versículos populares
            </AppText>
            <View style={styles.quickGrid}>
              {QUICK_VERSES.map((item) => (
                <Pressable
                  key={item.label}
                  style={styles.quickChip}
                  onPress={() => openQuickVerse(item)}
                >
                  <AppText style={styles.quickText}>{item.label}</AppText>
                </Pressable>
              ))}
            </View>
          </View>

          <Spacer size="md" />

          <Pressable style={styles.path} onPress={() => nav.navigate('ChatTab')}>
            <View style={styles.pathLine} />
            <View style={styles.pathBody}>
              <AppText variant="subtitle">Hablar con Jesús</AppText>
              <AppText muted style={styles.pathHint}>
                Escribe o graba. Él te escucha.
              </AppText>
            </View>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.accent} />
          </Pressable>

          <Pressable style={styles.path} onPress={openBible}>
            <View style={[styles.pathLine, { backgroundColor: colors.accentWarm }]} />
            <View style={styles.pathBody}>
              <AppText variant="subtitle">Abrir la Biblia</AppText>
              <AppText muted style={styles.pathHint}>
                Lee con calma, a tu ritmo.
              </AppText>
            </View>
            <Ionicons name="book-outline" size={22} color={colors.accentWarm} />
          </Pressable>

          <Pressable style={styles.path} onPress={() => nav.navigate('SettingsTab')}>
            <View style={[styles.pathLine, { backgroundColor: colors.border }]} />
            <View style={styles.pathBody}>
              <AppText variant="subtitle">Tu perfil</AppText>
              <AppText muted style={styles.pathHint}>
                Versión bíblica, notificaciones y más.
              </AppText>
            </View>
            <Ionicons name="person-outline" size={22} color={colors.textMuted} />
          </Pressable>
        </Animated.View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl },
  brand: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  brandName: {
    marginTop: spacing.md,
    color: colors.accent,
  },
  greet: {
    marginTop: spacing.sm,
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.textMuted,
    textTransform: 'none',
    letterSpacing: 0,
  },
  moodCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  moodLabel: { color: colors.accentWarm },
  streak: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'none',
    letterSpacing: 0,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodDot: { alignItems: 'center', gap: 4 },
  moodEmoji: { fontSize: 18 },
  moodDay: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'none',
    letterSpacing: 0,
  },
  word: {
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  wordLabel: { color: colors.accentWarm },
  phrase: { color: colors.text },
  verse: { color: colors.text },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  ref: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.accent,
    textTransform: 'none',
    letterSpacing: 0,
  },
  continue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  continueIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBody: { flex: 1, gap: 2 },
  continueLabel: { color: colors.accentWarm },
  continueHint: {
    fontSize: 13,
    textTransform: 'none',
    letterSpacing: 0,
  },
  section: { marginBottom: spacing.sm },
  sectionLabel: {
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.text,
    textTransform: 'none',
    letterSpacing: 0,
  },
  path: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  pathLine: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  pathBody: { flex: 1, gap: 2 },
  pathHint: {
    fontSize: 14,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
