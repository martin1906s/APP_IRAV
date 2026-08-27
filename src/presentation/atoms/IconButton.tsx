import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

type Props = {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  bg?: string;
  style?: ViewStyle;
};

/** Átomo: botón solo icono */
export function IconButton({
  name,
  onPress,
  size = 22,
  color = colors.text,
  bg = colors.surface,
  style,
}: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.base, { backgroundColor: bg }, style]}>
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
