import { useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, View } from 'react-native';
import { ScreenShell } from '../templates/ScreenShell';
import { AuthStage } from '../molecules/AuthStage';
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

  const submit = async () => {
    if (!documentId.trim() || !password || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await container.auth.login(documentType, documentId.trim(), password);
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

  return (
    <ScreenShell padded={false}>
      <View style={styles.pad}>
        <AuthStage
          title="Iniciar sesión"
          subtitle="Usa el acceso rápido del teclado o el gestor de contraseñas de tu teléfono."
          footer={
            <Pressable onPress={onRegister}>
              <AppText style={styles.link}>
                ¿Primera vez? <AppText style={styles.linkAccent}>Crea tu cuenta →</AppText>
              </AppText>
            </Pressable>
          }
        >
          <AppText variant="caption" style={styles.fieldLabel}>
            Documento
          </AppText>
          <View style={styles.chips}>
            <Chip
              label="Cédula"
              selected={documentType === 'CEDULA'}
              onPress={() => setDocumentType('CEDULA')}
              tone="gold"
            />
            <Chip
              label="Pasaporte"
              selected={documentType === 'PASSPORT'}
              onPress={() => setDocumentType('PASSPORT')}
              tone="mint"
            />
          </View>
          <Spacer size="md" />
          <AuthAutofillGroup>
            <FormField
              label="Número de documento"
              kind={documentType === 'CEDULA' ? 'documentNumeric' : 'document'}
              value={documentId}
              onChangeText={setDocumentId}
              placeholder={documentType === 'CEDULA' ? '1723456789' : 'A1234567'}
              nativeID="irav-login-username"
              returnKeyType="next"
            />
            <FormField
              label="Contraseña"
              kind="loginPassword"
              value={password}
              onChangeText={setPassword}
              placeholder="Tu contraseña"
              nativeID="irav-login-password"
              returnKeyType="go"
              onSubmitEditing={submit}
            />
          </AuthAutofillGroup>
          {error ? <AppText style={styles.error}>{error}</AppText> : null}
          <Spacer size="lg" />
          <AppButton label="Entrar a IRAV" onPress={submit} disabled={busy} />
        </AuthStage>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  pad: { flex: 1, paddingHorizontal: spacing.lg },
  fieldLabel: { color: colors.textMuted, marginBottom: spacing.xs },
  chips: { flexDirection: 'row' },
  error: {
    marginTop: spacing.sm,
    color: colors.danger,
    fontFamily: fonts.sans,
    fontSize: 14,
    textTransform: 'none',
    letterSpacing: 0,
  },
  link: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.textMuted,
    textTransform: 'none',
    letterSpacing: 0,
  },
  linkAccent: {
    fontFamily: fonts.sansSemi,
    color: colors.accent,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
