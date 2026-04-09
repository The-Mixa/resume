/** Shared pure helpers for index + print page */
export function pick(obj, lang) {
  if (!obj || typeof obj !== 'object') return '';
  return obj[lang] ?? obj.ru ?? obj.en ?? '';
}

export function formatAbsoluteDate(iso, lang) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'ru-RU', {
    month: 'long',
    year: 'numeric',
  }).format(d);
}
