import { View, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '../../theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onMic: () => void;
  recording: boolean;
  busy: boolean;
};

export function ChatInputBar({ value, onChangeText, onSend, onMic, recording, busy }: Props) {
  const hasText = value.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Hablar con Jesús (IA)..."
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          multiline
          maxLength={500}
        />
        <Pressable 
          onPress={hasText ? onSend : onMic} 
          disabled={busy && !recording}
          style={({ pressed }) => [
            styles.actionButton,
            recording && styles.recordingButton,
            pressed && styles.pressed
          ]}
        >
          {busy && !recording ? (
            <ActivityIndicator size="small" color={colors.gold} />
          ) : (
            <Ionicons 
              name={hasText ? "send" : (recording ? "stop" : "mic")} 
              size={20} 
              color={recording ? colors.textLight : colors.goldDark} 
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.xxl,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    ...shadows.card,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    color: colors.text,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    paddingTop: 8,
    paddingBottom: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.vellumDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  recordingButton: {
    backgroundColor: colors.danger,
  },
  pressed: {
    opacity: 0.7,
  },
});
