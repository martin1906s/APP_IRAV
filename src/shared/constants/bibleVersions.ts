import type { BibleVersion } from '../../domain/entities/BibleVersion';

/** Versiones disponibles (ids = archivos locales / bolls) */
export const BIBLE_VERSIONS: BibleVersion[] = [
  { id: 'RV1960', name: 'Reina Valera 1960', language: 'Español', shortName: 'RV60' },
  { id: 'RVR', name: 'Reina Valera', language: 'Español', shortName: 'RVR' },
  { id: 'NVI', name: 'Nueva Versión Internacional', language: 'Español', shortName: 'NVI' },
  { id: 'PDT', name: 'Palabra de Dios para Todos', language: 'Español', shortName: 'PDT' },
  { id: 'NTV', name: 'Nueva Traducción Viviente', language: 'Español', shortName: 'NTV' },
  { id: 'LBLA', name: 'La Biblia de las Américas', language: 'Español', shortName: 'LBLA' },
  { id: 'BTX3', name: 'Biblia Textual', language: 'Español', shortName: 'BTX' },
  { id: 'RV2004', name: 'Reina Valera Gómez 2004', language: 'Español', shortName: 'RV04' },
  { id: 'KJV', name: 'King James Version', language: 'English', shortName: 'KJV' },
  { id: 'BBE', name: 'Bible in Basic English', language: 'English', shortName: 'BBE' },
];

/** Alias API remota cuando no hay JSON local */
export const REMOTE_VERSION_IDS: Record<string, string> = {
  RVR: 'RV1960',
  RV1960: 'RV1960',
  NVI: 'NVI',
  PDT: 'PDT',
  NTV: 'NTV',
  LBLA: 'LBLA',
  BTX3: 'BTX3',
  RV2004: 'RV2004',
};
