import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import type { BibleVersion } from '../../domain/entities/BibleVersion';
import { container } from '../../composition/container';
import { ScreenShell } from '../templates/ScreenShell';
import { AppHeader } from '../organisms/AppHeader';
import { SearchField } from '../molecules/SearchField';
import { Spacer } from '../atoms/Spacer';
import { AppText } from '../atoms/AppText';
import { colors, fonts, spacing, radius } from '../theme';
import { Ionicons } from '@expo/vector-icons';

/** Pantalla: elegir versión o descargarla */
export function VersionsScreen({ navigation }: any) {
  const nav = navigation;
  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [installedIds, setInstalledIds] = useState<string[]>([]);
  const [preferredId, setPreferredId] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadVersions = () => {
    container.bibleAdapter.init().then(() => {
      container.getVersions.execute().then(setVersions).catch((e) => console.error(e));
      container.bibleAdapter.getInstalledVersionsIds().then(setInstalledIds).catch(() => {});
    });
  };

  useEffect(() => {
    loadVersions();
    void container.getProfile.execute().then((p) => {
      if (p) setPreferredId(p.preferredVersionId);
    }).catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = versions;
    if (term) {
      list = versions.filter(
        (v) =>
          v.name.toLowerCase().includes(term) ||
          v.shortName.toLowerCase().includes(term) ||
          v.language.toLowerCase().includes(term),
      );
    }
    return list;
  }, [q, versions]);

  const openPreferred = () => {
    if (!preferredId) return;
    const version = versions.find((v) => v.id === preferredId);
    if (!version) return;
    nav.navigate('Books', { versionId: version.id, versionName: version.name });
  };

  const handlePressVersion = async (version: BibleVersion, forceReinstall: boolean = false) => {
    const isInstalled = installedIds.includes(version.id);
    if (isInstalled && !forceReinstall) {
      nav.navigate('Books', { versionId: version.id, versionName: version.name });
      return;
    }

    if (forceReinstall) {
      await new Promise<void>((resolve, reject) => {
        Alert.alert(
          'Reinstalar', 
          `¿Deseas reinstalar ${version.name}? Esto corregirá capítulos faltantes.`,
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => reject(new Error('Cancelado')) },
            { text: 'Reinstalar', style: 'destructive', onPress: () => resolve() }
          ]
        );
      }).catch((e) => {
        if (e.message === 'Cancelado') return;
        throw e;
      });
    }

    if (downloadingId) return;
    setDownloadingId(version.id);
    try {
      let localData;
      // Mapeamos los IDs de versión a los requires estáticos. 
      // El bundler Metro empaquetará estos JSON si se usan, de lo contrario fallará graciosamente si no existen.
      // Puedes descomentar/añadir los requires que necesites.
      switch(version.id) {
        case 'PDT':
          localData = require('../../../assets/bible/PDT.json');
          break;
        case 'NTV':
          localData = require('../../../assets/bible/NTV.json');
          break;
        case 'NVI':
          localData = require('../../../assets/bible/NVI.json');
          break;
        case 'RV1960':
          localData = require('../../../assets/bible/RV1960.json');
          break;
        case 'RVR':
          localData = require('../../../assets/bible/RVR.json');
          break;
        case 'KJV':
          localData = require('../../../assets/bible/KJV.json');
          break;
        case 'BBE':
          localData = require('../../../assets/bible/BBE.json');
          break;
        case 'es-pddpt':
          localData = require('../../../assets/bibles/es-pddpt.json'); // El que bajamos con el script hoy
          break;
        default:
          throw new Error('Archivo local no encontrado para esta versión.');
      }

      // Pasamos los datos al SQLite
      await container.bibleAdapter.installLocalData(localData, version);
      
      Alert.alert('¡Éxito!', `La versión ${version.shortName} ha sido instalada y está lista para lectura offline.`);
      loadVersions();
    } catch (error) {
      console.warn(error);
      Alert.alert('Error', 'No se pudo instalar la Biblia. Asegúrate de que el archivo JSON esté en assets/bible.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <ScreenShell>
      <AppHeader title="Biblia" subtitle="Descarga o elige tu versión" />
      {preferredId && installedIds.includes(preferredId) ? (
        <Pressable onPress={openPreferred} style={styles.preferred}>
          <AppText variant="body" style={styles.preferredText}>
            Abrir {preferredId}
          </AppText>
        </Pressable>
      ) : null}
      <Spacer size="sm" />
      <SearchField value={q} onChangeText={setQ} placeholder="Buscar versión…" />
      <Spacer size="sm" />
      <FlatList
        data={filtered}
        keyExtractor={(v) => v.id}
        renderItem={({ item }) => {
          const isInstalled = installedIds.includes(item.id);
          const isDownloading = downloadingId === item.id;
          return (
            <Pressable 
              style={[styles.card, isInstalled && styles.cardInstalled]} 
              onPress={() => handlePressVersion(item)}
              onLongPress={() => {
                if (isInstalled) {
                  handlePressVersion(item, true).catch(() => {});
                }
              }}
              delayLongPress={800}
            >
              <View style={styles.cardContent}>
                <AppText variant="title" style={styles.cardTitle}>{item.name}</AppText>
                <AppText muted>{item.language}</AppText>
              </View>
              <View style={styles.cardAction}>
                {isInstalled ? (
                  <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                ) : isDownloading ? (
                  <ActivityIndicator color={colors.accent} />
                ) : (
                  <Ionicons name="cloud-download-outline" size={24} color={colors.textMuted} />
                )}
              </View>
            </Pressable>
          );
        }}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  preferred: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  preferredText: {
    color: colors.accent,
    fontFamily: fonts.sansSemi,
    textTransform: 'none',
    letterSpacing: 0,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardInstalled: {
    borderColor: colors.accent,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  cardAction: {
    marginLeft: spacing.md,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
