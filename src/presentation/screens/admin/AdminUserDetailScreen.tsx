import { useCallback, useState } from 'react';

import {

  ActivityIndicator,

  Alert,

  Linking,

  Modal,

  Pressable,

  ScrollView,

  StyleSheet,

  View,

} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

import { ScreenShell } from '../../templates/ScreenShell';

import { AppHeader } from '../../organisms/AppHeader';

import { AppText } from '../../atoms/AppText';

import { AppButton } from '../../atoms/AppButton';

import { FormField } from '../../molecules/FormField';

import { Spacer } from '../../atoms/Spacer';

import { formatDateDisplay } from '../../../shared/utils/dateFormat';

import { container } from '../../../composition/container';

import type { AdminUserRow } from '../../../infrastructure/adapters/admin/ApiAdminAdapter';

import type { VerseHighlightRow } from '../../../infrastructure/adapters/admin/ApiAdminAdapter';

import type { MoodLog } from '../../../domain/entities/MoodLog';

import type { ChatMessage } from '../../../domain/entities/ChatMessage';

import { colors, fonts, radius, spacing } from '../../theme';



/** Detalle de joven + resumen pastoral IA + gestión CRUD */

export function AdminUserDetailScreen() {

  const nav = useNavigation<any>();

  const route = useRoute<any>();

  const userId = route.params.userId as string;



  const [user, setUser] = useState<AdminUserRow | null>(null);

  const [moods, setMoods] = useState<MoodLog[]>([]);

  const [chat, setChat] = useState<ChatMessage[]>([]);

  const [highlights, setHighlights] = useState<VerseHighlightRow[]>([]);

  const [summary, setSummary] = useState('');

  const [loading, setLoading] = useState(true);

  const [summarizing, setSummarizing] = useState(false);

  const [tab, setTab] = useState<'moods' | 'chat' | 'highlights'>('moods');

  const [resetVisible, setResetVisible] = useState(false);

  const [newPassword, setNewPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [resetting, setResetting] = useState(false);



  const load = useCallback(async () => {

    setLoading(true);

    try {

      const [u, m, c, h] = await Promise.all([

        container.admin.getUser(userId),

        container.admin.getUserMoods(userId),

        container.admin.getUserChat(userId),

        container.admin.getUserHighlights(userId),

      ]);

      setUser(u);

      setMoods(m);

      setChat(

        c.map((msg) => ({

          ...msg,

          createdAt: typeof msg.createdAt === 'string' ? Date.parse(msg.createdAt) : msg.createdAt,

        })),

      );

      setHighlights(h);

    } catch {

      /* conservar el detalle ya mostrado */

    } finally {

      setLoading(false);

    }

  }, [userId]);



  useFocusEffect(

    useCallback(() => {

      load();

    }, [load]),

  );



  const generateSummary = async () => {

    setSummarizing(true);

    try {

      const result = await container.admin.generateSummary(userId);

      setSummary(result.summary);

    } catch {

      setSummary('No se pudo generar el resumen. Intenta más tarde.');

    } finally {

      setSummarizing(false);

    }

  };



  const deleteMood = (mood: MoodLog) => {

    if (!mood.id) return;

    Alert.alert('Eliminar ánimo', `¿Borrar registro del ${mood.date}?`, [

      { text: 'Cancelar', style: 'cancel' },

      {

        text: 'Eliminar',

        style: 'destructive',

        onPress: async () => {

          await container.admin.deleteMood(userId, mood.id!);

          load();

        },

      },

    ]);

  };



  const deleteMessage = (message: ChatMessage) => {

    Alert.alert('Eliminar mensaje', '¿Borrar este mensaje del chat?', [

      { text: 'Cancelar', style: 'cancel' },

      {

        text: 'Eliminar',

        style: 'destructive',

        onPress: async () => {

          await container.admin.deleteChatMessage(userId, message.id);

          load();

        },

      },

    ]);

  };



  const deleteHighlight = (highlight: VerseHighlightRow) => {

    Alert.alert('Eliminar subrayado', '¿Quitar este versículo marcado?', [

      { text: 'Cancelar', style: 'cancel' },

      {

        text: 'Eliminar',

        style: 'destructive',

        onPress: async () => {

          await container.admin.deleteHighlight(highlight.id);

          load();

        },

      },

    ]);

  };



  const openResetPassword = () => {

    setNewPassword('');

    setConfirmPassword('');

    setResetVisible(true);

  };



  const submitResetPassword = async () => {

    if (newPassword.length < 6) {

      Alert.alert('Contraseña débil', 'La nueva contraseña debe tener al menos 6 caracteres.');

      return;

    }

    if (newPassword !== confirmPassword) {

      Alert.alert('No coincide', 'Las contraseñas ingresadas no son iguales.');

      return;

    }

    Alert.alert(

      'Restablecer contraseña',

      `¿Confirmas la nueva contraseña para ${user?.name ?? 'este usuario'}?`,

      [

        { text: 'Cancelar', style: 'cancel' },

        {

          text: 'Confirmar',

          onPress: async () => {

            setResetting(true);

            try {

              await container.admin.updateUser(userId, { password: newPassword });

              setResetVisible(false);

              Alert.alert('Listo', 'La contraseña fue actualizada.');

            } catch {

              Alert.alert('Error', 'No se pudo restablecer la contraseña.');

            } finally {

              setResetting(false);

            }

          },

        },

      ],

    );

  };



  if (loading || !user) {

    return (

      <ScreenShell>

        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />

      </ScreenShell>

    );

  }



  return (

    <ScreenShell>

      <ScrollView showsVerticalScrollIndicator={false}>

        <AppHeader

          title={user.name}

          subtitle="Perfil pastoral"

          onBack={() => nav.goBack()}

          right={

            <Pressable onPress={() => nav.navigate('AdminUserForm', { userId })} hitSlop={12}>

              <Ionicons name="create-outline" size={22} color={colors.accent} />

            </Pressable>

          }

        />

        <View style={styles.card}>

          <AppText muted style={styles.row}>

            {user.documentType === 'CEDULA' ? 'Cédula' : 'Pasaporte'}: {user.documentId}

          </AppText>

          <AppText muted style={styles.row}>

            Teléfono: {user.phone}

          </AppText>

          <AppText muted style={styles.row}>

            País: {user.country}

          </AppText>

          <AppText muted style={styles.row}>

            Nacimiento: {formatDateDisplay(user.birthDate)}

          </AppText>

          <View style={styles.contactRow}>

            <Pressable

              style={styles.contactBtn}

              onPress={() => Linking.openURL(`tel:${user.phone.replace(/\s/g, '')}`)}

            >

              <Ionicons name="call" size={20} color={colors.accent} />

              <AppText style={styles.contactLabel}>Llamar</AppText>

            </Pressable>

            <Pressable

              style={styles.contactBtn}

              onPress={() =>

                Linking.openURL(`https://wa.me/${user.phone.replace(/\D/g, '')}`)

              }

            >

              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />

              <AppText style={styles.contactLabel}>WhatsApp</AppText>

            </Pressable>

          </View>

          <Pressable style={styles.resetBtn} onPress={openResetPassword}>

            <Ionicons name="key-outline" size={18} color={colors.accent} />

            <AppText style={styles.resetLabel}>Restablecer contraseña</AppText>

          </Pressable>

        </View>



        <Spacer size="md" />

        <View style={styles.tabs}>

          {(['moods', 'chat', 'highlights'] as const).map((key) => (

            <Pressable

              key={key}

              style={[styles.tab, tab === key && styles.tabActive]}

              onPress={() => setTab(key)}

            >

              <AppText style={[styles.tabLabel, tab === key && styles.tabLabelActive]}>

                {key === 'moods' ? 'Ánimos' : key === 'chat' ? 'Chat' : 'Subrayados'}

              </AppText>

            </Pressable>

          ))}

        </View>



        <View style={styles.list}>

          {tab === 'moods' ? (

            moods.length === 0 ? (

              <AppText muted style={styles.empty}>Sin registros aún</AppText>

            ) : (

              moods.map((m) => (

                <Pressable key={m.id ?? m.date} style={styles.listRow} onLongPress={() => deleteMood(m)}>

                  <View>

                    <AppText style={styles.moodDate}>{m.date}</AppText>

                    <AppText variant="subtitle">{m.mood}</AppText>

                  </View>

                  {m.id ? (

                    <Pressable onPress={() => deleteMood(m)} hitSlop={8}>

                      <Ionicons name="trash-outline" size={18} color={colors.danger} />

                    </Pressable>

                  ) : null}

                </Pressable>

              ))

            )

          ) : null}



          {tab === 'chat' ? (

            chat.length === 0 ? (

              <AppText muted style={styles.empty}>Sin mensajes aún</AppText>

            ) : (

              chat.map((msg) => (

                <Pressable key={msg.id} style={styles.listRow} onLongPress={() => deleteMessage(msg)}>

                  <View style={styles.chatBody}>

                    <AppText variant="caption" style={styles.chatRole}>

                      {msg.role === 'user' ? 'Joven' : 'Jesús'}

                    </AppText>

                    <AppText style={styles.chatText}>{msg.text}</AppText>

                  </View>

                  <Pressable onPress={() => deleteMessage(msg)} hitSlop={8}>

                    <Ionicons name="trash-outline" size={18} color={colors.danger} />

                  </Pressable>

                </Pressable>

              ))

            )

          ) : null}



          {tab === 'highlights' ? (

            highlights.length === 0 ? (

              <AppText muted style={styles.empty}>Sin subrayados aún</AppText>

            ) : (

              highlights.map((h) => (

                <Pressable key={h.id} style={styles.listRow} onLongPress={() => deleteHighlight(h)}>

                  <View style={[styles.highlightDot, { backgroundColor: h.color }]} />

                  <View style={styles.chatBody}>

                    <AppText variant="caption" style={styles.chatRole}>

                      {h.bookName} {h.chapter}:{h.verse}

                    </AppText>

                    <AppText style={styles.chatText} numberOfLines={2}>

                      {h.verseText ?? '—'}

                    </AppText>

                  </View>

                  <Pressable onPress={() => deleteHighlight(h)} hitSlop={8}>

                    <Ionicons name="trash-outline" size={18} color={colors.danger} />

                  </Pressable>

                </Pressable>

              ))

            )

          ) : null}

        </View>



        <Spacer size="md" />

        <AppButton
          label={summarizing ? 'Generando…' : 'Resumen pastoral'}
          onPress={generateSummary}
          disabled={summarizing}
        />
        {summary ? (
          <View style={styles.summaryBox}>
            <AppText variant="caption" style={styles.section}>
              Resumen pastoral
            </AppText>
            <AppText style={styles.summaryText}>{summary}</AppText>
          </View>
        ) : null}

        <Spacer size="xxl" />

      </ScrollView>

      <Modal visible={resetVisible} transparent animationType="fade" onRequestClose={() => setResetVisible(false)}>

        <View style={styles.modalBackdrop}>

          <View style={styles.modalCard}>

            <AppText variant="subtitle" style={styles.modalTitle}>

              Nueva contraseña

            </AppText>

            <AppText muted style={styles.modalHint}>

              El joven usará esta contraseña para iniciar sesión.

            </AppText>

            <FormField

              label="Contraseña nueva"

              kind="password"

              value={newPassword}

              onChangeText={setNewPassword}

              placeholder="Mín. 6 caracteres"

            />

            <FormField

              label="Confirmar contraseña"

              kind="password"

              value={confirmPassword}

              onChangeText={setConfirmPassword}

            />

            <Spacer size="md" />

            <AppButton

              label={resetting ? 'Guardando…' : 'Restablecer'}

              onPress={submitResetPassword}

              disabled={resetting}

            />

            <Spacer size="sm" />

            <AppButton

              label="Cancelar"

              variant="ghost"

              onPress={() => setResetVisible(false)}

              disabled={resetting}

            />

          </View>

        </View>

      </Modal>

    </ScreenShell>

  );

}



const styles = StyleSheet.create({

  card: {

    backgroundColor: colors.bgCard,

    borderRadius: radius.md,

    padding: spacing.md,

    borderWidth: 1,

    borderColor: colors.border,

  },

  row: {

    fontSize: 14,

    marginBottom: 6,

    textTransform: 'none',

    letterSpacing: 0,

  },

  contactRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },

  resetBtn: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 8,

    marginTop: spacing.md,

    paddingVertical: spacing.sm,

    borderRadius: radius.sm,

    backgroundColor: colors.accentSoft,

    borderWidth: 1,

    borderColor: colors.border,

  },

  resetLabel: {

    fontFamily: fonts.sansMedium,

    fontSize: 14,

    color: colors.accent,

    textTransform: 'none',

    letterSpacing: 0,

  },

  modalBackdrop: {

    flex: 1,

    backgroundColor: colors.overlay,

    justifyContent: 'center',

    padding: spacing.lg,

  },

  modalCard: {

    backgroundColor: colors.bgCard,

    borderRadius: radius.md,

    padding: spacing.lg,

    borderWidth: 1,

    borderColor: colors.border,

  },

  modalTitle: {

    textTransform: 'none',

    letterSpacing: 0,

  },

  modalHint: {

    marginTop: spacing.xs,

    marginBottom: spacing.md,

    fontSize: 13,

    textTransform: 'none',

    letterSpacing: 0,

  },

  contactBtn: {

    flex: 1,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 8,

    paddingVertical: spacing.sm,

    borderRadius: radius.sm,

    backgroundColor: colors.surface,

  },

  contactLabel: {

    fontFamily: fonts.sansSemi,

    fontSize: 14,

    color: colors.text,

    textTransform: 'none',

    letterSpacing: 0,

  },

  tabs: {

    flexDirection: 'row',

    gap: spacing.xs,

    marginBottom: spacing.sm,

  },

  tab: {

    flex: 1,

    paddingVertical: spacing.sm,

    borderRadius: radius.sm,

    backgroundColor: colors.surface,

    alignItems: 'center',

  },

  tabActive: { backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accent },

  tabLabel: {

    fontFamily: fonts.sansMedium,

    fontSize: 13,

    color: colors.textMuted,

    textTransform: 'none',

    letterSpacing: 0,

  },

  tabLabelActive: { color: colors.accent },

  list: {

    backgroundColor: colors.bgCard,

    borderRadius: radius.md,

    borderWidth: 1,

    borderColor: colors.border,

    overflow: 'hidden',

  },

  listRow: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: spacing.sm,

    padding: spacing.md,

    borderBottomWidth: 1,

    borderBottomColor: colors.border,

  },

  moodDate: {

    fontFamily: fonts.sans,

    fontSize: 13,

    color: colors.textMuted,

    textTransform: 'none',

    letterSpacing: 0,

  },

  chatBody: { flex: 1 },

  chatRole: { color: colors.accentWarm, marginBottom: 4 },

  chatText: {

    fontFamily: fonts.sans,

    fontSize: 14,

    color: colors.text,

    textTransform: 'none',

    letterSpacing: 0,

  },

  highlightDot: { width: 10, height: 10, borderRadius: 5 },

  empty: {

    padding: spacing.md,

    textTransform: 'none',

    letterSpacing: 0,

  },

  section: { color: colors.accentWarm, marginBottom: spacing.sm },

  summaryBox: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryText: {
    marginTop: spacing.xs,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
    textTransform: 'none',
    letterSpacing: 0,
  },

});

