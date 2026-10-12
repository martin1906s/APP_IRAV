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
import { colors, fonts, radius, spacing, shadows } from '../../theme';

function formatDate(iso: string | null) {
  if (!iso) return 'Sin enviar';
  return new Date(iso).toLocaleString('es-EC', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Listado y gestión moderna de anuncios con push notifications */
export function AdminAnnouncementsScreen() {
  const nav = useNavigation<any>();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
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
    Alert.alert('Enviar notificación Push', `¿Deseas enviar "${item.title}" a todos los dispositivos registrados?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Enviar ahora',
        onPress: async () => {
          setSendingId(item.id);
          try {
            const result = await container.admin.sendAnnouncement(item.id);
            const targeted = result.targetedDevices ?? result.targetedUsers ?? 0;
            Alert.alert(
              targeted === 0 ? 'Anuncio publicado' : 'Notificación enviada',
              targeted === 0
                ? 'El anuncio quedó publicado en la comunidad. Los dispositivos recibirán la alerta cuando los usuarios inicien sesión en el APK oficial.'
                : `Se entregó a ${result.recipientsCount} de ${targeted} dispositivo(s) registrados.`,
            );
            load();
          } catch {
            Alert.alert('Error', 'No se pudo enviar la notificación push.');
          } finally {
            setSendingId(null);
          }
        },
      },
    ]);
  };

  const remove = (item: Announcement) => {
    Alert.alert('Eliminar comunicado', `¿Deseas eliminar permanentemente "${item.title}"?`, [
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
        subtitle="Comunicados y Notificaciones Push"
        onBack={nav.canGoBack() ? () => nav.goBack() : undefined}
        right={
          <Pressable
            style={styles.addBtn}
            onPress={() => nav.navigate('AdminAnnouncementForm')}
            hitSlop={8}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </Pressable>
        }
      />

      {loading ? (
        <ActivityIndicator color={colors.purple} size="large" style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="megaphone-outline" size={50} color={colors.textMuted} />
              <AppText style={styles.emptyTitle}>No hay anuncios publicados</AppText>
              <AppText muted style={styles.emptySubtitle}>
                Crea avisos importantes y envía notificaciones automáticas a todos los jóvenes.
              </AppText>
            </View>
          }
          renderItem={({ item }) => {
            const isPublished = item.status === 'PUBLISHED';
            const isSending = sendingId === item.id;
            return (
              <View style={styles.card}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
                ) : null}

                <View style={styles.cardBody}>
                  <View style={styles.cardHeader}>
                    <AppText variant="subtitle" style={styles.title} numberOfLines={2}>
                      {item.title}
                    </AppText>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: isPublished ? '#E8F5E9' : '#FFF9E6' },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: isPublished ? colors.success : colors.goldDark },
                        ]}
                      />
                      <AppText
                        style={[
                          styles.statusText,
                          { color: isPublished ? colors.success : colors.goldDark },
                        ]}
                      >
                        {isPublished ? 'Enviado' : 'Borrador'}
                      </AppText>
                    </View>
                  </View>

                  <AppText muted style={styles.meta} numberOfLines={3}>
                    {item.body}
                  </AppText>

                  <View style={styles.dateRow}>
                    <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                    <AppText muted style={styles.dateText}>
                      {formatDate(item.sentAt || item.createdAt)}
                    </AppText>
                    {isPublished ? (
                      <>
                        <AppText style={styles.dot}>•</AppText>
                        <Ionicons name="notifications-outline" size={13} color={colors.purple} />
                        <AppText style={styles.recipientsText}>
                          {item.recipientsCount || 0} envíos
                        </AppText>
                      </>
                    ) : null}
                  </View>

                  <View style={styles.actions}>
                    <Pressable
                      style={[styles.actionBtn, styles.actionBtnPrimary]}
                      onPress={() => send(item)}
                      disabled={isSending}
                    >
                      {isSending ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons
                            name={isPublished ? 'refresh-outline' : 'send-outline'}
                            size={15}
                            color="#FFFFFF"
                          />
                          <AppText style={styles.actionBtnPrimaryText}>
                            {isPublished ? 'Reenviar Push' : 'Enviar Push'}
                          </AppText>
                        </>
                      )}
                    </Pressable>

                    <Pressable
                      style={styles.actionBtn}
                      onPress={() => nav.navigate('AdminAnnouncementForm', { announcementId: item.id })}
                    >
                      <Ionicons name="create-outline" size={15} color={colors.text} />
                      <AppText style={styles.actionLabel}>Editar</AppText>
                    </Pressable>

                    <Pressable style={styles.deleteBtn} onPress={() => remove(item)}>
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  list: { paddingBottom: spacing.xxl, gap: spacing.md },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontFamily: fonts.serifSemi,
    fontSize: 16,
    color: colors.text,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EFEAE2',
    overflow: 'hidden',
    ...shadows.card,
  },
  thumb: {
    width: '100%',
    height: 150,
  },
  cardBody: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontFamily: fonts.serifSemi,
    fontSize: 16,
    color: colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
  },
  dot: {
    color: colors.textMuted,
    marginHorizontal: 2,
    fontSize: 12,
  },
  recipientsText: {
    fontSize: 12,
    color: colors.purple,
    fontFamily: fonts.sansSemi,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.vellum,
  },
  actionBtnPrimary: {
    flex: 1,
    backgroundColor: colors.purple,
  },
  actionBtnPrimaryText: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: '#FFFFFF',
  },
  actionLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.text,
  },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: 'rgba(220, 76, 94, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
