import { ReactNode, useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, ImageBackground, Animated, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../atoms/AppText';
import { LogoMark } from './LogoMark';
import { colors, spacing, radius, fonts } from '../theme';

type Props = {
  imageSource: any;
  dialogue: string;
  children?: ReactNode;
  footer?: ReactNode;
  step?: number;
  totalSteps?: number;
};

/** Layout de autenticación con estilo de historia/modal */
export function StoryAuthStage({ imageSource, dialogue, children, footer, step, totalSteps }: Props) {
  const insets = useSafeAreaInsets();
  
  // Animación de entrada suave
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]); // Re-animar cuando cambia el paso

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
          {step && totalSteps ? (
            <View style={styles.stepIndicator}>
              <AppText variant="caption" style={styles.stepText}>
                Paso {step} de {totalSteps}
              </AppText>
            </View>
          ) : null}

          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.dialogueBubble}>
              <AppText style={styles.dialogueText}>{dialogue}</AppText>
              
              {children ? (
                <View style={styles.formContainer}>
                  {children}
                </View>
              ) : null}

              {footer ? (
                <View style={styles.footer}>
                  {footer}
                </View>
              ) : null}
              <View style={styles.bubbleTail} />
            </View>

            <View style={styles.characterContainer}>
              <Image source={imageSource} style={styles.characterImage} resizeMode="contain" />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.logoContainer}>
        <LogoMark size={32} />
      </View>
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
    backgroundColor: 'rgba(15, 10, 30, 0.6)', 
  },
  flex: { flex: 1 },
  scroll: { 
    paddingHorizontal: spacing.lg,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  scroll: { 
    paddingHorizontal: spacing.lg,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  stepIndicator: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stepText: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.sansSemi,
    fontSize: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    position: 'relative',
  },
  dialogueBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginTop: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 20,
  },
  dialogueText: {
    fontFamily: fonts.sans,
    fontSize: 18,
    color: '#1a1a1a',
    lineHeight: 26,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  formContainer: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -15,
    right: 60, // Apuntando hacia el personaje a la derecha
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderLeftColor: 'transparent',
    borderRightWidth: 15,
    borderRightColor: 'transparent',
    borderTopWidth: 20,
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
  },
  characterContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    minHeight: 300,
    zIndex: 10,
    marginTop: spacing.lg,
  },
  characterImage: {
    width: '110%',
    height: '100%',
  },
  footer: { 
    marginTop: spacing.md, 
    alignItems: 'stretch', 
    gap: spacing.md 
  },
  logoContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    opacity: 0.8,
    zIndex: 100,
  }
});
