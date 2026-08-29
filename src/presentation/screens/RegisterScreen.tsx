import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ScreenShell } from '../templates/ScreenShell';
import { AuthStage } from '../molecules/AuthStage';
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

  return (
    <ScreenShell padded={false}>
      <View style={styles.pad}>
        <AuthStage
          title="Crear cuenta"
          subtitle="Elige una contraseña para acceder a IRAV."
          footer={
            <Pressable onPress={onLogin}>
              <AppText style={styles.link}>
                Ya tengo cuenta — <AppText style={styles.linkAccent}>Entrar →</AppText>
              </AppText>
            </Pressable>
          }
        >
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
          <Spacer size="sm" />
          <AuthAutofillGroup>
            <FormField
              label="Documento"
              kind={documentType === 'CEDULA' ? 'documentNumeric' : 'document'}
              value={documentId}
              onChangeText={setDocumentId}
              placeholder={documentType === 'CEDULA' ? '1723456789' : 'A1234567'}
              nativeID="irav-register-username"
            />
            <FormField
              label="Contraseña"
              kind="newPassword"
              value={password}
              onChangeText={setPassword}
              placeholder="Mín. 6 caracteres"
              nativeID="irav-register-password"
            />
          </AuthAutofillGroup>
          <FormField label="Nombre" kind="name" value={name} onChangeText={setName} />
          <DatePickerField label="Nacimiento" value={birthDate} onChange={setBirthDate} />
          <FormField
            label="Teléfono"
            kind="phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="+593 99 123 4567"
          />
          <AppText variant="caption" style={styles.fieldLabel}>
            País
          </AppText>
          <CountrySelect value={country} options={COUNTRIES} onChange={setCountry} />
          {error ? <AppText style={styles.error}>{error}</AppText> : null}
          <Spacer size="lg" />
          <AppButton label="Crear mi cuenta" onPress={save} disabled={!valid || busy} />
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
