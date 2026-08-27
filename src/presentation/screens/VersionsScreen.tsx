import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BibleVersion } from '../../domain/entities/BibleVersion';
import { container } from '../../composition/container';
import { ScreenShell } from '../templates/ScreenShell';
import { AppHeader } from '../organisms/AppHeader';
import { VersionCard } from '../molecules/VersionCard';
import { SearchField } from '../molecules/SearchField';
import { Spacer } from '../atoms/Spacer';
import { AppText } from '../atoms/AppText';
import { colors, fonts, spacing } from '../theme';

/** Pantalla: elegir versión */
export function VersionsScreen() {
  const nav = useNavigation<any>();
  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [preferredId, setPreferredId] = useState<string | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    container.getVersions.execute().then(setVersions);
    container.getProfile.execute().then((p) => {
      if (p) setPreferredId(p.preferredVersionId);
    });
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
    if (!preferredId) return list;
    return [...list].sort((a, b) => {
      if (a.id === preferredId) return -1;
      if (b.id === preferredId) return 1;
      return 0;
    });
  }, [q, versions, preferredId]);

  const openPreferred = () => {
    if (!preferredId) return;
    const version = versions.find((v) => v.id === preferredId);
    if (!version) return;
    nav.navigate('Books', { versionId: version.id, versionName: version.name });
  };

  return (
    <ScreenShell>
      <AppHeader title="Biblia" subtitle="Elige tu versión" />
      {preferredId ? (
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
        renderItem={({ item, index }) => (
          <VersionCard
            version={item}
            index={index}
            onPress={() => nav.navigate('Books', { versionId: item.id, versionName: item.name })}
          />
        )}
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
});
