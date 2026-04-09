import { CONFIG } from './config.js';

export function initFilters() {
  const filterContainer = document.getElementById('project-filters');
  const emptyEl = document.getElementById('projects-empty');
  const resetBtn = document.getElementById('projects-empty-reset');
  if (!filterContainer) return;

  let activeFilter = 'all';

  function projectCards() {
    return document.querySelectorAll('#projects-container .project-card');
  }

  function updateEmptyState() {
    if (!emptyEl) return;
    const visible = document.querySelectorAll('#projects-container .project-card:not(.is-hidden)');
    const show = activeFilter !== 'all' && visible.length === 0;
    emptyEl.hidden = !show;
  }

  function filterTo(mode) {
    activeFilter = mode;
    filterContainer.querySelectorAll('.filter-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.filter === mode);
    });
    const cards = projectCards();
    filterCards(cards, mode, () => {
      setTimeout(updateEmptyState, CONFIG.animations.filters.duration + 80);
    });
  }

  filterContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn || btn.classList.contains('active')) return;
    filterTo(btn.dataset.filter || 'all');
  });

  resetBtn?.addEventListener('click', () => {
    const allBtn = filterContainer.querySelector('[data-filter="all"]');
    if (allBtn) {
      filterContainer.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      allBtn.classList.add('active');
      filterTo('all');
    }
  });

  window.addEventListener('resume:contentloaded', () => {
    activeFilter = 'all';
    updateEmptyState();
  });

  updateEmptyState();
}

function filterCards(cards, activeFilter, onDone) {
  let pending = cards.length;
  const checkDone = () => {
    pending -= 1;
    if (pending <= 0 && typeof onDone === 'function') onDone();
  };

  cards.forEach((card, index) => {
    const tags = card.dataset.tags?.split(',').map((t) => t.trim()) || [];
    const show = activeFilter === 'all' || tags.includes(activeFilter);
    const delay = index * CONFIG.animations.filters.stagger;
    setTimeout(() => {
      if (show) {
        card.classList.remove('is-hidden');
        void card.offsetWidth;
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
        card.style.pointerEvents = 'auto';
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(10px) scale(0.95)';
        card.style.pointerEvents = 'none';
        setTimeout(() => card.classList.add('is-hidden'), CONFIG.animations.filters.duration);
      }
      checkDone();
    }, delay);
  });

  if (!cards.length && typeof onDone === 'function') onDone();
}
