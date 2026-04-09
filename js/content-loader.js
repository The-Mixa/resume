import { apiUrl, CONFIG } from './config.js';
import { pick, formatAbsoluteDate } from './content-helpers.js';

export { pick, formatAbsoluteDate };

let cached = null;

function getLang() {
  return document.documentElement.lang === 'en' ? 'en' : 'ru';
}

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

export function getSiteContent() {
  return cached;
}

async function mdToSafeHtml(md) {
  if (!md?.trim()) return '';
  const [{ marked }, { default: DOMPurify }] = await Promise.all([import('marked'), import('dompurify')]);
  const raw = marked.parse(md, { async: false, mangle: false, headerIds: false });
  return DOMPurify.sanitize(raw);
}

function applyMetaTags(data) {
  const meta = data.meta || {};
  const lang = getLang();
  const base = (meta.siteUrl || window.location.origin).replace(/\/$/, '');
  const path = window.location.pathname || '/';
  const canonical = `${base}${path === '/' ? '' : path}`;
  const ogImagePath = meta.ogImage || '/og-cover.png';
  const ogImage = ogImagePath.startsWith('http') ? ogImagePath : `${base}${ogImagePath.startsWith('/') ? '' : '/'}${ogImagePath}`;

  const descObj = meta.description;
  const description = descObj && typeof descObj === 'object' ? pick(descObj, lang) : typeof descObj === 'string' ? descObj : '';
  const header = data.header || {};
  const name = pick(header.name, lang) || '';
  const titleStr = pick(header.title, lang) || '';
  const ogTitle = name && titleStr ? `${name} — ${titleStr.replace(/\s*\|\s*/g, ' · ')}` : document.title;

  const metaDesc = document.getElementById('meta-description');
  const ogUrl = document.getElementById('meta-og-url');
  const ogIm = document.getElementById('meta-og-image');
  const ogTitleEl = document.getElementById('meta-og-title');
  const ogDescEl = document.getElementById('meta-og-description');
  const canonicalLink = document.getElementById('link-canonical');
  const twTitle = document.getElementById('meta-tw-title');
  const twDesc = document.getElementById('meta-tw-desc');

  if (metaDesc && description) metaDesc.setAttribute('content', description);
  if (ogUrl) ogUrl.setAttribute('content', canonical);
  if (ogIm) ogIm.setAttribute('content', ogImage);
  if (ogTitleEl) ogTitleEl.setAttribute('content', ogTitle);
  if (ogDescEl && description) ogDescEl.setAttribute('content', description);
  if (canonicalLink) canonicalLink.setAttribute('href', canonical);
  if (twTitle) twTitle.setAttribute('content', ogTitle);
  if (twDesc && description) twDesc.setAttribute('content', description);

  if (name) {
    const pageTitle = lang === 'en' ? `${name} — Resume` : `${name} — Резюме`;
    document.title = pageTitle;
  }
}

export async function loadSiteContent() {
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
  if (!data) return null;
  cached = data;
  applyMetaTags(data);
  applyVisibility(data.visibility || {});
  renderHero(data);
  renderSkillMetrics(data.skillMetrics || []);
  renderStackProof(data.stackProof || [], data.projects || []);
  renderSoftSkillCases(data.softSkillCases || []);
  await renderProjects(data.projects || []);
  renderEducation(data.education || []);
  window.dispatchEvent(new CustomEvent('resume:contentloaded', { detail: { data } }));
  return data;
}

function applyVisibility(vis) {
  const map = {
    about: '#about',
    skills: '#skills',
    projects: '#projects',
    education: '#education',
    contacts: '#contacts',
  };
  Object.entries(map).forEach(([key, sel]) => {
    const section = document.querySelector(sel);
    const nav = document.querySelector(`.nav__link[data-nav-section="${key}"]`);
    const hidden = vis[key] === false;
    section?.classList.toggle('is-hidden', hidden);
    nav?.classList.toggle('is-hidden', hidden);
  });
}

function renderHero(data) {
  const badgesEl = document.getElementById('hero-badges');
  const dl = document.getElementById('hero-availability-dl');
  const hero = data.hero || {};
  const lang = getLang();
  const header = data.header || {};
  const pos = data.positioning || {};

  const logoName = document.querySelector('.logo__name');
  if (logoName && header.name) {
    logoName.textContent = pick(header.name, lang);
  }

  const titleLine = document.querySelector('.hero__title-line');
  const titleAccent = document.querySelector('.hero__title-accent');
  const titleStr = pick(header.title, lang);
  if (titleLine && titleAccent && titleStr) {
    const parts = titleStr.split('|').map((s) => s.trim()).filter(Boolean);
    titleLine.textContent = parts[0] || '';
    if (parts.length > 1) {
      titleAccent.textContent = parts[1].startsWith('|') ? parts[1] : `| ${parts[1]}`;
    } else {
      titleAccent.textContent = '';
    }
  }

  const descEl = document.getElementById('hero-description');
  if (descEl) {
    const heroDesc = hero.description ? pick(hero.description, lang) : '';
    if (heroDesc) descEl.textContent = heroDesc;
  }

  const elevEl = document.getElementById('hero-elevator');
  if (elevEl) {
    const t = pick(pos.elevator, lang);
    elevEl.textContent = t || '';
    elevEl.hidden = !t;
  }

  const careerEl = document.getElementById('hero-career-intent');
  if (careerEl) {
    const t = pick(pos.careerIntent, lang);
    careerEl.textContent = t || '';
    careerEl.hidden = !t;
  }

  const metaRow = document.getElementById('hero-meta-row');
  if (metaRow) {
    const loc = header.location || '';
    const dict = CONFIG.i18n.dict[lang] || CONFIG.i18n.dict[CONFIG.i18n.fallback];
    const grad = dict['hero.meta.grad'] || '2026';
    const fmt = dict['hero.meta.format'] || '';
    metaRow.innerHTML = [
      loc
        ? `<span class="meta-item" data-emoji><span class="meta-item__ic" aria-hidden="true">📍</span><span>${esc(loc)}</span></span>`
        : '',
      `<span class="meta-item" data-emoji><span class="meta-item__ic" aria-hidden="true">🎓</span><span>${esc(grad)}</span></span>`,
      fmt
        ? `<span class="meta-item" data-emoji><span class="meta-item__ic" aria-hidden="true">⚡</span><span>${esc(fmt)}</span></span>`
        : '',
    ]
      .filter(Boolean)
      .join('');
  }

  if (badgesEl && hero.trustBadges?.length) {
    badgesEl.innerHTML = hero.trustBadges
      .map((b) => {
        const label = esc(pick(b.label, lang));
        const href = b.href || '#';
        return `<a class="hero-badge" href="${escAttr(href)}">${label}</a>`;
      })
      .join('');
  }

  const av = hero.availability || {};
  if (dl && (av.format || av.hours || av.roles || av.timeline)) {
    const rows = [
      ['format', av.format],
      ['hours', av.hours],
      ['roles', av.roles],
      ['timeline', av.timeline],
    ];
    const dict = CONFIG.i18n.dict[lang] || CONFIG.i18n.dict[CONFIG.i18n.fallback];
    dl.innerHTML = rows
      .filter(([, v]) => v && pick(v, lang))
      .map(([dtKey, v]) => {
        const dtLabel = dict[`availability.dt.${dtKey}`] || dtKey;
        return `<dt>${esc(dtLabel)}</dt><dd>${esc(pick(v, lang))}</dd>`;
      })
      .join('');
  }
}

function renderSkillMetrics(items) {
  const container = document.getElementById('skill-metrics-container');
  if (!container || !items.length) return;
  const lang = getLang();
  const dict = CONFIG.i18n.dict[lang] || CONFIG.i18n.dict[CONFIG.i18n.fallback];
  container.innerHTML = items
    .map((m) => {
      const name = esc(m.name || '');
      const notes = pick(m.notes, lang);
      const taskSrc = pick(m.taskSource, lang);
      const projNote = pick(m.projectsCountNote, lang);
      const y = m.years != null ? `${m.years} ${dict['metrics.years'] || ''}` : '';
      const t = m.tasksSolved != null ? `${m.tasksSolved}+ ${dict['metrics.tasks'] || ''}` : '';
      const p = m.projectsCount != null ? `${m.projectsCount} ${dict['metrics.projects'] || ''}` : '';
      const tooltip = [y, t, p, notes, taskSrc].filter(Boolean).join(' · ');
      const profileUrl = m.profileUrl && String(m.profileUrl).trim();
      const profileLabel = dict['metrics.profile'] || 'Profile';
      return `<div class="skill-metric-card" title="${escAttr(tooltip)}">
        <div class="skill-metric-card__head"><span class="skill-metric-card__name">${name}</span></div>
        <ul class="skill-metric-card__stats">
          ${m.years != null ? `<li><span class="skill-metric-card__label">${dict['metrics.years'] || ''}</span> <strong>${m.years}</strong></li>` : ''}
          ${m.tasksSolved != null ? `<li><span class="skill-metric-card__label">${dict['metrics.tasks'] || ''}</span> <strong>${m.tasksSolved}+</strong></li>` : ''}
          ${m.projectsCount != null ? `<li><span class="skill-metric-card__label">${dict['metrics.projects'] || ''}</span> <strong>${m.projectsCount}</strong>${projNote ? ` <span class="skill-metric-card__hint" title="${escAttr(projNote)}">ⓘ</span>` : ''}</li>` : ''}
        </ul>
        ${notes ? `<p class="skill-metric-card__notes">${esc(notes)}</p>` : ''}
        ${taskSrc ? `<p class="skill-metric-card__source">${esc(taskSrc)}</p>` : ''}
        ${profileUrl ? `<p class="skill-metric-card__profile"><a href="${escAttr(profileUrl)}" target="_blank" rel="noopener noreferrer">${esc(profileLabel)} →</a></p>` : ''}
      </div>`;
    })
    .join('');
}

function renderSoftSkillCases(cases) {
  const container = document.getElementById('soft-skills-container');
  if (!container) return;
  const lang = getLang();
  if (!cases.length) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = cases
    .map((c) => {
      const title = esc(pick(c.title, lang));
      const story = esc(pick(c.story, lang));
      const link = c.link && String(c.link).trim();
      const linkLbl = CONFIG.i18n.dict[lang]?.['soft.case.link'] || 'Link';
      const linkHtml = link
        ? ` <a class="soft-case__link" href="${escAttr(link)}" target="_blank" rel="noopener noreferrer">${esc(linkLbl)} →</a>`
        : '';
      return `<li class="soft-case"><strong class="soft-case__title">${title}</strong> <span class="soft-case__story">${story}</span>${linkHtml}</li>`;
    })
    .join('');
}

function renderStackProof(rows, projects) {
  const container = document.getElementById('stack-proof-container');
  if (!container || !rows.length) return;
  const lang = getLang();
  const byId = Object.fromEntries((projects || []).map((p) => [p.id, p]));

  container.innerHTML = rows
    .map((row) => {
      const tech = esc(pick(row.technology, lang));
      const proof = esc(pick(row.proof, lang));
      const links = (row.projectIds || [])
        .map((id) => {
          const p = byId[id];
          if (!p) return '';
          const title = esc(pick(p.title, lang));
          return `<a class="stack-proof__link" href="#project-${esc(id)}">${title}</a>`;
        })
        .filter(Boolean);
      return `<div class="stack-proof__row" title="${escAttr(pick(row.proof, lang))}">
        <div class="stack-proof__line">
          <span class="stack-proof__tech">${tech}</span>
          <span class="stack-proof__arrow" aria-hidden="true">→</span>
          <span class="stack-proof__proof">${proof}</span>
        </div>
        ${links.length ? `<div class="stack-proof__refs">${links.join('')}</div>` : ''}
      </div>`;
    })
    .join('');
}

async function renderProjects(projects) {
  const container = document.getElementById('projects-container');
  if (!container) return;
  const lang = getLang();
  const dict = CONFIG.i18n.dict[lang] || CONFIG.i18n.dict[CONFIG.i18n.fallback];
  const visible = projects.filter((p) => p.visible !== false);
  visible.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  container.innerHTML = visible
    .map((p) => {
      const tags = (p.tags || []).join(',');
      const title = esc(pick(p.title, lang));
      const desc = esc(pick(p.description, lang));
      const metricsRaw = pick(p.metrics, lang);
      const metrics = metricsRaw
        ? metricsRaw
            .split('|')
            .map((x) => x.trim())
            .filter(Boolean)
        : [];
      const stack = p.stack || [];
      const date = p.date || '';
      const abs = formatAbsoluteDate(date, lang);
      const link = p.link ? String(p.link).trim() : '';
      const mdObj = p.detailMarkdown;
      const mdRaw = mdObj && typeof mdObj === 'object' ? pick(mdObj, lang) : typeof mdObj === 'string' ? mdObj : '';
      const hasMd = Boolean(mdRaw?.trim());
      const linkHtml = link
        ? `<a href="${esc(link)}" target="_blank" rel="noopener noreferrer" class="project-card__link">${dict['project.link'] || 'Сайт →'}</a>`
        : '';
      const summaryLabel = dict['project.more'] || 'Подробнее';
      const detailsBlock = hasMd
        ? `<details class="project-card__details">
        <summary class="project-card__more">${esc(summaryLabel)}</summary>
        <div class="project-card__md markdown-body" data-md="1"></div>
      </details>`
        : '';
      const cardTooltip = escAttr(pick(p.description, lang));
      const pidRaw = String(p.id ?? '').replace(/[^a-zA-Z0-9_-]/g, '-');
      return `<article class="project-card" id="project-${esc(pidRaw)}" data-tags="${esc(tags)}" data-date="${esc(date)}" title="${cardTooltip}">
        <div class="project-card__header">
          <h3 class="project-card__title">${title}</h3>
          <time class="project-card__date" datetime="${esc(date)}">${esc(abs)}</time>
        </div>
        <p class="project-card__desc">${desc}</p>
        <div class="project-card__meta">${metrics.map((m) => `<span class="meta-badge">${esc(m)}</span>`).join('')}</div>
        <div class="project-card__tags">${stack.map((t) => `<span class="tag tag--small">${esc(t)}</span>`).join('')}</div>
        ${detailsBlock}
        ${linkHtml}
      </article>`;
    })
    .join('');

  container.querySelectorAll('article.project-card').forEach((article) => {
    const mdEl = article.querySelector('[data-md="1"]');
    if (!mdEl) return;
    const pid = article.id?.replace(/^project-/, '') || '';
    const p = visible.find((x) => String(x.id) === pid);
    const mdObj = p?.detailMarkdown;
    const mdRaw = mdObj && typeof mdObj === 'object' ? pick(mdObj, getLang()) : typeof mdObj === 'string' ? mdObj : '';
    if (mdRaw?.trim()) {
      mdToSafeHtml(mdRaw).then((html) => {
        mdEl.innerHTML = html;
      });
    }
  });
}

function renderEducation(items) {
  const container = document.getElementById('education-timeline');
  if (!container) return;
  const lang = getLang();
  const dict = CONFIG.i18n.dict[lang] || CONFIG.i18n.dict[CONFIG.i18n.fallback];
  const credLbl = dict['education.credential'] || 'Сертификат / ссылка';
  const sorted = [...items].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  container.innerHTML = sorted
    .map((item) => {
      const title = esc(pick(item.title, lang));
      const desc = esc(pick(item.description, lang));
      const outcome = pick(item.outcome, lang);
      const date = item.date || '';
      const abs = formatAbsoluteDate(date, lang);
      const cred = item.credentialUrl && String(item.credentialUrl).trim();
      const credHtml = cred
        ? `<p class="timeline-item__credential"><a href="${escAttr(cred)}" target="_blank" rel="noopener noreferrer">${esc(credLbl)} →</a></p>`
        : '';
      return `<div class="timeline-item" data-date="${esc(date)}">
        <div class="timeline-item__header">
          <h3 class="timeline-item__title">${title}</h3>
          <time class="timeline-item__date" datetime="${esc(date)}">${esc(abs)}</time>
        </div>
        <p class="timeline-item__desc">${desc}</p>
        ${outcome ? `<p class="timeline-item__outcome">${esc(outcome)}</p>` : ''}
        ${credHtml}
      </div>`;
    })
    .join('');
}

export function bindContentLangRefresh() {
  window.addEventListener('resume:langchange', async () => {
    if (!cached) return;
    applyMetaTags(cached);
    renderHero(cached);
    renderSkillMetrics(cached.skillMetrics || []);
    renderStackProof(cached.stackProof || [], cached.projects || []);
    renderSoftSkillCases(cached.softSkillCases || []);
    await renderProjects(cached.projects || []);
    renderEducation(cached.education || []);
    window.dispatchEvent(new CustomEvent('resume:contentloaded', { detail: { data: cached } }));
  });
}
