import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '../atoms/AppText';
import { AppButton } from '../atoms/AppButton';
import { colors, fonts, spacing } from '../theme';

type Props = {
  error?: string;
  onRetry: () => void;
};

const BIBLE_ERRORS = [
  "«No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo; siempre te ayudaré...» (Isaías 41:10) — Pero parece que nuestro servidor necesita un poco de ayuda ahora.",
  "«Echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros.» (1 Pedro 5:7) — No te ansíes por este error, estamos trabajando en ello.",
  "«Por nada estéis afanosos...» (Filipenses 4:6) — Hubo un tropiezo en el camino al cielo (o al servidor).",
  "«Todo lo puedo en Cristo que me fortalece.» (Filipenses 4:13) — Pero este servidor se quedó sin fuerzas. ¡Intenta de nuevo!",
];

export function AppErrorView({ error, onRetry }: Props) {
  const randomVerse = BIBLE_ERRORS[Math.floor(Math.random() * BIBLE_ERRORS.length)];

  return (
    <LinearGradient
      colors={[colors.purpleDark || '#3D1E66', colors.bgDark || '#1A1A2E']}
      style={styles.container}
    >
      <View style={styles.content}>
        <AppText variant="hero" style={styles.title}>
          ¡Te desviaste del camino!
        </AppText>
        <AppText style={styles.verse}>
          {randomVerse}
        </AppText>

        {error ? (
          <View style={styles.errorBox}>
            <AppText style={styles.errorText}>Detalle: {error}</AppText>
          </View>
        ) : null}

        <View style={styles.buttonContainer}>
          <AppButton label="Cerrar sesión" onPress={onRetry} />
        </View>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require('../../../assets/images/jesus404.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: spacing.xxxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.gold,
    marginBottom: spacing.lg,
    textAlign: 'center',
    fontSize: 32,
  },
  verse: {
    fontFamily: fonts.sansMedium,
    fontSize: 18,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 28,
    fontStyle: 'italic',
  },
  errorBox: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
  },
  errorText: {
    color: colors.goldSoft,
    fontFamily: fonts.sans,
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: spacing.xxl,
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 300,
  },
  image: {
    width: '80%',
    height: '100%',
  },
});
