import { CONFIG, storage } from './config.js';

const KEY = 'resume_tone_sober';

function applyTone(sober) {
  document.body.classList.toggle('tone-sober', Boolean(sober));
  const btn = document.getElementById('tone-sober-toggle');
  if (btn) btn.setAttribute('aria-pressed', sober ? 'true' : 'false');
}

function label() {
  const lang = document.documentElement.lang === 'en' ? 'en' : 'ru';
  const dict = CONFIG.i18n.dict[lang] || CONFIG.i18n.dict[CONFIG.i18n.fallback];
  return dict['tone.sober'] || '';
}

export function initToneSober() {
  const btn = document.getElementById('tone-sober-toggle');
  if (!btn) return;

  const saved = storage.get(KEY);
  applyTone(saved === true);

  btn.setAttribute('aria-label', label());
  btn.setAttribute('title', label());

  btn.addEventListener('click', () => {
    const next = !document.body.classList.contains('tone-sober');
    storage.set(KEY, next);
    applyTone(next);
  });

  window.addEventListener('resume:langchange', () => {
    btn.setAttribute('aria-label', label());
    btn.setAttribute('title', label());
  });
}
