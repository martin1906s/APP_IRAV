import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScreenShell } from '../../templates/ScreenShell';
import { AppHeader } from '../../organisms/AppHeader';
import { AppText } from '../../atoms/AppText';
import { container } from '../../../composition/container';
import type { Announcement } from '../../../infrastructure/adapters/announcements/ApiAnnouncementsAdapter';
import { colors, fonts, radius, spacing } from '../../theme';

function formatDate(iso: string | null) {
  if (!iso) return 'Sin enviar';
  return new Date(iso).toLocaleString('es-EC', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Listado y gestión de anuncios */
export function AdminAnnouncementsScreen() {
  const nav = useNavigation<any>();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const hasDataRef = useRef(false);

  const load = useCallback(async () => {
    const silent = hasDataRef.current;
    if (!silent) setLoading(true);
    try {
      setItems(await container.admin.listAnnouncements());
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

  const send = (item: Announcement) => {
    Alert.alert('Enviar anuncio', `¿Notificar a los jóvenes con "${item.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Enviar',
        onPress: async () => {
          try {
            const result = await container.admin.sendAnnouncement(item.id);
            const targeted = result.targetedDevices ?? result.targetedUsers ?? 0;
            Alert.alert(
              targeted === 0 ? 'Anuncio publicado' : 'Enviado',
              targeted === 0
                ? 'El anuncio quedó publicado, pero ningún teléfono tiene notificaciones registradas. Cada usuario debe abrir la app instalada (APK, no Expo Go) e iniciar sesión.'
                : `Se envió a ${result.recipientsCount} de ${targeted} dispositivo(s) registrados.`,
            );
            load();
          } catch {
            Alert.alert('Error', 'No se pudo enviar el anuncio.');
          }
        },
      },
    ]);
  };

  const remove = (item: Announcement) => {
    Alert.alert('Eliminar', `¿Borrar "${item.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await container.admin.deleteAnnouncement(item.id);
          load();
        },
      },
    ]);
  };

  return (
    <ScreenShell>
      <AppHeader
        title="Anuncios"
        subtitle="Comunicados para la comunidad"
        onBack={nav.canGoBack() ? () => nav.goBack() : undefined}
        right={
          <Pressable
            style={styles.addBtn}
            onPress={() => nav.navigate('AdminAnnouncementForm')}
            hitSlop={8}
          >
            <Ionicons name="add" size={22} color={colors.bg} />
          </Pressable>
        }
      />

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <AppText muted style={styles.empty}>
              Aún no hay anuncios. Crea el primero con el botón +.
            </AppText>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
              ) : (
                <View style={styles.thumbPlaceholder}>
                  <Ionicons name="megaphone-outline" size={28} color={colors.textMuted} />
                </View>
              )}
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <AppText variant="subtitle" style={styles.title}>
                    {item.title}
                  </AppText>
                  <View
                    style={[
                      styles.badge,
                      item.status === 'PUBLISHED' ? styles.badgePublished : styles.badgeDraft,
                    ]}
                  >
                    <AppText style={styles.badgeText}>
                      {item.status === 'PUBLISHED' ? 'Enviado' : 'Borrador'}
                    </AppText>
                  </View>
                </View>
                <AppText muted style={styles.meta} numberOfLines={2}>
                  {item.body}
                </AppText>
                <AppText muted style={styles.date}>
                  {formatDate(item.sentAt)}
                  {item.status === 'PUBLISHED' ? ` · ${item.recipientsCount} envíos` : ''}
                </AppText>
                <View style={styles.actions}>
                  {item.status === 'DRAFT' ? (
                    <Pressable style={styles.actionBtn} onPress={() => send(item)}>
                      <Ionicons name="send" size={16} color={colors.accent} />
                      <AppText style={styles.actionLabel}>Enviar</AppText>
                    </Pressable>
                  ) : (
                    <Pressable style={styles.actionBtn} onPress={() => send(item)}>
                      <Ionicons name="refresh" size={16} color={colors.accent} />
                      <AppText style={styles.actionLabel}>Reenviar</AppText>
                    </Pressable>
                  )}
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => nav.navigate('AdminAnnouncementForm', { announcementId: item.id })}
                  >
                    <Ionicons name="create-outline" size={16} color={colors.text} />
                    <AppText style={styles.actionLabel}>Editar</AppText>
                  </Pressable>
                  <Pressable style={styles.actionBtn} onPress={() => remove(item)}>
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    <AppText style={[styles.actionLabel, { color: colors.danger }]}>Borrar</AppText>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingBottom: spacing.xxl, gap: spacing.sm },
  empty: {
    textAlign: 'center',
    paddingVertical: spacing.xl,
    textTransform: 'none',
    letterSpacing: 0,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  thumb: { width: '100%', height: 140 },
  thumbPlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { padding: spacing.md, gap: spacing.xs },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  title: { flex: 1, textTransform: 'none', letterSpacing: 0 },
  badge: {
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgePublished: { backgroundColor: colors.accentSoft },
  badgeDraft: { backgroundColor: colors.surface },
  badgeText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.accent,
    textTransform: 'none',
    letterSpacing: 0,
  },
  meta: {
    fontSize: 14,
    textTransform: 'none',
    letterSpacing: 0,
  },
  date: {
    fontSize: 12,
    textTransform: 'none',
    letterSpacing: 0,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.text,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
