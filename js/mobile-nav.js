export function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('nav');
  const header = document.getElementById('header');
  if (!toggle || !nav || !header) return;

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.classList.toggle('nav--open', open);
    header.classList.toggle('header--nav-open', open);
    document.body.classList.toggle('nav-open', open);
  }

  toggle.addEventListener('click', () => {
    setOpen(!nav.classList.contains('nav--open'));
  });

  nav.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', () => setOpen(false));
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
}
