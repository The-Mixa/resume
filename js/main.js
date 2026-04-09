import { initTheme } from './theme.js';
import { initI18n } from './i18n.js';
import { initNavigation } from './navigation.js';
import { initFilters } from './filters.js';
import { initScrollAnim } from './scroll-anim.js';
import { initRelativeTime } from './relative-time.js';
import { bindContentLangRefresh, getSiteContent, loadSiteContent } from './content-loader.js';
import { initModes } from './modes.js';
import { injectSchemaJsonLd } from './seo-schema.js';
import { initMobileNav } from './mobile-nav.js';
import { initToneSober } from './tone-sober.js';

function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;
  const onScroll = () => {
    document.body.classList.toggle('is-scrolled', window.scrollY > 24);
    header.classList.toggle('header--scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    initTheme();
    initI18n();
    bindContentLangRefresh();
    await loadSiteContent();
    initToneSober();
    initModes();
    injectSchemaJsonLd(getSiteContent());
    window.addEventListener('resume:contentloaded', () => {
      injectSchemaJsonLd(getSiteContent());
    });
    window.addEventListener('resume:langchange', () => {
      injectSchemaJsonLd(getSiteContent());
    });
    initNavigation();
    initMobileNav();
    initFilters();
    initScrollAnim();
    initRelativeTime();
    initHeaderScroll();
  } catch (e) {
    console.error('Init error:', e);
  }
});
