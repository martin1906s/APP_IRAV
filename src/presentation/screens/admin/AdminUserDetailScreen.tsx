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
import { LinearGradient } from 'expo-linear-gradient';
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
import { colors, fonts, radius, spacing, shadows } from '../../theme';

const MOOD_COLOR: Record<string, { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }> = {
  Paz: { bg: '#EBF3FB', text: '#2A6F97', icon: 'leaf-outline' },
  Alegría: { bg: '#FFF9E6', text: '#B8860B', icon: 'sunny-outline' },
  Ansiedad: { bg: '#FFF4E5', text: '#D97706', icon: 'pulse-outline' },
  Tristeza: { bg: '#F1F5F9', text: '#475569', icon: 'rainy-outline' },
  Fuerza: { bg: '#F3E8FF', text: '#6B21A8', icon: 'shield-checkmark-outline' },
  Gratitud: { bg: '#E8F5E9', text: '#2E7D32', icon: 'heart-outline' },
};

function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

/** Detalle de joven + resumen pastoral IA + gestión CRUD moderna */
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
    Alert.alert('Eliminar registro', `¿Deseas borrar el ánimo del ${mood.date}?`, [
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
    Alert.alert('Eliminar mensaje', '¿Deseas eliminar este mensaje de la conversación?', [
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
    Alert.alert('Eliminar versículo', '¿Quitar este versículo subrayado de la lista?', [
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
              Alert.alert('Listo', 'La contraseña fue actualizada exitosamente.');
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
        <ActivityIndicator color={colors.purple} size="large" style={{ marginTop: spacing.xxl }} />
      </ScreenShell>
    );
  }

  const latestMood = moods[0]?.mood;
  const moodStyle = latestMood ? MOOD_COLOR[latestMood] : null;

  return (
    <ScreenShell>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <AppHeader
          title="Ficha Pastoral"
          subtitle="Seguimiento y Cuidado Integral"
          onBack={() => nav.goBack()}
          right={
            <Pressable
              style={styles.editIconBtn}
              onPress={() => nav.navigate('AdminUserForm', { userId })}
              hitSlop={10}
            >
              <Ionicons name="create-outline" size={20} color={colors.purple} />
            </Pressable>
          }
        />

        {/* HERO CARD DEL USUARIO CON GRADIENTE */}
        <LinearGradient
          colors={[colors.purpleDark, colors.purple, colors.purpleLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <View style={styles.avatarWrap}>
              <AppText style={styles.avatarText}>{getInitials(user.name)}</AppText>
            </View>
            <View style={styles.heroDetails}>
              <View style={styles.nameRow}>
                <AppText style={styles.heroName} numberOfLines={1}>
                  {user.name}
                </AppText>
                <View style={styles.roleBadge}>
                  <AppText style={styles.roleText}>{user.role || 'Joven'}</AppText>
                </View>
              </View>
              <AppText style={styles.heroDoc}>
                {user.documentType === 'CEDULA' ? 'Cédula' : 'Pasaporte'} · {user.documentId}
              </AppText>
              <View style={styles.heroMetaRow}>
                <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.75)" />
                <AppText style={styles.heroMetaText}>{user.country || 'Ecuador'}</AppText>
                <AppText style={styles.heroDot}>•</AppText>
                <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.75)" />
                <AppText style={styles.heroMetaText}>{formatDateDisplay(user.birthDate)}</AppText>
              </View>
            </View>
          </View>

          {/* Quick Metrics Bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <AppText style={styles.metricValue}>{moods.length}</AppText>
              <AppText style={styles.metricLabel}>Ánimos</AppText>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <AppText style={styles.metricValue}>{chat.length}</AppText>
              <AppText style={styles.metricLabel}>Mensajes</AppText>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <AppText style={styles.metricValue}>{highlights.length}</AppText>
              <AppText style={styles.metricLabel}>Subrayados</AppText>
            </View>
            {latestMood ? (
              <>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <View style={styles.moodPillSmall}>
                    <AppText style={styles.moodPillText}>{latestMood}</AppText>
                  </View>
                  <AppText style={styles.metricLabel}>Último</AppText>
                </View>
              </>
            ) : null}
          </View>

          {/* Botones de acción rápida */}
          <View style={styles.heroActions}>
            <Pressable
              style={styles.heroActionBtn}
              onPress={() => Linking.openURL(`tel:${user.phone.replace(/\s/g, '')}`)}
            >
              <Ionicons name="call" size={16} color={colors.purple} />
              <AppText style={styles.heroActionText}>Llamar</AppText>
            </Pressable>

            <Pressable
              style={[styles.heroActionBtn, { backgroundColor: '#E8F8EE' }]}
              onPress={() => Linking.openURL(`https://wa.me/${user.phone.replace(/\D/g, '')}`)}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#1EAA52" />
              <AppText style={[styles.heroActionText, { color: '#166534' }]}>WhatsApp</AppText>
            </Pressable>

            <Pressable style={styles.heroActionBtnSecondary} onPress={openResetPassword}>
              <Ionicons name="key-outline" size={16} color="#FFFFFF" />
              <AppText style={styles.heroActionTextSecondary}>Contraseña</AppText>
            </Pressable>
          </View>
        </LinearGradient>

        {/* TARJETA DE RESUMEN PASTORAL CON IA */}
        <View style={styles.aiCard}>
          <View style={styles.aiCardHeader}>
            <View style={styles.aiIconBadge}>
              <Ionicons name="sparkles" size={18} color={colors.goldWarm} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="subtitle" style={styles.aiTitle}>
                Resumen Pastoral Inteligente
              </AppText>
              <AppText muted style={styles.aiSubtitle}>
                Diagnóstico y acompañamiento generado por IA
              </AppText>
            </View>
          </View>

          {summary ? (
            <View style={styles.aiSummaryContent}>
              <AppText style={styles.aiText}>{summary}</AppText>
              <Pressable
                style={styles.regenerateBtn}
                onPress={generateSummary}
                disabled={summarizing}
              >
                <Ionicons name="refresh-outline" size={14} color={colors.purple} />
                <AppText style={styles.regenerateText}>
                  {summarizing ? 'Actualizando…' : 'Regenerar análisis'}
                </AppText>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.generateCta}
              onPress={generateSummary}
              disabled={summarizing}
            >
              {summarizing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="flash-outline" size={16} color="#FFFFFF" />
                  <AppText style={styles.generateCtaText}>Generar Resumen Pastoral</AppText>
                </>
              )}
            </Pressable>
          )}
        </View>

        {/* TABS DE ACTIVIDAD */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tabButton, tab === 'moods' && styles.tabButtonActive]}
            onPress={() => setTab('moods')}
          >
            <Ionicons
              name="happy-outline"
              size={18}
              color={tab === 'moods' ? colors.purple : colors.textMuted}
            />
            <AppText style={[styles.tabText, tab === 'moods' && styles.tabTextActive]}>
              Ánimos ({moods.length})
            </AppText>
          </Pressable>

          <Pressable
            style={[styles.tabButton, tab === 'chat' && styles.tabButtonActive]}
            onPress={() => setTab('chat')}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={18}
              color={tab === 'chat' ? colors.purple : colors.textMuted}
            />
            <AppText style={[styles.tabText, tab === 'chat' && styles.tabTextActive]}>
              Chat ({chat.length})
            </AppText>
          </Pressable>

          <Pressable
            style={[styles.tabButton, tab === 'highlights' && styles.tabButtonActive]}
            onPress={() => setTab('highlights')}
          >
            <Ionicons
              name="bookmark-outline"
              size={18}
              color={tab === 'highlights' ? colors.purple : colors.textMuted}
            />
            <AppText style={[styles.tabText, tab === 'highlights' && styles.tabTextActive]}>
              Biblia ({highlights.length})
            </AppText>
          </Pressable>
        </View>

        {/* LISTADO DE ITEMS DEL TAB SELECCIONADO */}
        <View style={styles.contentSection}>
          {tab === 'moods' && (
            moods.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="sunny-outline" size={44} color={colors.textMuted} />
                <AppText style={styles.emptyTitle}>Sin registros de ánimo</AppText>
                <AppText muted style={styles.emptySubtitle}>
                  El joven aún no ha registrado cómo se siente en su devocional.
                </AppText>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {moods.map((m) => {
                  const mConfig = MOOD_COLOR[m.mood] ?? {
                    bg: colors.vellumDark,
                    text: colors.text,
                    icon: 'ellipse-outline',
                  };
                  return (
                    <View key={m.id ?? m.date} style={styles.moodItem}>
                      <View style={[styles.moodIconWrap, { backgroundColor: mConfig.bg }]}>
                        <Ionicons name={mConfig.icon} size={20} color={mConfig.text} />
                      </View>
                      <View style={styles.itemBody}>
                        <AppText variant="subtitle" style={{ color: mConfig.text }}>
                          {m.mood}
                        </AppText>
                        <AppText muted style={styles.itemDate}>
                          Fecha: {m.date}
                        </AppText>
                      </View>
                      {m.id && (
                        <Pressable
                          style={styles.deleteIconButton}
                          onPress={() => deleteMood(m)}
                          hitSlop={8}
                        >
                          <Ionicons name="trash-outline" size={17} color={colors.danger} />
                        </Pressable>
                      )}
                    </View>
                  );
                })}
              </View>
            )
          )}

          {tab === 'chat' && (
            chat.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="chatbubbles-outline" size={44} color={colors.textMuted} />
                <AppText style={styles.emptyTitle}>Sin mensajes registrados</AppText>
                <AppText muted style={styles.emptySubtitle}>
                  No hay conversaciones recientes en &quot;Hablar con Jesús&quot;.
                </AppText>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {chat.map((msg) => (
                  <View key={msg.id} style={styles.chatItem}>
                    <View
                      style={[
                        styles.chatAvatar,
                        { backgroundColor: msg.role === 'user' ? colors.purpleSoft : '#FFF8E1' },
                      ]}
                    >
                      <Ionicons
                        name={msg.role === 'user' ? 'person' : 'sparkles'}
                        size={16}
                        color={msg.role === 'user' ? colors.purple : colors.goldDark}
                      />
                    </View>
                    <View style={styles.itemBody}>
                      <View style={styles.chatHeaderRow}>
                        <AppText
                          variant="caption"
                          style={[
                            styles.chatAuthor,
                            { color: msg.role === 'user' ? colors.purple : colors.goldDark },
                          ]}
                        >
                          {msg.role === 'user' ? user.name : 'Jesús'}
                        </AppText>
                        <AppText muted style={styles.chatTime}>
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </AppText>
                      </View>
                      <AppText style={styles.chatBubbleText}>{msg.text}</AppText>
                    </View>
                    <Pressable
                      style={styles.deleteIconButton}
                      onPress={() => deleteMessage(msg)}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={17} color={colors.danger} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )
          )}

          {tab === 'highlights' && (
            highlights.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="book-outline" size={44} color={colors.textMuted} />
                <AppText style={styles.emptyTitle}>Sin versículos marcados</AppText>
                <AppText muted style={styles.emptySubtitle}>
                  El joven no ha subrayado porciones de la Biblia aún.
                </AppText>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {highlights.map((h) => (
                  <View key={h.id} style={styles.highlightItem}>
                    <View style={[styles.highlightTag, { backgroundColor: h.color || colors.gold }]}>
                      <Ionicons name="bookmark" size={14} color="#36454F" />
                    </View>
                    <View style={styles.itemBody}>
                      <AppText variant="subtitle" style={styles.highlightRef}>
                        {h.bookName} {h.chapter}:{h.verse}
                      </AppText>
                      <AppText style={styles.highlightQuote} numberOfLines={3}>
                        &quot;{h.verseText ?? 'Texto bíblico marcado'}&quot;
                      </AppText>
                    </View>
                    <Pressable
                      style={styles.deleteIconButton}
                      onPress={() => deleteHighlight(h)}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={17} color={colors.danger} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )
          )}
        </View>

        <Spacer size="xxl" />
      </ScrollView>

      {/* MODAL PARA RESTABLECER CONTRASEÑA */}
      <Modal
        visible={resetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResetVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="key" size={24} color={colors.purple} />
            </View>
            <AppText variant="subtitle" style={styles.modalTitle}>
              Restablecer Contraseña
            </AppText>
            <AppText muted style={styles.modalHint}>
              Ingresa la nueva clave con la que {user.name} accederá a la aplicación.
            </AppText>

            <FormField
              label="Nueva contraseña"
              kind="password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Mínimo 6 caracteres"
            />
            <Spacer size="sm" />
            <FormField
              label="Confirmar contraseña"
              kind="password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repite la contraseña"
            />

            <Spacer size="md" />
            <AppButton
              label={resetting ? 'Guardando…' : 'Actualizar contraseña'}
              onPress={submitResetPassword}
              disabled={resetting}
            />
            <Spacer size="xs" />
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
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  editIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...shadows.button,
  },
  avatarText: {
    fontFamily: fonts.sansBold,
    fontSize: 20,
    color: colors.purpleDark,
  },
  heroDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroName: {
    fontFamily: fonts.serifBold,
    fontSize: 18,
    color: '#FFFFFF',
    flexShrink: 1,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  roleText: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    color: '#FFFFFF',
  },
  heroDoc: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    marginTop: 2,
    fontFamily: fonts.sansMedium,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  heroMetaText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: fonts.sans,
  },
  heroDot: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginHorizontal: 2,
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.md,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontFamily: fonts.sansBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  metricLabel: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  moodPillSmall: {
    backgroundColor: colors.gold,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
  },
  moodPillText: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: colors.purpleDark,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  heroActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: radius.md,
    ...shadows.subtle,
  },
  heroActionText: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.purple,
  },
  heroActionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroActionTextSecondary: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: '#FFFFFF',
  },
  aiCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#EFEAE2',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  aiIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    fontFamily: fonts.serifSemi,
    fontSize: 15,
    color: colors.text,
  },
  aiSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  aiSummaryContent: {
    marginTop: spacing.sm,
    backgroundColor: colors.vellum,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.purple,
  },
  aiText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    color: colors.text,
  },
  regenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
    marginTop: spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  regenerateText: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    color: colors.purple,
  },
  generateCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.purple,
    borderRadius: radius.md,
    paddingVertical: 12,
    marginTop: spacing.sm,
  },
  generateCtaText: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.vellumDark,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.md,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  tabButtonActive: {
    backgroundColor: colors.bgElevated,
    ...shadows.subtle,
  },
  tabText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.textMuted,
  },
  tabTextActive: {
    fontFamily: fonts.sansBold,
    color: colors.purple,
  },
  contentSection: {
    minHeight: 180,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
    paddingHorizontal: spacing.lg,
  },
  listContainer: {
    gap: spacing.sm,
  },
  moodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  moodIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  itemBody: {
    flex: 1,
  },
  itemDate: {
    fontSize: 12,
    marginTop: 2,
  },
  deleteIconButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  chatAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatAuthor: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
  },
  chatTime: {
    fontSize: 11,
  },
  chatBubbleText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.text,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  highlightTag: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  highlightRef: {
    fontFamily: fonts.serifSemi,
    fontSize: 14,
    color: colors.purple,
    marginBottom: 2,
  },
  highlightQuote: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.xl,
    ...shadows.card,
  },
  modalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  modalTitle: {
    textAlign: 'center',
    fontFamily: fonts.serifBold,
    fontSize: 18,
  },
  modalHint: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
});
