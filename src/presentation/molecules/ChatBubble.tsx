import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ChatMessage } from '../../domain/entities/ChatMessage';
import { colors, fonts, radius, spacing } from '../theme';
import { AppText } from '../atoms/AppText';

type Props = {
  message: ChatMessage;
  onReferencePress?: () => void;
  onSpeakPress?: () => void;
  speaking?: boolean;
  speakDisabled?: boolean;
};

/** Molécula: burbuja del chat */
export function ChatBubble({
  message,
  onReferencePress,
  onSpeakPress,
  speaking = false,
  speakDisabled = false,
}: Props) {
  const mine = message.role === 'user';
  const listenLocked = speaking || speakDisabled;
  return (
    <View style={[styles.row, mine ? styles.right : styles.left]}>
      <View style={[styles.bubble, mine ? styles.user : styles.bot]}>
        <AppText invert={mine} variant="body" style={mine ? styles.userText : undefined}>
          {message.text}
        </AppText>
        {!mine && onSpeakPress ? (
          <Pressable
            style={[styles.listen, listenLocked && styles.listenDisabled]}
            onPress={onSpeakPress}
            disabled={listenLocked}
          >
            {speaking ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Ionicons name="volume-high-outline" size={17} color={colors.accent} />
            )}
            <AppText variant="body" style={styles.listenLabel}>
              {speaking ? 'Hablando...' : 'Escuchar'}
            </AppText>
          </Pressable>
        ) : null}
        {message.reference && onReferencePress ? (
          <Pressable style={styles.reference} onPress={onReferencePress}>
            <Ionicons name="book-outline" size={17} color={colors.accent} />
            <AppText variant="body" style={styles.referenceText}>
              {message.reference.label}
            </AppText>
            <Ionicons name="chevron-forward" size={16} color={colors.accent} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: spacing.sm, maxWidth: '88%' },
  left: { alignSelf: 'flex-start' },
  right: { alignSelf: 'flex-end' },
  bubble: {
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  user: { backgroundColor: colors.accent },
  bot: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userText: { fontFamily: fonts.sans },
  reference: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  referenceText: {
    flex: 1,
    color: colors.accent,
    fontSize: 14,
    textTransform: 'none',
    letterSpacing: 0,
  },
  listen: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  listenDisabled: {
    opacity: 0.55,
  },
  listenLabel: {
    color: colors.accent,
    fontSize: 13,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
