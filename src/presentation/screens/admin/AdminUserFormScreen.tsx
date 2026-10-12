import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import { colors, fonts, radius, spacing, shadows } from '../../theme';

type RouteParams = { userId?: string };

/** Crear o editar joven desde el panel admin con interfaz pulida */
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
    } catch {
      setError('No se pudo cargar el perfil del joven.');
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
    Alert.alert('Eliminar miembro', '¿Deseas eliminar permanentemente este usuario y todos sus datos asociados?', [
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
        <AppHeader title="Cargando perfil…" onBack={() => nav.goBack()} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <AppHeader
          title={isEdit ? 'Editar Perfil' : 'Nuevo Miembro'}
          subtitle={isEdit ? 'Actualiza los datos del joven' : 'Registra un joven en la comunidad'}
          onBack={() => nav.goBack()}
        />

        <View style={styles.card}>
          <AppText variant="caption" style={styles.sectionTitle}>
            Documento de Identidad
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
          <Spacer size="xs" />
          <FormField
            label="Número de documento"
            kind="identityDocument"
            keyboardType={documentType === 'CEDULA' ? 'number-pad' : 'default'}
            value={documentId}
            onChangeText={setDocumentId}
            editable={!busy}
          />

          <Spacer size="sm" />
          <AppText variant="caption" style={styles.sectionTitle}>
            Datos Personales
          </AppText>
          <FormField label="Nombre completo" kind="name" value={name} onChangeText={setName} />
          <DatePickerField label="Fecha de nacimiento" value={birthDate} onChange={setBirthDate} />
          <FormField label="Teléfono de contacto" kind="phone" value={phone} onChangeText={setPhone} />
          
          <Spacer size="xs" />
          <AppText variant="caption" style={styles.fieldLabel}>País de residencia</AppText>
          <CountrySelect value={country} options={COUNTRIES} onChange={setCountry} />

          <Spacer size="sm" />
          <AppText variant="caption" style={styles.sectionTitle}>
            Seguridad y Rol
          </AppText>
          <FormField
            label={isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña de acceso'}
            kind="password"
            value={password}
            onChangeText={setPassword}
            placeholder={isEdit ? 'Dejar en blanco para conservar la actual' : 'Mínimo 6 caracteres'}
          />

          <AppText variant="caption" style={styles.fieldLabel}>Rol asignado</AppText>
          <View style={styles.chips}>
            <Chip label="Joven" selected={role === 'USER'} onPress={() => setRole('USER')} tone="sky" />
            <Chip label="Administrador" selected={role === 'ADMIN'} onPress={() => setRole('ADMIN')} tone="gold" />
          </View>
        </View>

        {error ? <AppText style={styles.errorText}>{error}</AppText> : null}

        <Spacer size="lg" />
        <AppButton
          label={busy ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Registrar joven'}
          onPress={save}
          disabled={!valid || busy}
        />
        {isEdit ? (
          <>
            <Spacer size="sm" />
            <Pressable style={styles.deleteBtn} onPress={remove} disabled={busy}>
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
              <AppText style={styles.deleteText}>Eliminar miembro de la comunidad</AppText>
            </Pressable>
          </>
        ) : null}
        <Spacer size="xxl" />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#EFEAE2',
    gap: spacing.xs,
    ...shadows.card,
  },
  sectionTitle: {
    color: colors.purple,
    fontFamily: fonts.sansBold,
    marginTop: spacing.xs,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldLabel: {
    color: colors.textMuted,
    marginBottom: 4,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.xs },
  errorText: {
    marginTop: spacing.sm,
    color: colors.danger,
    fontFamily: fonts.sansMedium,
    textAlign: 'center',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: 'rgba(220, 76, 94, 0.08)',
  },
  deleteText: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: colors.danger,
  },
});
