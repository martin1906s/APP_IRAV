import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScreenShell } from '../../templates/ScreenShell';
import { AppHeader } from '../../organisms/AppHeader';
import { AppText } from '../../atoms/AppText';
import { container } from '../../../composition/container';
import type { AdminUserRow } from '../../../infrastructure/adapters/admin/ApiAdminAdapter';
import { colors, fonts, radius, spacing, shadows } from '../../theme';

const MOOD_COLOR: Record<string, { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }> = {
  Paz: { bg: '#EBF3FB', text: '#2A6F97', icon: 'leaf-outline' },
  Alegría: { bg: '#FFF9E6', text: '#B8860B', icon: 'sunny-outline' },
  Ansiedad: { bg: '#FFF4E5', text: '#D97706', icon: 'pulse-outline' },
  Tristeza: { bg: '#F1F5F9', text: '#475569', icon: 'rainy-outline' },
  Fuerza: { bg: '#F3E8FF', text: '#6B21A8', icon: 'shield-checkmark-outline' },
  Gratitud: { bg: '#E8F5E9', text: '#2E7D32', icon: 'heart-outline' },
};

function dialPhone(phone: string) {
  Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
}

function openWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, '');
  Linking.openURL(`https://wa.me/${digits}`);
}

function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

/** Panel admin: listado interactivo y moderno de jóvenes */
export function AdminUsersScreen() {
  const nav = useNavigation<any>();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const hasDataRef = useRef(false);

  const load = useCallback(async () => {
    const silent = hasDataRef.current;
    if (!silent) setLoading(true);
    try {
      setUsers(await container.admin.listUsers());
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

  const filteredUsers = users
    .filter((u) => u.role !== 'ADMIN')
    .filter((u) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        (u.documentId && u.documentId.includes(q)) ||
        (u.phone && u.phone.includes(q))
      );
    });

  return (
    <ScreenShell padded={false}>
      <View style={{ paddingHorizontal: spacing.lg, flex: 1 }}>
        <AppHeader
          title="Jóvenes"
          subtitle={`${filteredUsers.length} miembro(s) registrados`}
          right={
            <Pressable
              style={styles.addBtn}
              onPress={() => nav.navigate('AdminUserForm')}
              hitSlop={8}
            >
              <Ionicons name="person-add" size={18} color="#FFFFFF" />
            </Pressable>
          }
        />

        {/* BUSCADOR DE JÓVENES */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nombre o documento…"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.purple} size="large" style={{ marginTop: spacing.xl }} />
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(u) => u.id!}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color={colors.textMuted} />
                <AppText style={styles.emptyTitle}>No se encontraron jóvenes</AppText>
                <AppText muted style={styles.emptySubtitle}>
                  {search ? 'Prueba con otro término de búsqueda.' : 'Crea el primer perfil con el botón +.'}
                </AppText>
              </View>
            }
            renderItem={({ item }) => {
              const moodInfo = item.lastMood ? MOOD_COLOR[item.lastMood.mood] : null;
              return (
                <Pressable
                  style={styles.card}
                  onPress={() => nav.navigate('AdminUserDetail', { userId: item.id })}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.avatarWrap}>
                      <AppText style={styles.avatarText}>{getInitials(item.name)}</AppText>
                    </View>

                    <View style={styles.userInfo}>
                      <View style={styles.nameRow}>
                        <AppText variant="subtitle" style={styles.userName} numberOfLines={1}>
                          {item.name}
                        </AppText>
                        {moodInfo && item.lastMood ? (
                          <View style={[styles.moodPill, { backgroundColor: moodInfo.bg }]}>
                            <Ionicons name={moodInfo.icon} size={12} color={moodInfo.text} />
                            <AppText style={[styles.moodText, { color: moodInfo.text }]}>
                              {item.lastMood.mood}
                            </AppText>
                          </View>
                        ) : null}
                      </View>

                      <AppText muted style={styles.meta}>
                        {item.documentType === 'CEDULA' ? 'Cédula' : 'Pasaporte'} · {item.documentId}
                      </AppText>
                      <AppText muted style={styles.subMeta}>
                        Tel: {item.phone || 'Sin número'} · {item.country || 'Ecuador'}
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.actions}>
                    <Pressable style={styles.actionBtn} onPress={() => dialPhone(item.phone)}>
                      <Ionicons name="call" size={15} color={colors.purple} />
                      <AppText style={styles.actionLabel}>Llamar</AppText>
                    </Pressable>

                    <Pressable
                      style={[styles.actionBtn, { backgroundColor: '#E8F8EE' }]}
                      onPress={() => openWhatsApp(item.phone)}
                    >
                      <Ionicons name="logo-whatsapp" size={15} color="#1EAA52" />
                      <AppText style={[styles.actionLabel, { color: '#166534' }]}>WhatsApp</AppText>
                    </Pressable>

                    <Pressable
                      style={[styles.actionBtn, styles.actionBtnGold]}
                      onPress={() => nav.navigate('AdminUserDetail', { userId: item.id })}
                    >
                      <Ionicons name="sparkles" size={15} color={colors.purpleDark} />
                      <AppText style={[styles.actionLabel, { color: colors.purpleDark, fontFamily: fonts.sansBold }]}>
                        Ficha
                      </AppText>
                    </Pressable>
                  </View>
                </Pressable>
              );
            }}
          />
        )}
      </View>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.text,
  },
  list: { paddingBottom: spacing.xxl, gap: spacing.sm },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#EFEAE2',
    ...shadows.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.sansBold,
    fontSize: 16,
    color: colors.purple,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  userName: {
    fontFamily: fonts.serifSemi,
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  meta: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: fonts.sansMedium,
  },
  subMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  moodText: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: radius.md,
    backgroundColor: colors.purpleSoft,
  },
  actionBtnGold: {
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.3)',
  },
  actionLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    color: colors.purple,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
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
});
