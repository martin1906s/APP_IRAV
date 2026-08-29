import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenShell } from '../../templates/ScreenShell';
import { AppHeader } from '../../organisms/AppHeader';
import { CountrySelect } from '../../molecules/CountrySelect';
import { DatePickerField } from '../../molecules/DatePickerField';
import { FormField } from '../../molecules/FormField';
import { AppText } from '../../atoms/AppText';
import { AppButton } from '../../atoms/AppButton';
import { Chip } from '../../atoms/Chip';
import { Spacer } from '../../atoms/Spacer';
import { COUNTRIES } from '../../../shared/constants/countries';
import { isValidBirthDate } from '../../../shared/utils/dateFormat';
import { container } from '../../../composition/container';
import type { DocumentType, UserRole } from '../../../domain/entities/UserProfile';
import { colors, spacing } from '../../theme';

type RouteParams = { userId?: string };

/** Crear o editar joven desde el panel admin */
export function AdminUserFormScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const userId = (route.params as RouteParams | undefined)?.userId;
  const isEdit = !!userId;

  const [documentType, setDocumentType] = useState<DocumentType>('CEDULA');
  const [documentId, setDocumentId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Ecuador');
  const [role, setRole] = useState<UserRole>('USER');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const user = await container.admin.getUser(userId);
      setDocumentType(user.documentType);
      setDocumentId(user.documentId);
      setName(user.name);
      setBirthDate(user.birthDate);
      setPhone(user.phone);
      setCountry(user.country);
      setRole(user.role ?? 'USER');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const valid = useMemo(() => {
    const base =
      name.trim().length >= 2 &&
      documentId.trim().length >= 5 &&
      phone.trim().length >= 8 &&
      isValidBirthDate(birthDate) &&
      !!country;
    if (isEdit) {
      if (!password.trim()) return base;
      return base && password.length >= 6;
    }
    return base && password.length >= 6;
  }, [name, documentId, password, phone, birthDate, country, isEdit]);

  const save = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError('');
    try {
      if (isEdit && userId) {
        await container.admin.updateUser(userId, {
          documentType,
          documentId: documentId.trim(),
          name: name.trim(),
          birthDate,
          phone: phone.trim(),
          country,
          role,
          ...(password.trim().length >= 6 ? { password } : {}),
        });
        nav.goBack();
      } else {
        await container.admin.createUser({
          documentType,
          documentId: documentId.trim(),
          password,
          name: name.trim(),
          birthDate,
          phone: phone.trim(),
          country,
          role,
        });
        nav.goBack();
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setBusy(false);
    }
  };

  const remove = () => {
    if (!userId) return;
    Alert.alert('Eliminar joven', '¿Seguro? Se borrarán sus datos asociados.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await container.admin.deleteUser(userId);
            nav.goBack();
          } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'No se pudo eliminar');
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ScreenShell>
        <AppHeader title="Cargando…" onBack={() => nav.goBack()} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader
          title={isEdit ? 'Editar joven' : 'Nuevo joven'}
          subtitle={isEdit ? 'Actualiza los datos del perfil' : 'Registra un nuevo miembro'}
          onBack={() => nav.goBack()}
        />

        <AppText variant="caption" style={styles.label}>
          Tipo de documento
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
        <Spacer size="sm" />

        <FormField
          label="Documento"
          kind={documentType === 'CEDULA' ? 'documentNumeric' : 'document'}
          value={documentId}
          onChangeText={setDocumentId}
        />
        <FormField
          label={isEdit ? 'Restablecer contraseña (opcional)' : 'Contraseña'}
          kind="password"
          value={password}
          onChangeText={setPassword}
          placeholder={isEdit ? 'Solo si deseas cambiarla' : 'Mín. 6 caracteres'}
        />
        <FormField label="Nombre" kind="name" value={name} onChangeText={setName} />
        <DatePickerField label="Nacimiento" value={birthDate} onChange={setBirthDate} />
        <FormField label="Teléfono" kind="phone" value={phone} onChangeText={setPhone} />
        <AppText variant="caption" style={styles.label}>
          País
        </AppText>
        <CountrySelect value={country} options={COUNTRIES} onChange={setCountry} />
        <Spacer size="md" />

        <AppText variant="caption" style={styles.label}>
          Rol
        </AppText>
        <View style={styles.chips}>
          <Chip label="Joven" selected={role === 'USER'} onPress={() => setRole('USER')} tone="sky" />
          <Chip label="Admin" selected={role === 'ADMIN'} onPress={() => setRole('ADMIN')} tone="gold" />
        </View>

        {error ? <AppText style={styles.error}>{error}</AppText> : null}
        <Spacer size="lg" />
        <AppButton label={isEdit ? 'Guardar cambios' : 'Crear joven'} onPress={save} disabled={!valid || busy} />
        {isEdit ? (
          <>
            <Spacer size="md" />
            <AppButton label="Eliminar joven" onPress={remove} variant="ghost" disabled={busy} />
          </>
        ) : null}
        <Spacer size="xxl" />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textMuted, marginBottom: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  error: {
    marginTop: spacing.sm,
    color: colors.danger,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
