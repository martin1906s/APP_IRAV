import { useCallback, useState, useRef } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '../atoms/AppText';
import { AppButton } from '../atoms/AppButton';
import { Spacer } from '../atoms/Spacer';
import { container } from '../../composition/container';
import type {
  ChallengeCategory,
  ChallengeStatus,
} from '../../domain/entities/Challenge';
import { syncChallengeReminders } from '../../infrastructure/adapters/challenges/ChallengeNotifications';
import { getStoredUser } from '../../infrastructure/api/authStore';
import { colors, fonts, radius, spacing, shadows } from '../theme';

const { width } = Dimensions.get('window');

const CATEGORY_META: Record<ChallengeCategory, { emoji: string; color: string }> = {
  oración: { emoji: '🙏', color: '#D4AF37' },
  alabanza: { emoji: '🎵', color: '#D4AF37' },
  lectura: { emoji: '📖', color: '#D4AF37' },
  servicio: { emoji: '🤝', color: '#D4AF37' },
  gratitud: { emoji: '💛', color: '#D4AF37' },
  silencio: { emoji: '🤫', color: '#D4AF37' },
};

async function syncRemindersFromStatus(status: ChallengeStatus) {
  const profile = await getStoredUser();
  await syncChallengeReminders({
    enrolled: status.enrolled,
    hasChallengeToday: status.hasChallengeToday,
    todayCompleted: status.todayCompleted,
    notificationsEnabled: profile?.notificationsEnabled ?? true,
  });
}

// Configuración del Bottom Sheet
const SHEET_HEIGHT = 480;
const SHEET_VISIBLE_COLLAPSED = 130;
const SLIDE_DISTANCE = SHEET_HEIGHT - SHEET_VISIBLE_COLLAPSED;

export function ChallengeScreen({ navigation }: any) {
  const [status, setStatus] = useState<ChallengeStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [viewingYesterday, setViewingYesterday] = useState(false);

  // Estados para Reflexión Semanal con IA
  const [reflectionModalVisible, setReflectionModalVisible] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [generatingReflection, setGeneratingReflection] = useState(false);

  // Animación del Bottom Sheet
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isCollapsed = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 15;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          Animated.spring(slideAnim, {
            toValue: SLIDE_DISTANCE,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
          isCollapsed.current = true;
        } else if (gestureState.dy < -50) {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
          isCollapsed.current = false;
        } else {
          Animated.spring(slideAnim, {
            toValue: isCollapsed.current ? SLIDE_DISTANCE : 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  const load = useCallback(async () => {
    try {
      const data = await container.challenges.getStatus();
      setStatus(data);
      setError('');
      await syncRemindersFromStatus(data);
    } catch {
      setError('No pudimos cargar el reto. Intenta de nuevo.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const complete = async () => {
    if (viewingYesterday) {
      Alert.alert('Info', 'Solo puedes marcar como completado el reto del día actual.');
      return;
    }
    setBusy(true);
    try {
      const data = await container.challenges.completeToday();
      setStatus(data);
      await syncRemindersFromStatus(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo marcar como completado.';
      Alert.alert('Error', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleReflexion = async () => {
    setReflectionModalVisible(true);
    if (!reflectionText) {
      setGeneratingReflection(true);
      try {
        const text = await (container.challenges as any).getWeeklyReflection();
        setReflectionText(text);
      } catch {
        setReflectionText(
          '¡Dios valora cada paso de tu fe! Has perseverado con corazón sincero durante esta semana. Recuerda: "El Señor es mi fuerza y mi escudo; en él confió mi corazón y fui ayudado" (Salmo 28:7). ¡Sigue adelante!'
        );
      } finally {
        setGeneratingReflection(false);
      }
    }
  };

  const regenerateReflection = async () => {
    setGeneratingReflection(true);
    try {
      const text = await (container.challenges as any).getWeeklyReflection();
      setReflectionText(text);
    } catch {
      // conservar texto
    } finally {
      setGeneratingReflection(false);
    }
  };

  const activeChallenge = viewingYesterday && status
    ? status.catalog.find((c) => c.day === status.calendarDay - 1)
    : status?.todayChallenge;

  const isCompleted = viewingYesterday && status
    ? status.completedDays?.includes(status.calendarDay - 1)
    : status?.todayCompleted;

  return (
    <View style={styles.container}>
      {/* Capa de fondo absoluto */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Image
          source={require('../../../assets/images/green_bg.jpg')}
          style={{ width: '100%', height: '100%' }}
          resizeMode="stretch"
        />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />
      </View>

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <AppText variant="title" style={styles.headerTitle}>
          Reto de 30 Días
        </AppText>
      </View>

      {/* MAPA 3D SCROLLEABLE INDEPENDIENTE */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.mapContainer}>
          {status &&
            [...status.catalog].reverse().map((item, index) => {
              const state = status.dayStates?.[item.day] ?? 'locked';

              // Curva matemática
              const frequency = 0.5;
              const amplitude = width * 0.35;
              const offsetX = Math.sin(index * frequency) * amplitude;

              const isToday = state === 'today';
              const isDone = state === 'completed';
              const isMissed = state === 'missed';
              const isLocked = state === 'locked';

              /**
               * REGLA SOLICITADA POR EL USUARIO:
               * - Si se completa un reto: se marca de AMARILLO/DORADO.
               * - Si no se completa (missed): se marca de ROJO VIVO.
               * - Hoy pendiente: Dorado brillante.
               * - Bloqueado a futuro: Gris oscuro.
               */
              const gradientColors = isDone
                ? ['#FFD700', '#F5C518'] // Amarillo / Oro brillante
                : isMissed
                  ? ['#EF4444', '#B91C1C'] // Rojo vivo si no se completó
                  : isToday
                    ? ['#FFF085', '#EAB308'] // Hoy por completar: Amarillo cálido
                    : ['#3A3C44', '#1E1F24']; // Futuro bloqueado: Gris

              const borderColor = isDone
                ? '#FFE875'
                : isMissed
                  ? '#FCA5A5'
                  : isToday
                    ? '#FFFFFF'
                    : '#4A4D57';

              const textColor = isDone || isToday ? '#36454F' : isMissed ? '#FFFFFF' : '#888888';
              const iconColor = isLocked ? '#666666' : isMissed ? '#FFFFFF' : '#36454F';
              const shadowGlow = isDone ? '#FFD700' : isMissed ? '#EF4444' : isToday ? '#EAB308' : 'transparent';
              const shadowOpacity = isLocked ? 0 : 0.85;

              // Color del grosor / relieve 3D lateral del bloque
              const thicknessColor = isDone
                ? '#C69200' // Grosor amarillo/dorado profundo
                : isMissed
                  ? '#7F1D1D' // Grosor rojo oscuro
                  : isToday
                    ? '#A16207'
                    : '#111216';

              return (
                <View
                  key={item.day}
                  style={[
                    styles.nodeWrapper,
                    { transform: [{ translateX: offsetX }] },
                  ]}
                >
                  {/* Sombra de Levitación en el suelo */}
                  <View style={styles.stoneDropShadow} />

                  {/* Bloque 3D */}
                  <View style={styles.stone3DContainer}>
                    {/* Pared Lateral / Grosor (Base) */}
                    <View style={[styles.stoneBase, { backgroundColor: thicknessColor }]} />

                    {/* Cara Superior */}
                    <View
                      style={[
                        styles.stoneTopFace,
                        {
                          borderColor,
                          shadowColor: shadowGlow,
                          shadowOpacity,
                        },
                      ]}
                    >
                      <LinearGradient colors={gradientColors} style={styles.stoneInner}>
                        {item.day === 30 ? (
                          <Ionicons name="star" size={30} color={iconColor} />
                        ) : (
                          <AppText
                            style={[
                              styles.stoneText,
                              { color: textColor },
                              (isToday || isDone) && { fontFamily: fonts.sansBold },
                            ]}
                          >
                            {item.day}
                          </AppText>
                        )}
                      </LinearGradient>
                    </View>
                  </View>

                  {/* Avatar de Jesús encima del día actual */}
                  {isToday && (
                    <Image
                      source={require('../../../assets/images/jesusHappy.png')}
                      style={styles.avatarFloat}
                      resizeMode="contain"
                    />
                  )}
                </View>
              );
            })}
        </View>
      </ScrollView>

      {/* SECCIÓN DE LA TARJETA (BOTTOM SHEET ANIMADO Y FLOTANTE) */}
      <Animated.View
        style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Zona táctil para arrastrar */}
        <View {...panResponder.panHandlers} style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        <View style={styles.contentContainer}>
          {error && !status ? (
            <View style={{ padding: spacing.xl }}>
              <AppText muted>{error}</AppText>
              <Spacer />
              <AppButton label="Reintentar" onPress={() => void load()} />
            </View>
          ) : !status ? (
            <View style={{ padding: spacing.xl }}>
              <AppText muted>Cargando reto…</AppText>
            </View>
          ) : (
            <>
              {/* Tarjeta del Reto */}
              <View style={styles.todayCard}>
                <View style={styles.overlapBadge}>
                  <View
                    style={[
                      styles.overlapBadgeInner,
                      isCompleted && styles.overlapBadgeCompleted,
                    ]}
                  >
                    <Ionicons
                      name="checkmark-sharp"
                      size={24}
                      color={isCompleted ? '#fff' : '#D4AF37'}
                    />
                  </View>
                </View>

                {!activeChallenge ? (
                  <View style={{ alignItems: 'center', marginTop: spacing.xs }}>
                    <AppText variant="subtitle">Sin reto disponible</AppText>
                  </View>
                ) : (
                  <>
                    <AppText variant="title" style={styles.todayTitle}>
                      Día {activeChallenge.day}: {activeChallenge.title}
                    </AppText>
                    <AppText muted style={styles.todayDesc}>
                      {activeChallenge.description}
                    </AppText>

                    <Spacer size="md" />

                    {isCompleted ? (
                      <View style={styles.doneBtnPlaceholder}>
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <AppText variant="subtitle" style={{ color: '#fff' }}>
                          ¡Reto Completado! (Amarillo)
                        </AppText>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.goldButton,
                          viewingYesterday && { backgroundColor: '#ccc', shadowOpacity: 0 },
                        ]}
                        onPress={() => void complete()}
                        disabled={busy || viewingYesterday}
                      >
                        <AppText
                          variant="subtitle"
                          style={[
                            styles.goldButtonText,
                            viewingYesterday && { color: '#666' },
                          ]}
                        >
                          {busy
                            ? 'Completando...'
                            : viewingYesterday
                              ? 'Día no completado (Rojo)'
                              : 'Completar reto de hoy'}
                        </AppText>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>

              <Spacer size="md" />

              {/* Menú inferior */}
              {status.calendarDay > 1 && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => setViewingYesterday(!viewingYesterday)}
                >
                  <AppText variant="subtitle">
                    {viewingYesterday ? 'Volver al reto de hoy' : 'Ver Día Anterior'}
                  </AppText>
                  <Ionicons
                    name={viewingYesterday ? 'refresh' : 'chevron-forward'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              )}

              {/* BOTÓN DE REFLEXIÓN SEMANAL CON IA */}
              <TouchableOpacity style={styles.menuItem} onPress={handleReflexion}>
                <View style={styles.reflectionIconWrap}>
                  <Ionicons name="sparkles" size={18} color={colors.goldWarm} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <AppText variant="subtitle" style={{ color: colors.purpleDark }}>
                    Reflexión Semanal con IA
                  </AppText>
                  <AppText muted style={{ marginTop: 2, fontSize: 12 }}>
                    Resumen pastoral inteligente de tu semana de fe.
                  </AppText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.purple} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </Animated.View>

      {/* MODAL DE REFLEXIÓN SEMANAL INTELIGENTE */}
      <Modal
        visible={reflectionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReflectionModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalBadge}>
                <Ionicons name="sparkles" size={18} color={colors.goldWarm} />
                <AppText style={styles.modalBadgeText}>IA Pastoral IRAV</AppText>
              </View>
              <TouchableOpacity onPress={() => setReflectionModalVisible(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <AppText variant="title" style={styles.modalTitle}>
              Tu Reflexión Semanal
            </AppText>
            <AppText muted style={styles.modalSubtitle}>
              Basado en tus retos cumplidos y tu constancia en la semana
            </AppText>

            <View style={styles.reflectionBody}>
              {generatingReflection ? (
                <View style={styles.reflectionLoading}>
                  <ActivityIndicator size="large" color={colors.purple} />
                  <AppText style={styles.reflectionLoadingText}>
                    Jesús y la IA están preparando tu mensaje pastoral…
                  </AppText>
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 220 }}>
                  <AppText style={styles.reflectionQuote}>
                    &quot;{reflectionText}&quot;
                  </AppText>
                </ScrollView>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.regenerateBtn}
                onPress={regenerateReflection}
                disabled={generatingReflection}
              >
                <Ionicons name="refresh" size={16} color={colors.purple} />
                <AppText style={styles.regenerateBtnText}>Actualizar</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setReflectionModalVisible(false)}
              >
                <AppText style={styles.modalCloseBtnText}>Entendido</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3E3F46',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: '#FDF1D6',
    fontSize: 22,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scrollContent: {
    paddingBottom: 250,
  },
  mapContainer: {
    paddingVertical: 30,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  nodeWrapper: {
    alignItems: 'center',
    marginVertical: 12,
    position: 'relative',
    width: 90,
    height: 75,
    justifyContent: 'center',
  },
  stoneDropShadow: {
    position: 'absolute',
    top: 55,
    width: 70,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    transform: [
      { scaleY: 0.4 },
      { perspective: 400 },
      { rotateX: '60deg' },
    ],
    shadowColor: '#000',
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 15 },
  },
  stone3DContainer: {
    width: 72,
    height: 60,
    transform: [
      { perspective: 400 },
      { rotateX: '45deg' },
    ],
  },
  stoneBase: {
    position: 'absolute',
    top: 10,
    left: 0,
    width: 72,
    height: 60,
    borderRadius: 16,
  },
  stoneTopFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 72,
    height: 60,
    borderRadius: 16,
    borderWidth: 2,
    shadowRadius: 18,
    elevation: 10,
    backgroundColor: '#2A2C34',
  },
  stoneInner: {
    flex: 1,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stoneText: {
    color: '#fff',
    fontSize: 22,
    fontFamily: fonts.sans,
    transform: [{ rotateX: '-15deg' }],
  },
  avatarFloat: {
    position: 'absolute',
    top: -55,
    left: -5,
    width: 100,
    height: 100,
    zIndex: 100,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: '#F7F7F7',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 25,
    zIndex: 100,
  },
  dragHandleContainer: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragHandle: {
    width: 50,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D1D1',
  },
  contentContainer: {
    paddingHorizontal: 20,
    flex: 1,
  },
  todayCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
  },
  overlapBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overlapBadgeInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDF1D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlapBadgeCompleted: {
    backgroundColor: '#FFD700',
  },
  todayTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 5,
  },
  todayDesc: {
    textAlign: 'center',
    fontSize: 14,
  },
  goldButton: {
    backgroundColor: '#D4AF37',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  goldButtonText: {
    color: '#fff',
    fontSize: 17,
  },
  doneBtnPlaceholder: {
    flexDirection: 'row',
    backgroundColor: '#EAB308',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  reflectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF9E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadows.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  modalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.purpleSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  modalBadgeText: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: colors.purple,
  },
  modalTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 20,
    color: colors.text,
    marginTop: 6,
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  reflectionBody: {
    backgroundColor: colors.vellum,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.purple,
    minHeight: 120,
    justifyContent: 'center',
  },
  reflectionQuote: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  reflectionLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  reflectionLoadingText: {
    fontSize: 12,
    textAlign: 'center',
    color: colors.textMuted,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  regenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  regenerateBtnText: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.purple,
  },
  modalCloseBtn: {
    backgroundColor: colors.purple,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
  },
  modalCloseBtnText: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
