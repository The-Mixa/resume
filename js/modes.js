import { getSiteContent, pick } from './content-loader.js';

const STORAGE_KEY = 'resume_mode';

export function initModes() {
  const main = document.getElementById('main-sections');
  const data = getSiteContent();
  if (!main || !data?.modes) return;

  let mode = localStorage.getItem(STORAGE_KEY) || 'university';
  if (!data.modes[mode]) mode = 'university';

  const radios = document.querySelectorAll('input[name="resume-mode"]');
  radios.forEach((r) => {
    r.checked = r.value === mode;
  });

  function applyMode() {
    const cfg = data.modes[mode];
    if (!cfg?.sectionOrder) return;
    cfg.sectionOrder.forEach((sectionId) => {
      const el = document.getElementById(sectionId);
      if (el) main.appendChild(el);
    });

    document.body.classList.remove(
      'mode-emphasis-about',
      'mode-emphasis-skills',
      'mode-emphasis-projects',
      'mode-emphasis-education',
      'mode-emphasis-contacts',
    );
    if (cfg.emphasis) {
      document.body.classList.add(`mode-emphasis-${cfg.emphasis}`);
    }

    const intro = document.getElementById('hero-mode-intro');
    if (intro && cfg.intro) {
      const lang = document.documentElement.lang === 'en' ? 'en' : 'ru';
      const text = pick(cfg.intro, lang);
      intro.textContent = text || '';
      intro.hidden = !text;
    }
  }

  radios.forEach((r) => {
    r.addEventListener('change', () => {
      if (!r.checked) return;
      mode = r.value;
      localStorage.setItem(STORAGE_KEY, mode);
      applyMode();
    });
  });

  applyMode();

  window.addEventListener('resume:langchange', () => {
    const cfg = data.modes[mode];
    const intro = document.getElementById('hero-mode-intro');
    if (intro && cfg?.intro) {
      const lang = document.documentElement.lang === 'en' ? 'en' : 'ru';
      const text = pick(cfg.intro, lang);
      intro.textContent = text || '';
      intro.hidden = !text;
    }
  });
}
