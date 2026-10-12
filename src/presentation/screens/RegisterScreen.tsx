import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ScreenShell } from '../templates/ScreenShell';
import { StoryAuthStage } from '../molecules/StoryAuthStage';
import { AuthAutofillGroup } from '../molecules/AuthAutofillGroup';
import { CountrySelect } from '../molecules/CountrySelect';
import { DatePickerField } from '../molecules/DatePickerField';
import { FormField } from '../molecules/FormField';
import { AppText } from '../atoms/AppText';
import { AppButton } from '../atoms/AppButton';
import { Spacer } from '../atoms/Spacer';
import { Chip } from '../atoms/Chip';
import { COUNTRIES } from '../../shared/constants/countries';
import { isValidBirthDate } from '../../shared/utils/dateFormat';
import { container } from '../../composition/container';
import { preferredVersionByBirthDate, type DocumentType } from '../../domain/entities/UserProfile';
import { colors, fonts, spacing } from '../theme';

type Props = {
  onDone: () => void;
  onLogin: () => void;
};

export function RegisterScreen({ onDone, onLogin }: Props) {
  const [documentType, setDocumentType] = useState<DocumentType>('CEDULA');
  const [documentId, setDocumentId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Ecuador');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const valid = useMemo(() => {
    return (
      name.trim().length >= 2 &&
      documentId.trim().length >= 5 &&
      password.length >= 6 &&
      phone.trim().length >= 8 &&
      isValidBirthDate(birthDate) &&
      !!country
    );
  }, [name, documentId, password, phone, birthDate, country]);

  const save = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError('');
    try {
      const preferredVersionId = preferredVersionByBirthDate(birthDate);
      const result = await container.auth.register({
        documentType,
        documentId: documentId.trim(),
        password,
        name: name.trim(),
        birthDate,
        phone: phone.trim(),
        country,
        preferredVersionId,
      });
      container.ai.setProfile(result.user);
      onDone();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No pudimos crear tu cuenta');
    } finally {
      setBusy(false);
    }
  };

  if (step === 1) {
    return (
      <StoryAuthStage
        step={1}
        totalSteps={7}
        imageSource={require('../../../assets/images/jesusHappy.png')}
        dialogue="¡Bienaventurado seas! No te preocupes, no te pediré que camines sobre el agua... solo que me digas, ¿cómo te llamas en la tierra de los mortales?"
        footer={
          <>
            <AppButton label="Siguiente" onPress={() => setStep(2)} disabled={name.trim().length < 2} />
            <Pressable onPress={onLogin} style={{ marginTop: spacing.md }}>
              <AppText style={styles.link}>
                Ya tengo cuenta — <AppText style={styles.linkAccent}>Entrar →</AppText>
              </AppText>
            </Pressable>
          </>
        }
      >
        <FormField label="Tu Nombre" kind="name" value={name} onChangeText={setName} autoFocus />
      </StoryAuthStage>
    );
  }

  if (step === 2) {
    return (
      <StoryAuthStage
        step={2}
        totalSteps={7}
        imageSource={require('../../../assets/images/jesusExplicando.png')}
        dialogue={`¡Un nombre digno de un profeta, ${name || 'amigo'}! Ahora cuéntame, ¿de qué tierras lejanas vienes? Prometo no mandarte plagas.`}
        footer={
          <>
            <AppButton label="Siguiente" onPress={() => setStep(3)} disabled={!country} />
            <Pressable onPress={() => setStep(1)} style={{ marginTop: spacing.md }}>
              <AppText style={styles.link}>Volver</AppText>
            </Pressable>
          </>
        }
      >
        <CountrySelect value={country} options={COUNTRIES} onChange={setCountry} />
      </StoryAuthStage>
    );
  }

  if (step === 3) {
    return (
      <StoryAuthStage
        step={3}
        totalSteps={7}
        imageSource={require('../../../assets/images/jesusCuerpoALaIzq.png')}
        dialogue="Ni Matusalén tenía tantos años... ¡es broma! Dime, ¿en qué fecha viste por primera vez la luz de este mundo?"
        footer={
          <>
            <AppButton label="Siguiente" onPress={() => setStep(4)} disabled={!isValidBirthDate(birthDate)} />
            <Pressable onPress={() => setStep(2)} style={{ marginTop: spacing.md }}>
              <AppText style={styles.link}>Volver</AppText>
            </Pressable>
          </>
        }
      >
        <DatePickerField label="Tu fecha de nacimiento" value={birthDate} onChange={setBirthDate} />
      </StoryAuthStage>
    );
  }

  if (step === 4) {
    return (
      <StoryAuthStage
        step={4}
        totalSteps={7}
        imageSource={require('../../../assets/images/jesusRelajadoSentado.png')}
        dialogue="En mis tiempos usábamos palomas mensajeras, pero dicen que ahora usan celulares. ¿Cuál es tu número para mandarte buenas nuevas?"
        footer={
          <>
            <AppButton label="Siguiente" onPress={() => setStep(5)} disabled={phone.trim().length < 8} />
            <Pressable onPress={() => setStep(3)} style={{ marginTop: spacing.md }}>
              <AppText style={styles.link}>Volver</AppText>
            </Pressable>
          </>
        }
      >
        <FormField
          label="Tu Teléfono"
          kind="phone"
          value={phone}
          onChangeText={setPhone}
          placeholder="+593 99 123 4567"
          autoFocus
        />
      </StoryAuthStage>
    );
  }

  if (step === 5) {
    return (
      <StoryAuthStage
        step={5}
        totalSteps={7}
        imageSource={require('../../../assets/images/jesusIndicando.png')}
        dialogue="Ha llegado el momento de la verdad. ¿Traes contigo tu Cédula local o acaso cruzaste los mares y traes Pasaporte?"
        footer={
          <View style={styles.chips}>
            <Chip
              label="Cédula"
              selected={documentType === 'CEDULA'}
              onPress={() => {
                setDocumentType('CEDULA');
                setStep(6);
              }}
              tone="gold"
              style={{ flex: 1 }}
            />
            <Spacer size="sm" horizontal />
            <Chip
              label="Pasaporte"
              selected={documentType === 'PASSPORT'}
              onPress={() => {
                setDocumentType('PASSPORT');
                setStep(6);
              }}
              tone="mint"
              style={{ flex: 1 }}
            />
          </View>
        }
      >
        <Pressable onPress={() => setStep(4)} style={{ alignItems: 'center' }}>
          <AppText style={styles.link}>Volver al paso anterior</AppText>
        </Pressable>
      </StoryAuthStage>
    );
  }

  if (step === 6) {
    return (
      <StoryAuthStage
        step={6}
        totalSteps={7}
        imageSource={require('../../../assets/images/jesusExplicando.png')}
        dialogue="Escribe los números de tu documento. Tranquilo, no se los pasaré a los romanos ni a los fariseos."
        footer={
          <>
            <AppButton label="Siguiente" onPress={() => setStep(7)} disabled={documentId.trim().length < 5} />
            <Pressable onPress={() => setStep(5)} style={{ marginTop: spacing.md }}>
              <AppText style={styles.link}>Volver</AppText>
            </Pressable>
          </>
        }
      >
        <FormField
          label="Número de documento"
          kind={documentType === 'CEDULA' ? 'documentNumeric' : 'document'}
          value={documentId}
          onChangeText={setDocumentId}
          placeholder={documentType === 'CEDULA' ? '1723456789' : 'A1234567'}
          nativeID="irav-register-username"
          autoFocus
          onSubmitEditing={() => setStep(7)}
        />
      </StoryAuthStage>
    );
  }

  return (
    <StoryAuthStage
      step={7}
      totalSteps={7}
      imageSource={require('../../../assets/images/jesusIndicando.png')}
      dialogue="Finalmente, crea una clave secreta. Hazla más fuerte que las murallas de Jericó para que nadie la adivine."
      footer={
        <>
          <AppButton label="Crear mi cuenta" onPress={save} disabled={!valid || busy} />
          <Pressable onPress={() => setStep(6)} style={{ marginTop: spacing.md }}>
            <AppText style={styles.link}>Volver</AppText>
          </Pressable>
        </>
      }
    >
      <FormField
        label="Contraseña"
        kind="newPassword"
        value={password}
        onChangeText={setPassword}
        placeholder="Mín. 6 caracteres"
        nativeID="irav-register-password"
        autoFocus
        onSubmitEditing={save}
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
