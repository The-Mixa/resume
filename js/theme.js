import { CONFIG, storage } from './config.js';

const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = themeToggleBtn?.querySelector('.theme-icon');
const mediaQuery = window.matchMedia(CONFIG.theme.systemQuery);

function getSystemTheme() {
  return mediaQuery.matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeIcon.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
  }
  storage.set(CONFIG.theme.key, theme);
  document.body.classList.add('theme-loaded');
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || getSystemTheme();
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

export function initTheme() {
  const saved = storage.get(CONFIG.theme.key);
  applyTheme(saved || getSystemTheme());
  themeToggleBtn?.addEventListener('click', toggleTheme);
  mediaQuery.addEventListener('change', (e) => {
    if (!storage.get(CONFIG.theme.key)) applyTheme(e.matches ? 'dark' : 'light');
  });
}
