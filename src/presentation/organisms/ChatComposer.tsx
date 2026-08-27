import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';
import { AppInput } from '../atoms/AppInput';
import { IconButton } from '../atoms/IconButton';

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  onMic: () => void;
  recording: boolean;
  busy: boolean;
};

/** Organismo: compositor del chat */
export function ChatComposer({
  value,
  onChangeText,
  onSend,
  onMic,
  recording,
  busy,
}: Props) {
  return (
    <View style={styles.wrap}>
      <IconButton
        name={recording ? 'stop-circle' : 'mic'}
        onPress={onMic}
        color={recording ? colors.danger : colors.text}
        bg={recording ? colors.accentSoft : colors.surface}
      />
      <AppInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Escribe o graba…"
        editable={!busy && !recording}
        multiline
      />
      <IconButton
        name="send"
        onPress={onSend}
        bg={colors.accent}
        color={colors.onAccent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgElevated,
  },
  input: { flex: 1, maxHeight: 120 },
});
