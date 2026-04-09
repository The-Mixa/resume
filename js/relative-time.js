import { CONFIG } from './config.js';

const units = {
  ru: {
    min: ['минуту', 'минуты', 'минут'],
    hour: ['час', 'часа', 'часов'],
    day: ['день', 'дня', 'дней'],
    month: ['месяц', 'месяца', 'месяцев'],
    year: ['год', 'года', 'лет'],
    justNow: 'только что',
    ago: 'назад',
  },
  en: {
    min: ['minute', 'minutes'],
    hour: ['hour', 'hours'],
    day: ['day', 'days'],
    month: ['month', 'months'],
    year: ['year', 'years'],
    justNow: 'just now',
    ago: 'ago',
  },
};

function pluralizeRu(n, f) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m100 >= 11 && m100 <= 19) return f[2];
  if (m10 === 1) return f[0];
  if (m10 >= 2 && m10 <= 4) return f[1];
  return f[2];
}

function pluralizeEn(n, f) {
  return n === 1 ? f[0] : f[1];
}

function getRelativeString(iso, lang) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff <= 0) return lang === 'ru' ? 'в будущем' : 'in the future';
  if (diff < 60000) return units[lang].justNow;
  const d = units[lang];
  const p = lang === 'ru' ? pluralizeRu : pluralizeEn;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} ${p(mins, d.min)} ${d.ago}`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours} ${p(hours, d.hour)} ${d.ago}`;
  const days = Math.floor(diff / 86400000);
  if (days < 30) return `${days} ${p(days, d.day)} ${d.ago}`;
  const months = Math.floor(diff / (86400000 * 30.44));
  if (months < 12) return `${months} ${p(months, d.month)} ${d.ago}`;
  const years = Math.floor(diff / (86400000 * 365.25));
  return `${years} ${p(years, d.year)} ${d.ago}`;
}

export function initRelativeTime() {
  const update = () => {
    const lang = (document.documentElement.lang || CONFIG.i18n.fallback) === 'en' ? 'en' : 'ru';
    document.querySelectorAll('time[datetime]').forEach((el) => {
      const iso = el.getAttribute('datetime');
      if (iso) el.setAttribute('title', getRelativeString(iso, lang));
    });
  };
  update();
  setInterval(update, 3600000 * 6);
  const obs = new MutationObserver(() => update());
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  window.addEventListener('resume:langchange', update);
  window.addEventListener('resume:contentloaded', update);
}
