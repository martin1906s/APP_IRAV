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
import { refreshHomeWidgets } from '../widgets/refreshHomeWidgets';
import { colors, fonts, radius, spacing } from '../theme';

/** Inicio: marca + palabra del día (sin selector de ánimo) */
export function HomeScreen() {
  const nav = useNavigation<any>();
  const [name, setName] = useState('');
  const [inspiration, setInspiration] = useState<DailyInspiration | null>(null);
  const rise = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    const profile = await container.getProfile.execute();
    if (profile) {
      setName(profile.name);
      container.ai.setProfile(profile);
    }
    const today = await container.getTodayInspiration.execute();
    setInspiration(today.inspiration);
    if (today.inspiration) await refreshHomeWidgets(today.inspiration);
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

  const openVerse = () => {
    if (!inspiration) return;
    nav.navigate('BibleTab', {
      screen: 'Chapter',
      params: {
        versionId: inspiration.verse.versionId,
        versionName: inspiration.verse.versionName,
        bookId: inspiration.verse.bookId,
        bookName: inspiration.verse.bookName,
        chapters: inspiration.verse.chapters,
        chapter: inspiration.verse.chapter,
        verse: inspiration.verse.verse,
      },
    });
  };

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

          {inspiration ? (
            <Pressable onPress={openVerse} style={styles.word}>
              <AppText variant="caption" style={styles.wordLabel}>
                Palabra de hoy · {inspiration.mood}
              </AppText>
              <AppText variant="title" style={styles.phrase}>
                {inspiration.phrase}
              </AppText>
              <AppText variant="verse" style={styles.verse}>
                “{inspiration.verse.text}”
              </AppText>
              <View style={styles.refRow}>
                <AppText style={styles.ref}>
                  {inspiration.verse.reference}
                </AppText>
                <Ionicons name="arrow-forward" size={18} color={colors.accent} />
              </View>
            </Pressable>
          ) : null}

          <Spacer size="lg" />

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

          <Pressable style={styles.path} onPress={() => nav.navigate('BibleTab')}>
            <View style={[styles.pathLine, { backgroundColor: colors.accentWarm }]} />
            <View style={styles.pathBody}>
              <AppText variant="subtitle">Abrir la Biblia</AppText>
              <AppText muted style={styles.pathHint}>
                Lee con calma, a tu ritmo.
              </AppText>
            </View>
            <Ionicons name="book-outline" size={22} color={colors.accentWarm} />
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
    marginBottom: spacing.xl,
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
  word: {
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  wordLabel: {
    color: colors.accentWarm,
  },
  phrase: {
    color: colors.text,
  },
  verse: {
    color: colors.text,
  },
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
