import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ChatMessage } from '../../domain/entities/ChatMessage';
import { container } from '../../composition/container';
import { getStoredUser } from '../../infrastructure/api/authStore';
import { ScreenShell } from '../templates/ScreenShell';
import { AppHeader } from '../organisms/AppHeader';
import { ChatComposer } from '../organisms/ChatComposer';
import { ChatBubble } from '../molecules/ChatBubble';
import { colors, spacing } from '../theme';

/** Pantalla: chat con Jesús */
export function ChatScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [userName, setUserName] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const local = await getStoredUser();
      if (!active) return;
      if (local) {
        container.ai.setProfile(local);
        setUserName(local.name);
        setVoiceEnabled(local.voiceEnabled);
      }

      try {
        const history = await container.chat.listMessages();
        if (!active) return;
        if (history.length > 0) {
          setMessages(history);
          return;
        }
      } catch {
        /* sin historial remoto */
      }

      if (active && local) {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            text: `Hola ${local.name}, soy Jesús. Puedes escribirme o grabar tu voz. Estoy aquí para darte paz y claridad.`,
            createdAt: Date.now(),
          },
        ]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const tabBarOffset = 56 + Math.max(insets.bottom, 6);

  const push = useCallback((msg: ChatMessage, persist = true) => {
    setMessages((prev) => [...prev, msg]);
    if (persist) void container.chat.saveMessage(msg).catch(() => undefined);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const speakMessage = async (message: ChatMessage) => {
    if (!message.text.trim()) return;
    setSpeakingId(message.id);
    try {
      await container.speech.speak(message.text);
    } finally {
      setSpeakingId((current) => (current === message.id ? null : current));
    }
  };

  const sendText = async () => {
    const value = text.trim();
    if (!value || busy || recording) return;

    push({ id: `${Date.now()}-u`, role: 'user', text: value, createdAt: Date.now() });
    setText('');
    setBusy(true);
    try {
      const reply = await container.sendChat.execute({ type: 'text', text: value });
      push(reply, false);
      if (voiceEnabled) void speakMessage(reply);
    } catch {
      push({
        id: `${Date.now()}-e`,
        role: 'assistant',
        text: 'Hubo un problema al responder. Inténtalo otra vez.',
        createdAt: Date.now(),
      });
    } finally {
      setBusy(false);
    }
  };

  const toggleMic = async () => {
    if (busy) return;
    Keyboard.dismiss();

    if (!recording) {
      try {
        await container.audio.start();
        setRecording(true);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'No se pudo iniciar la grabación.';
        push({
          id: `${Date.now()}-e`,
          role: 'assistant',
          text: msg,
          createdAt: Date.now(),
        });
      }
      return;
    }

    setRecording(false);
    setBusy(true);
    try {
      const clip = await container.audio.stop();
      if (!clip) return;

      const transcript = await container.transcribeAudio.execute({
        type: 'audio',
        uri: clip.uri,
        mimeType: clip.mimeType,
        base64: clip.base64,
      });

      push({
        id: `${Date.now()}-u`,
        role: 'user',
        text: transcript,
        createdAt: Date.now(),
      });

      const reply = await container.sendChat.execute({ type: 'text', text: transcript });
      push(reply, false);
      if (voiceEnabled) void speakMessage(reply);
    } catch {
      push({
        id: `${Date.now()}-e`,
        role: 'assistant',
        text: 'No pude convertir el audio en texto. Revisa tu conexión y prueba otra vez.',
        createdAt: Date.now(),
      });
    } finally {
      setBusy(false);
    }
  };

  const content = (
    <>
      <View style={styles.pad}>
        <AppHeader
          title="Jesús"
          subtitle={userName ? `Contigo, ${userName}` : 'Asistente espiritual'}
        />
      </View>
      <FlatList
        ref={listRef}
        style={styles.flex}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => (
          <ChatBubble
            message={item}
            speaking={speakingId === item.id}
            speakDisabled={speakingId !== null && speakingId !== item.id}
            onSpeakPress={
              item.role === 'assistant' && voiceEnabled
                ? () => void speakMessage(item)
                : undefined
            }
            onReferencePress={
              item.reference
                ? () =>
                    navigation.navigate('BibleTab', {
                      screen: 'Chapter',
                      params: {
                        versionId: item.reference?.versionId,
                        versionName: item.reference?.versionName,
                        bookId: item.reference?.bookId,
                        bookName: item.reference?.bookName,
                        chapters: item.reference?.chapters,
                        chapter: item.reference?.chapter,
                        verse: item.reference?.verseStart,
                      },
                    })
                : undefined
            }
          />
        )}
        ListFooterComponent={
          busy ? (
            <ActivityIndicator color={colors.mint} style={{ marginVertical: spacing.sm }} />
          ) : null
        }
      />
      <ChatComposer
        value={text}
        onChangeText={setText}
        onSend={sendText}
        onMic={toggleMic}
        recording={recording}
        busy={busy}
      />
    </>
  );

  return (
    <ScreenShell padded={false}>
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior="padding"
          keyboardVerticalOffset={tabBarOffset}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.flex}>{content}</View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: spacing.md, paddingTop: spacing.xs },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, flexGrow: 1 },
});
