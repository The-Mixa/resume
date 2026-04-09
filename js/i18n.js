import { CONFIG, storage } from './config.js';

const langToggleBtn = document.getElementById('lang-toggle');
const langCurrentSpan = langToggleBtn?.querySelector('.lang-current');

function getNestedValue(obj, path) {
  return path.split('.').reduce((c, k) => (c && c[k] !== undefined ? c[k] : undefined), obj);
}

function getPreferredLanguage() {
  const saved = storage.get(CONFIG.i18n.key);
  if (saved && CONFIG.i18n.supported.includes(saved)) return saved;
  const b = navigator.language.split('-')[0];
  return CONFIG.i18n.supported.includes(b) ? b : CONFIG.i18n.fallback;
}

function translateKey(dict, path) {
  if (!path) return undefined;
  if (dict[path] !== undefined) return dict[path];
  return getNestedValue(dict, path);
}

function applyTranslations(lang) {
  const dict = CONFIG.i18n.dict[lang] || CONFIG.i18n.dict[CONFIG.i18n.fallback];
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const v = translateKey(dict, el.getAttribute('data-i18n'));
    if (v) el.textContent = v;
  });
}

function updateLangUI(lang) {
  if (langCurrentSpan) langCurrentSpan.textContent = lang.toUpperCase();
  document.documentElement.lang = lang;
}

function toggleLanguage() {
  const next = document.documentElement.lang === 'ru' ? 'en' : 'ru';
  storage.set(CONFIG.i18n.key, next);
  applyTranslations(next);
  updateLangUI(next);
  window.dispatchEvent(new CustomEvent('resume:langchange', { detail: { lang: next } }));
}

export function initI18n() {
  const lang = getPreferredLanguage();
  applyTranslations(lang);
  updateLangUI(lang);
  langToggleBtn?.addEventListener('click', toggleLanguage);
}
