import { ReactNode, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../theme';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
};

/** Template: atrio luminoso con atmósfera */
export function ScreenShell({ children, style, padded = true }: Props) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [fade]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#141414', '#070707', '#000000']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glowTop} />
      <View style={styles.glowSide} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <Animated.View style={[styles.body, padded && styles.padded, { opacity: fade }, style]}>
          {children}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  body: { flex: 1 },
  padded: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  glowTop: {
    position: 'absolute',
    top: -80,
    left: '15%',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  glowSide: {
    position: 'absolute',
    bottom: '18%',
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
});
