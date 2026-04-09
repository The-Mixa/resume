import { apiUrl, CONFIG, storage } from '../config.js';

export function initAuth(onSuccess) {
  const loginSec = document.getElementById('admin-login');
  const dash = document.getElementById('admin-dashboard');
  const form = document.getElementById('login-form');
  const pass = document.getElementById('admin-password');
  const err = document.getElementById('login-error');
  const outBtn = document.getElementById('logout-btn');

  if (window.location.protocol === 'file:') {
    err.hidden = false;
    err.textContent =
      '⚠️ Откройте через сервер: uvicorn server.main:app --reload (http://127.0.0.1:8000/admin.html)';
    return;
  }

  async function checkSession() {
    try {
      const res = await fetch(apiUrl('/api/auth/status'), { credentials: 'same-origin' });
      if (!res.ok) return false;
      const j = await res.json();
      return Boolean(j.authenticated);
    } catch {
      return false;
    }
  }

  async function showDashboardIfAuthed() {
    if (await checkSession()) {
      loginSec.hidden = true;
      dash.hidden = false;
      onSuccess?.();
      return true;
    }
    return false;
  }

  showDashboardIfAuthed();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Проверка...';
    btn.disabled = true;
    err.hidden = true;
    try {
      const res = await fetch(apiUrl(CONFIG.paths.loginApi), {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass.value }),
      });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(res.status === 401 ? 'Wrong password' : detail);
      }
      storage.set(CONFIG.paths.admin.storageKey, true);
      loginSec.hidden = true;
      dash.hidden = false;
      onSuccess?.();
    } catch (e) {
      err.hidden = false;
      err.textContent = '❌ ' + (e.message?.includes('Wrong') ? 'Неверный пароль' : 'Ошибка сервера');
    } finally {
      btn.textContent = 'Войти';
      btn.disabled = false;
    }
  });

  outBtn?.addEventListener('click', async () => {
    try {
      await fetch(apiUrl(CONFIG.paths.logoutApi), { method: 'POST', credentials: 'same-origin' });
    } catch {
      /* ignore */
    }
    storage.remove(CONFIG.paths.admin.storageKey);
    location.reload();
  });

  document.getElementById('preview-btn')?.addEventListener('click', () => {
    window.open('index.html', '_blank');
  });
}
