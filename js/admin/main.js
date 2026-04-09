import { initAuth } from './auth.js';
import { loadContent } from './storage.js';
import { initEditor } from './editor.js';

document.addEventListener('DOMContentLoaded', () => {
  initAuth(async () => {
    try {
      await loadContent();
      initEditor();
    } catch (e) {
      console.error(e);
      const dash = document.getElementById('admin-dashboard');
      if (dash) dash.innerHTML = '<h2>⚠️ Ошибка загрузки данных</h2><p>Проверьте data/content.json и сервер</p>';
    }
  });
});
