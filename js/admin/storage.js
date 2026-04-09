import { apiUrl, CONFIG } from '../config.js';

let data = null;
let orig = null;

export async function loadContent() {
  if (data) return data;
  try {
    const res = await fetch(apiUrl(CONFIG.paths.contentApi), { credentials: 'same-origin' });
    if (!res.ok) throw new Error(String(res.status));
    orig = await res.json();
    data = structuredClone(orig);
    if (!data?.meta || !data?.header) throw new Error('Invalid structure');
    return data;
  } catch (e) {
    console.warn('Admin: API content unavailable, trying static JSON', e);
    try {
      const res = await fetch(CONFIG.paths.data);
      if (res.ok) {
        orig = await res.json();
        data = structuredClone(orig);
        if (data?.meta && data?.header) return data;
      }
    } catch {
      /* ignore */
    }
    data = {
      meta: { lastUpdated: new Date().toISOString(), version: '0.0.0' },
      header: { name: { ru: '', en: '' }, title: { ru: '', en: '' }, location: '' },
      contacts: {},
      projects: [],
      education: [],
      visibility: {},
    };
    return data;
  }
}

export function getContent() {
  return data;
}

export async function putContentToServer() {
  if (!data) return { ok: false, error: 'no data' };
  const res = await fetch(apiUrl(CONFIG.paths.contentApi), {
    method: 'PUT',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
  orig = structuredClone(data);
  return { ok: true };
}

export function updateContent(path, value) {
  if (!data) return false;
  if (!data.meta) data.meta = {};
  const k = path.split('.');
  let c = data;
  for (let i = 0; i < k.length - 1; i++) {
    if (!c[k[i]]) c[k[i]] = {};
    c = c[k[i]];
  }
  c[k[k.length - 1]] = value;
  data.meta.lastUpdated = new Date().toISOString();
  return true;
}

export function updateProject(idx, obj) {
  if (!data?.projects) return false;
  if (idx === -1) {
    data.projects.push({ id: crypto.randomUUID(), visible: true, ...obj });
  } else {
    data.projects[idx] = { ...data.projects[idx], ...obj };
  }
  data.meta.lastUpdated = new Date().toISOString();
  return true;
}

export function toggleSectionVisibility(key, val) {
  if (!data) return false;
  if (!data.visibility) data.visibility = {};
  data.visibility[key] = val;
  data.meta.lastUpdated = new Date().toISOString();
  return true;
}

export function exportContent() {
  if (!data) return;
  const b = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const u = URL.createObjectURL(b);
  const a = document.createElement('a');
  a.href = u;
  a.download = `content_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(u);
}
