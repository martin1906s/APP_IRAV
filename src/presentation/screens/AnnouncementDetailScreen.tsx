import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { ScreenShell } from '../templates/ScreenShell';
import { AppHeader } from '../organisms/AppHeader';
import { AppText } from '../atoms/AppText';
import { Spacer } from '../atoms/Spacer';
import { container } from '../../composition/container';
import type { Announcement } from '../../infrastructure/adapters/announcements/ApiAnnouncementsAdapter';
import { colors, fonts, radius, spacing } from '../theme';

type RouteParams = { announcementId: string };

/** Detalle de un anuncio */
export function AnnouncementDetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const announcementId = (route.params as RouteParams).announcementId;
  const [item, setItem] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const hasDataRef = useRef(false);

  const load = useCallback(async () => {
    const silent = hasDataRef.current;
    if (!silent) setLoading(true);
    try {
      setItem(await container.announcements.get(announcementId));
      hasDataRef.current = true;
    } catch {
      /* conservar el detalle ya mostrado */
    } finally {
      if (!silent) setLoading(false);
    }
  }, [announcementId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading || !item) {
    return (
      <ScreenShell>
        <AppHeader title="Anuncio" onBack={() => nav.goBack()} />
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader title="Anuncio" onBack={() => nav.goBack()} />
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : null}
        <View style={styles.card}>
          <AppText variant="subtitle" style={styles.title}>
            {item.title}
          </AppText>
          {item.sentAt ? (
            <AppText muted style={styles.date}>
              {new Date(item.sentAt).toLocaleString('es-EC')}
            </AppText>
          ) : null}
          <Spacer size="sm" />
          <AppText style={styles.body}>{item.body}</AppText>
        </View>
        <Spacer size="xxl" />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 220,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  title: {
    textTransform: 'none',
    letterSpacing: 0,
  },
  date: {
    fontSize: 12,
    marginTop: spacing.xs,
    textTransform: 'none',
    letterSpacing: 0,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
