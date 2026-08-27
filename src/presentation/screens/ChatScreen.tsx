import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { ChatMessage } from '../../domain/entities/ChatMessage';
import { container } from '../../composition/container';
import { ScreenShell } from '../templates/ScreenShell';
import { AppHeader } from '../organisms/AppHeader';
import { ChatComposer } from '../organisms/ChatComposer';
import { ChatBubble } from '../molecules/ChatBubble';
import { colors, spacing } from '../theme';

/** Pantalla: chat con Jesús */
export function ChatScreen() {
  const navigation = useNavigation<any>();
  const listRef = useRef<FlatList>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [userName, setUserName] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    container.getProfile.execute().then((p) => {
      if (p) {
        container.ai.setProfile(p);
        setUserName(p.name);
        setVoiceEnabled(p.voiceEnabled);
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            text: `Hola ${p.name}, soy Jesús. Puedes escribirme o grabar tu voz. Estoy aquí para darte paz y claridad.`,
            createdAt: Date.now(),
          },
        ]);
      } else {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            text: 'Hola, soy Jesús. Escribe o graba: estoy contigo.',
            createdAt: Date.now(),
          },
        ]);
      }
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      container.getProfile.execute().then((p) => {
        if (!p) return;
        container.ai.setProfile(p);
        setUserName(p.name);
        setVoiceEnabled(p.voiceEnabled);
      });
    }, []),
  );

  const push = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  };

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
    if (!value || busy) return;

    push({ id: `${Date.now()}-u`, role: 'user', text: value, createdAt: Date.now() });
    setText('');
    setBusy(true);
    try {
      const reply = await container.sendChat.execute({ type: 'text', text: value });
      push(reply);
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

    if (!recording) {
      await container.audio.start();
      setRecording(true);
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
      push(reply);
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

  return (
    <ScreenShell padded={false}>
      <View style={styles.pad}>
        <AppHeader
          showLogo
          title="Jesús"
          subtitle={userName ? `Contigo, ${userName}` : 'Guía de IRAV'}
        />
      </View>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
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
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: spacing.md, paddingTop: spacing.xs },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, flexGrow: 1 },
});
