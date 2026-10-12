import { ReactNode, useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, ImageBackground, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../atoms/AppText';
import { LogoMark } from './LogoMark';
import { colors, spacing, radius } from '../theme';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Layout de autenticación con fondo inmersivo animado */
export function AuthStage({ title, subtitle, children, footer }: Props) {
  const insets = useSafeAreaInsets();
  
  // Animación de entrada suave
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ImageBackground 
      source={require('../../../assets/images/auth_bg.jpg')} 
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: Math.max(insets.top + spacing.xl, spacing.xxl), paddingBottom: Math.max(insets.bottom + spacing.xl, spacing.xxl) }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.logoWrapper}>
              <LogoMark size={84} />
            </View>
            <AppText variant="hero" style={styles.title}>
              {title}
            </AppText>
            {subtitle ? (
              <AppText muted style={styles.subtitle}>
                {subtitle}
              </AppText>
            ) : null}
          </Animated.View>

          <Animated.View style={[styles.glassCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.form}>{children}</View>
          </Animated.View>
          
          {footer ? (
            <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
              {footer}
            </Animated.View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 10, 30, 0.4)', // Dark overlay para contraste
  },
  flex: { flex: 1 },
  scroll: { 
    paddingHorizontal: spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  logoWrapper: {
    marginBottom: spacing.sm,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  title: { 
    textAlign: 'center', 
    color: colors.gold, 
    fontSize: 36,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'none',
    letterSpacing: 0,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: radius.xl,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  form: { gap: spacing.md, zIndex: 1 },
  footer: { marginTop: spacing.xxl, alignItems: 'center' },
});
