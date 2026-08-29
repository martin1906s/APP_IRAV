/** Convierte Date a ISO YYYY-MM-DD (zona local). */
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parsea ISO YYYY-MM-DD a Date local. */
export function parseDateISO(iso?: string): Date {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return new Date(2005, 0, 1);
  }
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Fecha legible en español. */
export function formatDateDisplay(iso: string): string {
  return parseDateISO(iso).toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function isValidBirthDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const d = parseDateISO(iso);
  const now = new Date();
  return d <= now && d.getFullYear() >= 1900;
}
