import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ChatMessage } from '../../domain/entities/ChatMessage';
import { container } from '../../composition/container';
import { getStoredUser, updateStoredUser } from '../../infrastructure/api/authStore';
import { AppHeader } from '../components/AppHeader';
import { ChatInputBar } from '../components/chat/ChatInputBar';
import { AppText } from '../atoms/AppText';
import { LogoMark } from '../molecules/LogoMark';
import { colors, fonts, radius, spacing } from '../theme';

const JESUS_IMG = require('../../../assets/images/jesusIndicando.png');
const BG_IMG = require('../../../assets/images/auth_bg.jpg');

function TypewriterBubble({
  text,
  isActive,
  isKeyboardVisible,
}: {
  text: string;
  isActive: boolean;
  isKeyboardVisible?: boolean;
}) {
  const [wordIndex, setWordIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const words = text.split(/(\s+)/);

  useEffect(() => {
    setWordIndex(0);
    if (!isActive || text === '...' || !text) return;

    let current = 0;
    // 220ms por palabra para sincronizar con la cadencia de voz
    const msPerWord = 220;
    const interval = setInterval(() => {
      current += 2; // saltar los espacios
      setWordIndex(current);
      if (current >= words.length) {
        clearInterval(interval);
      }
    }, msPerWord);

    return () => clearInterval(interval);
  }, [text, isActive]);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={{ maxHeight: isKeyboardVisible ? 110 : 200 }}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
    >
      <AppText style={styles.dialogueText}>
        {words.map((w, i) => (
          <AppText
            key={i}
            style={[
              styles.dialogueText,
              isActive && i === wordIndex && text !== '...'
                ? { color: colors.purple, fontFamily: fonts.sansBold }
                : null,
              !isActive || i <= wordIndex || text === '...' ? { opacity: 1 } : { opacity: 0 },
            ]}
          >
            {w}
          </AppText>
        ))}
      </AppText>
    </ScrollView>
  );
}

/** Pantalla de Chat con estilo Visual Novel */
export function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [userName, setUserName] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  // Guardamos todo el historial para mandarlo a la IA, pero solo mostramos el último
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Escuchar teclado para adaptar la pantalla dinámicamente
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Animación del globo de texto
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Extraer el último mensaje del asistente para mostrarlo en el globo
  const assistantMsg = messages.find((m) => m.role === 'assistant');
  const dialogueText = assistantMsg ? assistantMsg.text : '...';

  // Animar la burbuja cada vez que cambie el diálogo
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dialogueText, fadeAnim, slideAnim]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const local = await getStoredUser();
      if (!active) return;
      if (local) {
        container.ai.setProfile(local);
        setUserName(local.name);
        setVoiceEnabled(local.voiceEnabled ?? true);
      }

      if (active && local) {
        const welcomeText = `Hijo mío, estoy aquí para escucharte. ¿Qué hay en tu corazón?`;
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            text: welcomeText,
            createdAt: Date.now(),
          },
        ]);
        if (local.voiceEnabled !== false) {
          container.speech.speak(welcomeText);
        }
      }
    })();
    return () => {
      active = false;
      container.speech.stop();
    };
  }, []);

  const toggleVoice = async () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    if (!next) {
      await container.speech.stop();
    }
    try {
      const local = await getStoredUser();
      if (local) {
        const updated = { ...local, voiceEnabled: next };
        await updateStoredUser(updated);
        container.ai.setProfile(updated);
      }
    } catch {
      // Ignorar error de guardado local
    }
  };

  const push = (msg: ChatMessage) => {
    setMessages((prev) => [msg, ...prev]);
  };

  const sendText = async () => {
    const value = text.trim();
    if (!value || busy || recording) return;

    // Temporalmente mostramos que Jesús está escribiendo/pensando
    const userMsg: ChatMessage = { id: `${Date.now()}-u`, role: 'user', text: value, createdAt: Date.now() };
    push(userMsg);
    void container.chat.saveMessage(userMsg);
    push({ id: `${Date.now()}-typing`, role: 'assistant', text: '...', createdAt: Date.now() + 1 });

    setText('');
    setBusy(true);
    await container.speech.stop();

    try {
      const reply = await container.sendChat.execute({ type: 'text', text: value });
      // Remover el '...' y poner la respuesta real
      setMessages((prev) => {
        const withoutTyping = prev.filter((m) => m.text !== '...');
        return [reply, ...withoutTyping];
      });
      if (voiceEnabled) container.speech.speak(reply.text);
    } catch {
      setMessages((prev) => {
        const withoutTyping = prev.filter((m) => m.text !== '...');
        return [
          {
            id: `${Date.now()}-e`,
            role: 'assistant',
            text: 'Hubo un problema de conexión. Inténtalo de nuevo.',
            createdAt: Date.now(),
          },
          ...withoutTyping,
        ];
      });
    } finally {
      setBusy(false);
    }
  };

  const toggleMic = async () => {
    if (busy) return;

    if (!recording) {
      try {
        await container.audio.start();
        setRecording(true);
      } catch (e) {}
      return;
    }

    setRecording(false);
    setBusy(true);
    push({ id: `${Date.now()}-typing`, role: 'assistant', text: '...', createdAt: Date.now() });

    try {
      const clip = await container.audio.stop();
      if (!clip) {
        setBusy(false);
        setMessages((prev) => prev.filter((m) => m.text !== '...'));
        return;
      }

      const transcript = await container.transcribeAudio.execute({
        type: 'audio',
        uri: clip.uri,
        mimeType: clip.mimeType,
        base64: clip.base64,
      });

      const userMsg: ChatMessage = { id: `${Date.now()}-u`, role: 'user', text: transcript, createdAt: Date.now() };
      push(userMsg);
      void container.chat.saveMessage(userMsg);

      const reply = await container.sendChat.execute({ type: 'text', text: transcript });
      setMessages((prev) => {
        const withoutTyping = prev.filter((m) => m.text !== '...');
        return [reply, ...withoutTyping];
      });
      if (voiceEnabled) container.speech.speak(reply.text);
    } catch {
      setMessages((prev) => {
        const withoutTyping = prev.filter((m) => m.text !== '...');
        return [
          {
            id: `${Date.now()}-e`,
            role: 'assistant',
            text: 'No pude escucharte bien. Inténtalo de nuevo.',
            createdAt: Date.now(),
          },
          ...withoutTyping,
        ];
      });
    } finally {
      setBusy(false);
    }
  };

  const tabBarOffset = 64 + Math.max(insets.bottom, 6);

  const voiceToggleAction = (
    <Pressable
      onPress={toggleVoice}
      style={({ pressed }) => [
        styles.voiceHeaderBtn,
        voiceEnabled ? styles.voiceHeaderBtnActive : styles.voiceHeaderBtnMuted,
        pressed && styles.pressed,
      ]}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={voiceEnabled ? 'Desactivar voz de Jesús' : 'Activar voz de Jesús'}
    >
      <Ionicons
        name={voiceEnabled ? 'volume-high' : 'volume-mute'}
        size={20}
        color={voiceEnabled ? colors.gold : colors.textMuted}
      />
      <AppText
        style={[
          styles.voiceHeaderLabel,
          { color: voiceEnabled ? colors.gold : colors.textMuted },
        ]}
      >
        {voiceEnabled ? 'Voz' : 'Mudo'}
      </AppText>
    </Pressable>
  );

  return (
    <ImageBackground source={BG_IMG} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <AppHeader
          title="Hablar con Jesús"
          showLogo={false}
          transparent
          rightAction={voiceToggleAction}
        />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={[styles.content, isKeyboardVisible && styles.contentTyping]}>
            {/* Burbuja de Diálogo */}
            <Animated.View
              style={[
                styles.dialogueContainer,
                isKeyboardVisible && styles.dialogueContainerTyping,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              <View
                style={[
                  styles.dialogueBubble,
                  isKeyboardVisible && styles.dialogueBubbleTyping,
                ]}
              >
                {/* Header de la burbuja con el nombre y control de voz */}
                <View style={styles.bubbleHeaderRow}>
                  <View style={styles.speakerBadge}>
                    <Ionicons name="sparkles" size={13} color={colors.goldDark} />
                    <AppText style={styles.speakerName}>Jesús</AppText>
                  </View>
                  <Pressable
                    onPress={toggleVoice}
                    style={styles.bubbleVoiceBtn}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={voiceEnabled ? 'volume-medium' : 'volume-mute'}
                      size={14}
                      color={voiceEnabled ? colors.purple : colors.textMuted}
                    />
                    <AppText
                      style={[
                        styles.bubbleVoiceText,
                        !voiceEnabled && styles.bubbleVoiceTextMuted,
                      ]}
                    >
                      {voiceEnabled ? 'Voz activada' : 'En silencio'}
                    </AppText>
                  </Pressable>
                </View>

                <TypewriterBubble
                  text={dialogueText}
                  isActive={!busy}
                  isKeyboardVisible={isKeyboardVisible}
                />
                {!isKeyboardVisible && <View style={styles.bubbleTail} />}
              </View>
            </Animated.View>

            {/* Personaje (se oculta al escribir para que no empuje el input fuera de pantalla) */}
            {!isKeyboardVisible && (
              <View style={styles.characterWrapper}>
                <Image
                  source={JESUS_IMG}
                  style={styles.characterImage}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>

        {/* Input Bar */}
        <View style={styles.inputWrapper}>
          <ChatInputBar
            value={text}
            onChangeText={setText}
            onSend={sendText}
            onMic={toggleMic}
            recording={recording}
            busy={busy}
          />
        </View>

        {/* Espaciador inferior: al desplegar el teclado se reduce para que el input quede visible */}
        <View style={{ height: isKeyboardVisible ? 6 : tabBarOffset - 16 }} />
      </KeyboardAvoidingView>

      {/* Marca de agua (se oculta al escribir) */}
      {!isKeyboardVisible && (
        <View style={[styles.logoContainer, { bottom: tabBarOffset + spacing.xl }]}>
          <LogoMark size={32} />
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 10, 30, 0.65)',
  },
  flex: { flex: 1 },
  voiceHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  voiceHeaderBtnActive: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
  },
  voiceHeaderBtnMuted: {
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  voiceHeaderLabel: {
    fontSize: 12,
    fontFamily: fonts.sansBold,
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
    position: 'relative',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  contentTyping: {
    justifyContent: 'flex-start',
    gap: spacing.xs,
  },
  dialogueContainer: {
    marginTop: spacing.md,
    zIndex: 20,
  },
  dialogueContainerTyping: {
    marginTop: 4,
  },
  dialogueBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  dialogueBubbleTyping: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
  },
  bubbleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  speakerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  speakerName: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: colors.goldDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bubbleVoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(92, 45, 145, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  bubbleVoiceText: {
    fontSize: 11,
    fontFamily: fonts.sans,
    color: colors.purple,
  },
  bubbleVoiceTextMuted: {
    color: colors.textMuted,
  },
  dialogueText: {
    fontFamily: fonts.sans,
    fontSize: 17,
    color: '#1a1a1a',
    lineHeight: 24,
    textAlign: 'center',
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -15,
    right: 60,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderLeftColor: 'transparent',
    borderRightWidth: 15,
    borderRightColor: 'transparent',
    borderTopWidth: 20,
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
  },
  characterWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    zIndex: 10,
  },
  characterImage: {
    width: '130%',
    height: '110%', // para que desborde un poco hacia abajo
    transform: [{ translateY: 20 }],
  },
  inputWrapper: {
    paddingHorizontal: spacing.md,
    zIndex: 30,
  },
  logoContainer: {
    position: 'absolute',
    right: spacing.lg,
    opacity: 0.8,
    zIndex: 100,
  },
});

