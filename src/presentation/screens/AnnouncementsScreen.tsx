import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScreenShell } from '../templates/ScreenShell';
import { AppHeader } from '../organisms/AppHeader';
import { AppText } from '../atoms/AppText';
import { container } from '../../composition/container';
import type { Announcement } from '../../infrastructure/adapters/announcements/ApiAnnouncementsAdapter';
import { colors, fonts, radius, spacing } from '../theme';

/** Listado de anuncios publicados para jóvenes */
export function AnnouncementsScreen() {
  const nav = useNavigation<any>();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const hasDataRef = useRef(false);

  const load = useCallback(async () => {
    const silent = hasDataRef.current;
    if (!silent) setLoading(true);
    try {
      setItems(await container.announcements.list());
      hasDataRef.current = true;
    } catch {
      /* conservar el listado ya mostrado */
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <ScreenShell>
      <AppHeader title="Anuncios" subtitle="Comunicados de IRAV" onBack={() => nav.goBack()} />
      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <AppText muted style={styles.empty}>
              No hay anuncios por ahora.
            </AppText>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => nav.navigate('AnnouncementDetail', { announcementId: item.id })}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
              ) : null}
              <View style={styles.body}>
                <AppText variant="subtitle" style={styles.title}>
                  {item.title}
                </AppText>
                <AppText muted numberOfLines={2} style={styles.preview}>
                  {item.body}
                </AppText>
              </View>
            </Pressable>
          )}
        />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: spacing.xxl, gap: spacing.sm },
  empty: {
    textAlign: 'center',
    paddingVertical: spacing.xl,
    textTransform: 'none',
    letterSpacing: 0,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  thumb: { width: '100%', height: 120 },
  body: { padding: spacing.md, gap: spacing.xs },
  title: { textTransform: 'none', letterSpacing: 0 },
  preview: {
    fontSize: 14,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
