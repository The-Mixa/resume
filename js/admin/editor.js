import { exportContent, getContent, putContentToServer, toggleSectionVisibility, updateContent, updateProject } from './storage.js';

export function initEditor() {
  const data = getContent();
  if (!data) return;
  initTabs();
  renderTexts(data);
  renderProjects(data);
  renderVisibility(data);
  initExport();
  initProjectDialog(data);
  initSaveServer();
}

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach((b) =>
    b.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((x) => x.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      document.getElementById(`tab-${b.dataset.tab}`)?.classList.add('active');
    }),
  );
}

function renderTexts(d) {
  const c = document.getElementById('texts-editor');
  if (!c) return;
  const f = [
    { p: 'meta.siteUrl', l: 'Сайт (canonical / og:url), полный URL' },
    { p: 'meta.ogImage', l: 'OG-картинка, путь (например /og-cover.png)' },
    { p: 'header.location', l: 'Локация (строка, для героя)' },
    { p: 'header.name.ru', l: 'Имя (RU)' },
    { p: 'header.name.en', l: 'Имя (EN)' },
    { p: 'header.title.ru', l: 'Заголовок (RU), можно «Роль | Уточнение»' },
    { p: 'header.title.en', l: 'Заголовок (EN)' },
    { p: 'meta.description.ru', l: 'Meta description (RU)', area: true, rows: 2 },
    { p: 'meta.description.en', l: 'Meta description (EN)', area: true, rows: 2 },
    { p: 'positioning.elevator.ru', l: 'Elevator pitch (RU)', area: true, rows: 2 },
    { p: 'positioning.elevator.en', l: 'Elevator pitch (EN)', area: true, rows: 2 },
    { p: 'positioning.careerIntent.ru', l: 'Карьерный фокус 1–2 года (RU)', area: true, rows: 3 },
    { p: 'positioning.careerIntent.en', l: 'Career intent 1–2 years (EN)', area: true, rows: 3 },
    { p: 'hero.description.ru', l: 'Описание в герое (RU)', area: true, rows: 4 },
    { p: 'hero.description.en', l: 'Описание в герое (EN)', area: true, rows: 4 },
  ];
  c.innerHTML = f
    .map((x) => {
      const v = x.p.split('.').reduce((o, k) => o?.[k], d) ?? '';
      const pathAttr = String(x.p).replace(/"/g, '&quot;');
      const labelEsc = escapeHtml(x.l);
      const valAttr = String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
      if (x.area) {
        return `<div class="form-group full-width"><label>${labelEsc}</label><textarea data-path="${pathAttr}" class="form-input" rows="${x.rows || 3}">${escapeHtml(String(v))}</textarea></div>`;
      }
      return `<div class="form-group"><label>${labelEsc}</label><input data-path="${pathAttr}" class="form-input" value="${valAttr}"/></div>`;
    })
    .join('');
  c.addEventListener(
    'input',
    debounce((e) => {
      const t = e.target;
      if (t.dataset?.path) {
        updateContent(t.dataset.path, t.value);
        showToast('💾 Локально');
      }
    }, 500),
  );
}

function renderProjects(d) {
  const c = document.getElementById('projects-list');
  if (!c || !d.projects) return;
  c.innerHTML = d.projects.length
    ? d.projects
        .map(
          (p, i) =>
            `<div class="project-admin-card" data-index="${i}"><div><h4>${escapeHtml(p.title?.ru || p.title?.en || '')}</h4><small>${escapeHtml(p.date || '')}</small></div><div><button type="button" data-action="edit">✏️</button><button type="button" data-action="delete">🗑️</button></div></div>`,
        )
        .join('')
    : '<p>Нет проектов</p>';
  c.onclick = (e) => {
    const b = e.target.closest('button[data-action]');
    if (!b) return;
    const card = b.closest('.project-admin-card');
    const i = parseInt(card?.dataset.index ?? '-1', 10);
    if (b.dataset.action === 'delete') {
      d.projects.splice(i, 1);
      renderProjects(d);
      showToast('Удалено');
    }
    if (b.dataset.action === 'edit') openProjectDialog(i);
  };
}

function renderVisibility(d) {
  const c = document.getElementById('visibility-toggles');
  if (!c) return;
  const s = [
    { k: 'about', l: 'Обо мне' },
    { k: 'skills', l: 'Навыки' },
    { k: 'projects', l: 'Проекты' },
    { k: 'education', l: 'Образование' },
    { k: 'contacts', l: 'Контакты' },
  ];
  const vis = d.visibility || {};
  c.innerHTML = s
    .map(
      (x) =>
        `<label class="toggle-item"><span class="toggle-label">${x.l}</span><label class="toggle-switch"><input type="checkbox" data-k="${x.k}" ${vis[x.k] !== false ? 'checked' : ''}><span class="toggle-slider"></span></label></label>`,
    )
    .join('');
  c.addEventListener('change', (e) => {
    const inp = e.target.closest('input[data-k]');
    if (inp) {
      toggleSectionVisibility(inp.dataset.k, inp.checked);
      showToast('👁️ Обновлено');
    }
  });
}

function initProjectDialog(d) {
  const dlg = document.getElementById('project-dialog');
  const f = document.getElementById('project-form');
  const add = document.getElementById('add-project-btn');
  const can = document.getElementById('cancel-dialog');
  add?.addEventListener('click', () => openProjectDialog(-1));
  can?.addEventListener('click', () => dlg.close());
  dlg?.addEventListener('click', (e) => {
    if (e.target === dlg) dlg.close();
  });
  f?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(f);
    const idx = parseInt(f.dataset.idx ?? '-1', 10);
    updateProject(idx, {
      title: { ru: fd.get('title_ru'), en: fd.get('title_en') },
      description: { ru: fd.get('desc_ru'), en: fd.get('desc_en') },
      tags: String(fd.get('tags') || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      date: fd.get('date'),
      metrics: { ru: fd.get('metrics_ru'), en: fd.get('metrics_en') },
      stack: String(fd.get('stack') || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      link: fd.get('link') || null,
      detailMarkdown: {
        ru: fd.get('md_ru') || '',
        en: fd.get('md_en') || '',
      },
    });
    dlg.close();
    f.reset();
    delete f.dataset.idx;
    renderProjects(d);
    showToast('✅ Сохранено локально');
  });

  window.openProjectDialog = function (i = -1) {
    const p = i >= 0 ? d.projects[i] : {};
    document.getElementById('dialog-title').textContent = i >= 0 ? 'Редактировать' : 'Новый';
    f.dataset.idx = String(i);
    f.elements.namedItem('title_ru').value = p.title?.ru || '';
    f.elements.namedItem('title_en').value = p.title?.en || '';
    f.elements.namedItem('desc_ru').value = p.description?.ru || '';
    f.elements.namedItem('desc_en').value = p.description?.en || '';
    f.elements.namedItem('tags').value = p.tags?.join(', ') || '';
    f.elements.namedItem('date').value = p.date || '';
    f.elements.namedItem('metrics_ru').value = p.metrics?.ru || '';
    f.elements.namedItem('metrics_en').value = p.metrics?.en || '';
    f.elements.namedItem('stack').value = p.stack?.join(', ') || '';
    f.elements.namedItem('link').value = p.link || '';
    f.elements.namedItem('md_ru').value = p.detailMarkdown?.ru || '';
    f.elements.namedItem('md_en').value = p.detailMarkdown?.en || '';
    dlg.showModal();
  };
}

function initExport() {
  document.getElementById('export-json-btn')?.addEventListener('click', async () => {
    try {
      await putContentToServer();
      exportContent();
      const p = document.getElementById('json-preview');
      p.textContent = JSON.stringify(getContent(), null, 2);
      p.hidden = false;
      showToast('📥 Сохранено и скачано');
    } catch (e) {
      showToast('❌ ' + (e.message || 'Ошибка сохранения'));
    }
  });
}

function initSaveServer() {
  document.getElementById('save-server-btn')?.addEventListener('click', async () => {
    try {
      await putContentToServer();
      showToast('💾 Сохранено на сервере');
    } catch (e) {
      showToast('❌ ' + (e.message || 'Ошибка'));
    }
  });
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function showToast(m) {
  const t = document.createElement('div');
  t.textContent = m;
  t.style.cssText =
    'position:fixed;bottom:20px;right:20px;background:var(--color-accent-lime);color:#0a0a0a;padding:10px 16px;border-radius:8px;z-index:999;transition:0.3s;transform:translateY(20px);opacity:0';
  document.body.appendChild(t);
  requestAnimationFrame(() => {
    t.style.transform = 'translateY(0)';
    t.style.opacity = '1';
  });
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 300);
  }, 2000);
}

function debounce(fn, d) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), d);
  };
}
