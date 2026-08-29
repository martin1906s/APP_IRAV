/** Colores del subrayador — los más usados en lectura bíblica */
export const HIGHLIGHT_COLORS = [
  { id: 'amber', hex: '#E8A84C', label: 'Ámbar' },
  { id: 'rose', hex: '#D4628A', label: 'Rosa' },
  { id: 'teal', hex: '#3DBFB0', label: 'Verde agua' },
  { id: 'lavender', hex: '#9B8FE8', label: 'Lavanda' },
  { id: 'sky', hex: '#5B9FD4', label: 'Cielo' },
] as const;

export type HighlightColorId = (typeof HIGHLIGHT_COLORS)[number]['id'];

export const DEFAULT_HIGHLIGHT_COLOR = HIGHLIGHT_COLORS[0].hex;
