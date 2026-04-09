export function initNavigation() {
  const links = document.querySelectorAll('.nav__link');
  const visibleSections = () =>
    Array.from(document.querySelectorAll('section[data-section]')).filter((s) => !s.classList.contains('is-hidden'));

  links.forEach((l) => {
    l.addEventListener('click', (e) => {
      if (l.classList.contains('is-hidden')) return;
      e.preventDefault();
      const id = l.getAttribute('href')?.substring(1);
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  const active = new Set();
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.target.classList.contains('is-hidden')) return;
        e.isIntersecting ? active.add(e.target.id) : active.delete(e.target.id);
      });
      const vis = visibleSections();
      const sorted = Array.from(active)
        .filter((id) => vis.some((s) => s.id === id))
        .sort((a, b) => (document.getElementById(a)?.offsetTop ?? 0) - (document.getElementById(b)?.offsetTop ?? 0));
      const current = sorted.length ? sorted[sorted.length - 1] : null;
      links.forEach((l) => {
        if (l.classList.contains('is-hidden')) return;
        const h = l.getAttribute('href')?.substring(1);
        l.classList.toggle('active', h === current);
        l.setAttribute('aria-current', h === current ? 'page' : 'false');
      });
    },
    { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
  );

  visibleSections().forEach((s) => obs.observe(s));
}
