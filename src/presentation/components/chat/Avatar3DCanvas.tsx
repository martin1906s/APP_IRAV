import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../theme';

export function Avatar3DCanvas() {
  return (
    <View style={styles.container}>
      {/* Placeholder para el Canvas de @react-three/fiber */}
      <View style={styles.placeholder}>
        <Ionicons name="cube-outline" size={48} color={colors.gold} />
        <Text style={styles.text}>Jesús 3D (Próximamente)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.45, // Ocupa el 45% superior de la pantalla
    backgroundColor: colors.vellum,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontFamily: typography.caption.fontFamily,
    color: colors.textMuted,
  },
});
