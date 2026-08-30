import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenShell } from '../../templates/ScreenShell';
import { AppHeader } from '../../organisms/AppHeader';
import { AppText } from '../../atoms/AppText';
import { AppInput } from '../../atoms/AppInput';
import { AppButton } from '../../atoms/AppButton';
import { FormField } from '../../molecules/FormField';
import { Spacer } from '../../atoms/Spacer';
import { container } from '../../../composition/container';
import { colors, fonts, radius, spacing } from '../../theme';

type RouteParams = { announcementId?: string };

/** Crear o editar anuncio con imagen opcional */
export function AdminAnnouncementFormScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const announcementId = (route.params as RouteParams | undefined)?.announcementId;
  const isEdit = !!announcementId;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  const load = useCallback(async () => {
    if (!announcementId) return;
    setLoading(true);
    try {
      const item = await container.admin.getAnnouncement(announcementId);
      setTitle(item.title);
      setBody(item.body);
      setImageUri(item.imageUrl);
      setRemoveImage(false);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el anuncio.');
    } finally {
      setLoading(false);
    }
  }, [announcementId]);

  useEffect(() => {
    load();
  }, [load]);

  const valid = useMemo(
    () => title.trim().length >= 3 && body.trim().length >= 5,
    [title, body],
  );

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos para adjuntar una imagen.');
        return;
      }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setImageUri(asset.uri);
    setImageBase64(asset.base64 ?? null);
    setImageMimeType(asset.mimeType ?? 'image/jpeg');
    setRemoveImage(false);
    } catch {
      Alert.alert('Error', 'No se pudo abrir la galería.');
    }
  };

  const clearImage = () => {
    setImageUri(null);
    setImageBase64(null);
    setImageMimeType(null);
    setRemoveImage(true);
  };

  const save = async (sendNow: boolean) => {
    if (!valid || busy) return;
    setBusy(true);
    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        ...(imageBase64 && imageMimeType
          ? { imageBase64, imageMimeType }
          : {}),
        ...(removeImage ? { removeImage: true } : {}),
      };

      if (isEdit && announcementId) {
        await container.admin.updateAnnouncement(announcementId, payload);
        if (sendNow) {
          const result = await container.admin.sendAnnouncement(announcementId);
          Alert.alert('Enviado', `Notificación enviada a ${result.recipientsCount} dispositivo(s).`);
        }
      } else {
        const result = await container.admin.createAnnouncement({ ...payload, sendNow });
        if (sendNow && result && 'recipientsCount' in result) {
          Alert.alert('Enviado', `Notificación enviada a ${result.recipientsCount} dispositivo(s).`);
        }
      }
      nav.goBack();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el anuncio.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <ScreenShell>
        <AppHeader title="Anuncio" onBack={() => nav.goBack()} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <AppHeader
          title={isEdit ? 'Editar anuncio' : 'Nuevo anuncio'}
          subtitle="Título, mensaje e imagen opcional"
          onBack={() => nav.goBack()}
        />

        <FormField label="Título" kind="text" value={title} onChangeText={setTitle} />
        <Spacer size="sm" />

        <AppText variant="caption" style={styles.label}>
          Mensaje
        </AppText>
        <AppInput
          value={body}
          onChangeText={setBody}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          style={styles.bodyInput}
          placeholder="Escribe el comunicado para la comunidad…"
        />
        <Spacer size="md" />

        <AppText variant="caption" style={styles.label}>
          Imagen (opcional)
        </AppText>
        {imageUri ? (
          <View style={styles.imageWrap}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            <View style={styles.imageActions}>
              <Pressable style={styles.imageBtn} onPress={pickImage}>
                <Ionicons name="image-outline" size={18} color={colors.text} />
                <AppText style={styles.imageBtnLabel}>Cambiar</AppText>
              </Pressable>
              <Pressable style={styles.imageBtn} onPress={clearImage}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
                <AppText style={[styles.imageBtnLabel, { color: colors.danger }]}>Quitar</AppText>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable style={styles.pickImage} onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color={colors.accent} />
            <AppText style={styles.pickLabel}>Seleccionar imagen</AppText>
          </Pressable>
        )}

        <Spacer size="lg" />
        <AppButton
          label={busy ? 'Guardando…' : 'Guardar borrador'}
          onPress={() => save(false)}
          disabled={!valid || busy}
        />
        <Spacer size="sm" />
        <AppButton
          label={busy ? 'Enviando…' : 'Publicar y notificar'}
          onPress={() => save(true)}
          disabled={!valid || busy}
        />
        <Spacer size="xxl" />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl },
  label: { color: colors.textMuted, marginBottom: spacing.xs },
  bodyInput: { minHeight: 140, paddingTop: spacing.md },
  pickImage: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgCard,
  },
  pickLabel: {
    fontFamily: fonts.sansMedium,
    color: colors.accent,
    textTransform: 'none',
    letterSpacing: 0,
  },
  imageWrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  image: { width: '100%', height: 180 },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  imageBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  imageBtnLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.text,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
