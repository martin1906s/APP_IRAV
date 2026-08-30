import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
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
import type { AdminUserRow } from '../../../infrastructure/adapters/admin/ApiAdminAdapter';
import { colors, fonts, radius, spacing } from '../../theme';

const MOOD_COLOR: Record<string, string> = {
  Paz: colors.mint,
  Alegría: colors.gold,
  Ansiedad: colors.sky,
  Tristeza: colors.coral,
  Fuerza: colors.accent,
  Gratitud: colors.pink,
};

function dialPhone(phone: string) {
  Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
}

function openWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, '');
  Linking.openURL(`https://wa.me/${digits}`);
}

/** Panel admin: listado de jóvenes */
export function AdminUsersScreen() {
  const nav = useNavigation<any>();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const hasDataRef = useRef(false);

  const load = useCallback(async () => {
    const silent = hasDataRef.current;
    if (!silent) setLoading(true);
    try {
      setUsers(await container.admin.listUsers());
      hasDataRef.current = true;
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
      <AppHeader
        title="Jóvenes"
        subtitle="Tu comunidad IRAV"
        right={
          <Pressable
            style={styles.addBtn}
            onPress={() => nav.navigate('AdminUserForm')}
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
          data={users.filter((u) => u.role !== 'ADMIN')}
          keyExtractor={(u) => u.id!}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => nav.navigate('AdminUserDetail', { userId: item.id })}
            >
              <View style={styles.cardTop}>
                <View>
                  <AppText variant="subtitle">{item.name}</AppText>
                  <AppText muted style={styles.meta}>
                    {item.documentType === 'CEDULA' ? 'Cédula' : 'Pasaporte'} · {item.documentId}
                  </AppText>
                </View>
                {item.lastMood ? (
                  <View
                    style={[
                      styles.moodPill,
                      { borderColor: MOOD_COLOR[item.lastMood.mood] ?? colors.border },
                    ]}
                  >
                    <AppText
                      style={[styles.moodText, { color: MOOD_COLOR[item.lastMood.mood] }]}
                    >
                      {item.lastMood.mood}
                    </AppText>
                  </View>
                ) : null}
              </View>
              <View style={styles.actions}>
                <Pressable style={styles.actionBtn} onPress={() => dialPhone(item.phone)}>
                  <Ionicons name="call" size={18} color={colors.accent} />
                  <AppText style={styles.actionLabel}>Llamar</AppText>
                </Pressable>
                <Pressable style={styles.actionBtn} onPress={() => openWhatsApp(item.phone)}>
                  <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                  <AppText style={styles.actionLabel}>WhatsApp</AppText>
                </Pressable>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => nav.navigate('AdminUserDetail', { userId: item.id })}
                >
                  <Ionicons name="analytics-outline" size={18} color={colors.accentWarm} />
                  <AppText style={styles.actionLabel}>Ver más</AppText>
                </Pressable>
              </View>
            </Pressable>
          )}
        />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingBottom: spacing.xxl, gap: spacing.md },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  meta: {
    marginTop: 4,
    fontSize: 13,
    textTransform: 'none',
    letterSpacing: 0,
  },
  moodPill: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  moodText: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    textTransform: 'none',
    letterSpacing: 0,
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
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  actionLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.text,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
