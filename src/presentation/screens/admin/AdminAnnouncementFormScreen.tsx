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
import { colors, fonts, radius, spacing, shadows } from '../../theme';

type RouteParams = { announcementId?: string };

function sentMessage(result: { recipientsCount?: number; targetedUsers?: number; targetedDevices?: number }) {
  const targeted = result.targetedDevices ?? result.targetedUsers ?? 0;
  const sent = result.recipientsCount ?? 0;
  return {
    title: targeted === 0 ? 'Anuncio publicado' : 'Notificación enviada',
    body:
      targeted === 0
        ? 'El anuncio quedó publicado. Los dispositivos recibirán alertas al iniciar sesión desde el APK oficial.'
        : `Se envió a ${sent} de ${targeted} dispositivo(s) registrados.`,
  };
}

/** Rediseño de formulario para crear/editar anuncios */
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
        Alert.alert('Permiso requerido', 'Necesitamos acceso a la galería para adjuntar la foto del anuncio.');
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
      Alert.alert('Error', 'No se pudo abrir la galería de imágenes.');
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
        ...(imageBase64 && imageMimeType ? { imageBase64, imageMimeType } : {}),
        ...(removeImage ? { removeImage: true } : {}),
      };

      if (isEdit && announcementId) {
        await container.admin.updateAnnouncement(announcementId, payload);
        if (sendNow) {
          const result = await container.admin.sendAnnouncement(announcementId);
          const info = sentMessage(result);
          Alert.alert(info.title, info.body);
        }
      } else {
        const result = await container.admin.createAnnouncement({ ...payload, sendNow });
        if (sendNow && result && 'recipientsCount' in result) {
          const info = sentMessage(result);
          Alert.alert(info.title, info.body);
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
        <AppHeader title="Cargando anuncio…" onBack={() => nav.goBack()} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <AppHeader
          title={isEdit ? 'Editar Anuncio' : 'Nuevo Anuncio'}
          subtitle="Redacta y Notifica a la Comunidad"
          onBack={() => nav.goBack()}
        />

        <View style={styles.card}>
          <FormField
            label="Título del comunicado"
            kind="text"
            value={title}
            onChangeText={setTitle}
            placeholder="Ej: Retiro Espiritual de Jóvenes"
          />

          <Spacer size="sm" />
          <AppText variant="caption" style={styles.label}>
            Mensaje de la notificación
          </AppText>
          <AppInput
            value={body}
            onChangeText={setBody}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={styles.bodyInput}
            placeholder="Escribe el mensaje completo que recibirán los jóvenes en sus teléfonos…"
          />

          <Spacer size="md" />
          <AppText variant="caption" style={styles.label}>
            Imagen de cabecera (Bucket announcements)
          </AppText>
          {imageUri ? (
            <View style={styles.imageWrap}>
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
              <View style={styles.imageActions}>
                <Pressable style={styles.imageBtn} onPress={pickImage}>
                  <Ionicons name="image-outline" size={17} color={colors.text} />
                  <AppText style={styles.imageBtnLabel}>Cambiar</AppText>
                </Pressable>
                <Pressable style={styles.imageBtn} onPress={clearImage}>
                  <Ionicons name="trash-outline" size={17} color={colors.danger} />
                  <AppText style={[styles.imageBtnLabel, { color: colors.danger }]}>Quitar</AppText>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable style={styles.pickImage} onPress={pickImage}>
              <View style={styles.pickIconWrap}>
                <Ionicons name="cloud-upload-outline" size={26} color={colors.purple} />
              </View>
              <AppText style={styles.pickTitle}>Subir imagen</AppText>
              <AppText muted style={styles.pickHint}>JPG, PNG (máx. 5MB) para la notificación</AppText>
            </Pressable>
          )}
        </View>

        <Spacer size="lg" />
        <AppButton
          label={busy ? 'Guardando…' : 'Guardar como borrador'}
          variant="outline"
          onPress={() => save(false)}
          disabled={!valid || busy}
        />
        <Spacer size="sm" />
        <AppButton
          label={busy ? 'Enviando…' : 'Publicar y Enviar Notificación Push'}
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
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#EFEAE2',
    ...shadows.card,
  },
  label: { color: colors.textMuted, marginBottom: 4 },
  bodyInput: { minHeight: 120, paddingTop: spacing.md },
  pickImage: {
    borderWidth: 1.5,
    borderColor: colors.purpleSoft,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.vellum,
  },
  pickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  pickTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: colors.purple,
  },
  pickHint: {
    fontSize: 12,
  },
  imageWrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: { width: '100%', height: 180 },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.sm,
    backgroundColor: colors.bgElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  imageBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  imageBtnLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.text,
  },
});
