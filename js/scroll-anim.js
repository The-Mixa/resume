import { CONFIG } from './config.js';

export function initScrollAnim() {
  if (CONFIG.perf.reduceMotion) {
    document.querySelectorAll('.animate, .timeline-item, .project-card').forEach((el) => el.classList.add('is-visible'));
    document.querySelectorAll('.skill-bar__fill').forEach((bar) => {
      const level = parseInt(bar.closest('.skill-item')?.dataset.level, 10) || 0;
      bar.style.width = `${level}%`;
    });
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: CONFIG.animations.scroll.threshold, rootMargin: CONFIG.animations.scroll.rootMargin },
  );

  document.querySelectorAll('.projects-grid, .contacts-grid, .soft-list').forEach((grid) => {
    Array.from(grid.children).forEach((c, i) => {
      c.classList.add('animate');
      c.classList.add(`delay-${((i % 4) + 1) * 100}`);
      revealObserver.observe(c);
    });
  });

  document.querySelectorAll('.timeline-item').forEach((el) => revealObserver.observe(el));

  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const level = parseInt(e.target.closest('.skill-item')?.dataset.level, 10) || 0;
          setTimeout(() => {
            e.target.style.width = `${level}%`;
          }, 150);
          skillObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.6 },
  );
  document.querySelectorAll('.skill-bar__fill').forEach((bar) => skillObserver.observe(bar));
}
