import { useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, View } from 'react-native';
import { ScreenShell } from '../templates/ScreenShell';
import { StoryAuthStage } from '../molecules/StoryAuthStage';
import { AuthAutofillGroup } from '../molecules/AuthAutofillGroup';
import { FormField } from '../molecules/FormField';
import { AppText } from '../atoms/AppText';
import { AppButton } from '../atoms/AppButton';
import { Spacer } from '../atoms/Spacer';
import { Chip } from '../atoms/Chip';
import { container } from '../../composition/container';
import type { DocumentType } from '../../domain/entities/UserProfile';
import { colors, fonts, spacing } from '../theme';

type Props = {
  onLoggedIn: () => void;
  onRegister: () => void;
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function LoginScreen({ onLoggedIn, onRegister }: Props) {
  const [documentType, setDocumentType] = useState<DocumentType>('CEDULA');
  const [documentId, setDocumentId] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const submit = async () => {
    if (!documentId.trim() || !password || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await container.auth.login(documentType, documentId.trim(), password);
      // Guardar sesión para que la app sepa que estamos logueados
      const { saveSession } = require('../../infrastructure/api/authStore');
      await saveSession(result.accessToken, result.user);
      
      container.ai.setProfile(result.user);
      Keyboard.dismiss();
      // Breve pausa en Android para que el gestor de contraseñas pueda ofrecer guardar.
      if (Platform.OS === 'android') {
        await wait(450);
      }
      onLoggedIn();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No pudimos iniciar sesión');
    } finally {
      setBusy(false);
    }
  };

  if (step === 1) {
    return (
      <StoryAuthStage
        imageSource={require('../../../assets/images/jesusExplicando.png')}
        dialogue="¡Aleluya, has vuelto! Pensé que te habías perdido vagando 40 años por el desierto. Dime, ¿cuáles son los números de tu documento para dejarte entrar?"
        footer={
          <>
            <AppButton label="Siguiente" onPress={() => setStep(2)} disabled={documentId.trim().length < 5} />
            <Pressable onPress={onRegister} style={{ marginTop: spacing.md }}>
              <AppText style={styles.link}>
                ¿Primera vez? <AppText style={styles.linkAccent}>Crea tu cuenta →</AppText>
              </AppText>
            </Pressable>
          </>
        }
      >
        <FormField
          label="Número de documento"
          kind="documentNumeric"
          value={documentId}
          onChangeText={setDocumentId}
          placeholder="1723456789"
          nativeID="irav-login-username"
          returnKeyType="next"
          onSubmitEditing={() => setStep(2)}
          autoFocus
        />
      </StoryAuthStage>
    );
  }

  return (
    <StoryAuthStage
      imageSource={require('../../../assets/images/jesusIndicando.png')}
      dialogue="¡Tranquilo, no es el juicio final! Pero sí necesito esa clave secreta que guardas. Escríbela con fe, prometo que yo no miro."
      footer={
        <>
          <AppButton label="Entrar a IRAV" onPress={submit} disabled={busy || password.length < 6} />
          <Pressable onPress={() => setStep(1)} style={{ marginTop: spacing.md }}>
            <AppText style={styles.link}>Volver</AppText>
          </Pressable>
        </>
      }
    >
      <FormField
        label="Contraseña"
        kind="loginPassword"
        value={password}
        onChangeText={setPassword}
        placeholder="Tu contraseña"
        nativeID="irav-login-password"
        returnKeyType="go"
        onSubmitEditing={submit}
        autoFocus
      />
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
    </StoryAuthStage>
  );
}

const styles = StyleSheet.create({
  fieldLabel: { color: colors.textMuted, marginBottom: spacing.xs },
  chips: { flexDirection: 'row' },
  error: {
    marginTop: spacing.sm,
    color: '#ff6b6b', // un rojo más claro para fondos oscuros
    fontFamily: fonts.sans,
    fontSize: 14,
    textTransform: 'none',
    letterSpacing: 0,
    textAlign: 'center',
  },
  link: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.textMuted,
    textTransform: 'none',
    letterSpacing: 0,
    textAlign: 'center',
  },
  linkAccent: {
    fontFamily: fonts.sansSemi,
    color: colors.gold,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
