import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { ChatMessage } from '../../../domain/entities/ChatMessage';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  message: ChatMessage;
};

export function ChatBubble({ message }: Props) {
  const isAi = message.role === 'assistant';

  return (
    <Animated.View 
      entering={FadeInDown.duration(300)}
      style={[
        styles.container,
        isAi ? styles.aiContainer : styles.userContainer
      ]}
    >
      {isAi && (
        <View style={styles.avatar}>
          <Ionicons name="person" size={16} color={colors.purple} />
        </View>
      )}
      
      <View style={[
        styles.bubble,
        isAi ? styles.aiBubble : styles.userBubble
      ]}>
        <Text style={[
          styles.text,
          isAi ? styles.aiText : styles.userText
        ]}>
          {message.text}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
    maxWidth: '85%',
  },
  aiContainer: {
    alignSelf: 'flex-start',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.vellumDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    ...shadows.card,
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    ...shadows.card,
  },
  aiBubble: {
    backgroundColor: colors.chatBubbleAi,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: colors.chatBubbleUser,
    borderBottomRightRadius: 4,
  },
  text: {
    fontFamily: typography.chatMessage.fontFamily,
    fontSize: typography.chatMessage.fontSize,
    lineHeight: typography.chatMessage.lineHeight,
  },
  aiText: {
    color: colors.text,
  },
  userText: {
    color: colors.textLight,
  },
});
