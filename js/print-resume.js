import { apiUrl, CONFIG } from './config.js';
import { pick, formatAbsoluteDate } from './content-helpers.js';

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  return d.innerHTML;
}

function escAttr(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

async function loadContent() {
  let data = null;
  try {
    const res = await fetch(apiUrl(CONFIG.paths.contentApi), { credentials: 'same-origin' });
    if (res.ok) data = await res.json();
  } catch {
    /* ignore */
  }
  if (!data) {
    try {
      const res = await fetch(CONFIG.paths.data);
      if (res.ok) data = await res.json();
    } catch {
      /* ignore */
    }
  }
  return data;
}

function render(data) {
  const lang = document.documentElement.lang === 'en' ? 'en' : 'ru';
  const header = data.header || {};
  const pos = data.positioning || {};
  const hero = data.hero || {};
  const contacts = data.contacts || {};

  const name = pick(header.name, lang);
  const titleStr = pick(header.title, lang);
  const tagline = titleStr ? titleStr.replace(/\s*\|\s*/g, ' — ') : '';

  document.getElementById('print-name').textContent = name;
  const tagEl = document.getElementById('print-tagline');
  if (tagEl) {
    tagEl.textContent = tagline;
    tagEl.hidden = !tagline;
  }

  const elElev = document.getElementById('print-elevator');
  const tElev = pick(pos.elevator, lang);
  if (elElev) {
    elElev.textContent = tElev;
    elElev.hidden = !tElev;
  }

  const elDesc = document.getElementById('print-description');
  const heroDesc = hero.description ? pick(hero.description, lang) : '';
  if (elDesc) elDesc.textContent = heroDesc;

  const elCareer = document.getElementById('print-career');
  const tCareer = pick(pos.careerIntent, lang);
  if (elCareer) {
    elCareer.textContent = tCareer;
    elCareer.hidden = !tCareer;
  }

  const cEl = document.getElementById('print-contacts');
  const bits = [];
  (contacts.email || []).forEach((e) => {
    const raw = String(e).trim();
    if (!raw) return;
    bits.push(`<a href="mailto:${escAttr(raw)}">${esc(raw)}</a>`);
  });
  if (contacts.telegram) bits.push(`Telegram: ${esc(String(contacts.telegram))}`);
  if (contacts.github) bits.push(`<a href="${esc(contacts.github)}">GitHub</a>`);
  if (contacts.kaggle) bits.push(`<a href="${esc(contacts.kaggle)}">Kaggle</a>`);
  if (cEl) cEl.innerHTML = bits.join(' · ');

  const projEl = document.getElementById('print-projects');
  const projects = (data.projects || []).filter((p) => p.visible !== false);
  projects.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  if (projEl) {
    projEl.innerHTML = projects
      .map((p) => {
        const title = esc(pick(p.title, lang));
        const desc = esc(pick(p.description, lang));
        const d = p.date || '';
        const abs = formatAbsoluteDate(d, lang);
        const stack = (p.stack || []).join(', ');
        return `<article class="print-project">
          <h3>${title}</h3>
          <div class="date">${esc(abs)}</div>
          <p>${desc}</p>
          ${stack ? `<p class="mono" style="font-size:0.85rem">${esc(stack)}</p>` : ''}
        </article>`;
      })
      .join('');
  }

  const eduEl = document.getElementById('print-education');
  const eduItems = [...(data.education || [])].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  if (eduEl) {
    eduEl.innerHTML = eduItems
      .map((item) => {
        const title = esc(pick(item.title, lang));
        const desc = esc(pick(item.description, lang));
        const outcome = pick(item.outcome, lang);
        const d = item.date || '';
        const abs = formatAbsoluteDate(d, lang);
        return `<div class="print-edu">
          <strong>${title}</strong> — ${esc(abs)}
          <p>${desc}</p>
          ${outcome ? `<p>${esc(outcome)}</p>` : ''}
        </div>`;
      })
      .join('');
  }

  const metEl = document.getElementById('print-metrics');
  const metrics = data.skillMetrics || [];
  if (metEl) {
    metEl.innerHTML = metrics
      .map((m) => {
        const name = esc(m.name || '');
        const y = m.years != null ? `${m.years} yrs` : '';
        const t = m.tasksSolved != null ? `${m.tasksSolved}+ tasks` : '';
        const p = m.projectsCount != null ? `${m.projectsCount} proj` : '';
        const line = [y, t, p].filter(Boolean).join(' · ');
        return `<div class="print-metric"><strong>${name}</strong><br/>${esc(line)}</div>`;
      })
      .join('');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadContent();
  if (!data) {
    document.getElementById('print-root').innerHTML = '<p>Не удалось загрузить данные.</p>';
    return;
  }
  render(data);
  document.getElementById('print-btn')?.addEventListener('click', () => window.print());
});
