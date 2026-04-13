export const CONFIG = {
  app: {
    name: 'Mikhail Resume',
    version: '1.0.0',
    author: 'Kirichenko Mikhail',
    build: new Date().toISOString().split('T')[0],
  },
  apiBase: '',
  paths: {
    data: 'data/content.json',
    contentApi: '/api/content',
    loginApi: '/api/login',
    logoutApi: '/api/logout',
    admin: { login: 'admin.html', storageKey: 'admin_authenticated' },
  },
  theme: {
    key: 'resume_theme',
    default: 'light',
    systemQuery: '(prefers-color-scheme: dark)',
    transitions: { enabled: true, duration: 250 },
  },
  i18n: {
    key: 'resume_lang',
    default: 'ru',
    supported: ['ru', 'en'],
    fallback: 'ru',
    dict: {
      ru: {
        'page.title': 'Михаил Кириченко — Резюме',
        'header.name': 'Михаил Кириченко',
        'nav.about': 'Обо мне',
        'nav.skills': 'Навыки',
        'nav.projects': 'Проекты',
        'nav.education': 'Образование',
        'nav.contacts': 'Контакты',
        'hero.title': 'Разработчик',
        'hero.subtitle': '| ML-Инженер / Аналитик',
        'hero.description':
          'Школьник 11 класса с фокусом на Machine Learning, Fullstack-разработку и алгоритмы. Призёр заключительного этапа ВСОШ по ИИ, автор работающих продуктов и исследовательских проектов.',
        'hero.cta': 'Смотреть проекты',
        'hero.contact': 'Связаться',
        'skills.title': 'Навыки',
        'skills.languages': 'Языки программирования',
        'skills.tools': 'Фреймворки и инструменты',
        'skills.soft': 'Гибкие навыки',
        'skills.soft.1': '🤝 Работа в команде (хакатоны, проекты)',
        'skills.soft.2': '⏱ Управление дедлайнами (4% просрочек)',
        'skills.soft.3': '🎤 Публичные выступления и презентация идей',
        'skills.soft.4': '🧠 Решение нестандартных задач (олимпиады)',
        'skills.soft.5': '🚀 Быстрое обучение (новые инструменты за 1–2 дня)',
        'skills.soft.6': '👨‍🏫 Наставничество (репетитор по математике/информатике)',
        'projects.title': 'Проекты',
        'projects.filters.all': 'Все',
        'projects.filters.ml': 'ML',
        'projects.filters.web': 'Web',
        'projects.filters.olymp': 'Олимпиады',
        'projects.filters.research': 'Исследования',
        'education.title': 'Образование и курсы',
        'contacts.title': 'Контакты',
        'contacts.email': 'Email',
        'contacts.email_alt': 'Email (альт.)',
        'contacts.note':
          '📍 Москва • 🎓 Выпуск 2026 • 💼 Гибридный формат • 🚀 Готов учиться параллельно с работой',
        'footer.copyright': '© 2025 Михаил Кириченко',
        'footer.print': 'Версия для печати / PDF',
        'mode.hint': 'Меняет порядок разделов под вашу цель',
        'mode.university': 'Вуз',
        'mode.internship': 'Стажировка',
        'mode.grant': 'Грант',
        'tone.sober': 'Сдержанный тон: без эмодзи в мета-блоке героя',
        'hero.meta.grad': 'Выпуск 2026',
        'hero.meta.format': 'Гибридный формат',
        'metrics.profile': 'Профиль',
        'soft.case.link': 'Ссылка',
        'education.credential': 'Сертификат / подтверждение',
        'skills.metrics': 'Объективные метрики',
        'skills.stackProof': 'Стек → Доказательство',
        'availability.heading': 'Доступность и цели',
        'availability.dt.format': 'Формат',
        'availability.dt.hours': 'Часы',
        'availability.dt.roles': 'Роли',
        'availability.dt.timeline': 'Сроки',
        'metrics.years': 'лет опыта',
        'metrics.tasks': 'задач',
        'metrics.projects': 'проектов',
        'project.more': 'Подробнее (README)',
        'project.link': 'Сайт / демо →',
        'projects.empty': 'Нет проектов по этому фильтру.',
        'projects.reset': 'Сбросить фильтр',
      },
      en: {
        'page.title': 'Mikhail Kirichenko — Resume',
        'header.name': 'Mikhail Kirichenko',
        'nav.about': 'About',
        'nav.skills': 'Skills',
        'nav.projects': 'Projects',
        'nav.education': 'Education',
        'nav.contacts': 'Contacts',
        'hero.title': 'Developer',
        'hero.subtitle': '| ML-Engeneer / Data Scientist',
        'hero.description':
          '11th grade student focused on Machine Learning, Fullstack development, and algorithms. Finalist of the All-Russian Olympiad in AI, author of production-ready products and research projects.',
        'hero.cta': 'View Projects',
        'hero.contact': 'Get in Touch',
        'skills.title': 'Skills',
        'skills.languages': 'Programming Languages',
        'skills.tools': 'Frameworks & Tools',
        'skills.soft': 'Soft Skills',
        'skills.soft.1': '🤝 Teamwork (hackathons, projects)',
        'skills.soft.2': '⏱ Deadline management (4% overdue)',
        'skills.soft.3': '🎤 Public speaking & idea presentation',
        'skills.soft.4': '🧠 Solving non-standard tasks (olympiads)',
        'skills.soft.5': '🚀 Fast learning (new tools in 1–2 days)',
        'skills.soft.6': '👨‍🏫 Mentoring (math/CS tutor)',
        'projects.title': 'Projects',
        'projects.filters.all': 'All',
        'projects.filters.ml': 'ML',
        'projects.filters.web': 'Web',
        'projects.filters.olymp': 'Olympiads',
        'projects.filters.research': 'Research',
        'education.title': 'Education & Courses',
        'contacts.title': 'Contacts',
        'contacts.email': 'Email',
        'contacts.email_alt': 'Email (alt.)',
        'contacts.note': '📍 Moscow • 🎓 Class of 2026 • 💼 Hybrid • 🚀 Ready to learn while working',
        'footer.copyright': '© 2025 Mikhail Kirichenko',
        'footer.print': 'Print / PDF version',
        'mode.hint': 'Reorders sections for your goal',
        'mode.university': 'University',
        'mode.internship': 'Internship',
        'mode.grant': 'Grant',
        'tone.sober': 'Sober tone: hide emoji in hero meta',
        'hero.meta.grad': 'Class of 2026',
        'hero.meta.format': 'Hybrid',
        'metrics.profile': 'Profile',
        'soft.case.link': 'Link',
        'education.credential': 'Credential',
        'skills.metrics': 'Objective metrics',
        'skills.stackProof': 'Stack → Proof',
        'availability.heading': 'Availability & goals',
        'availability.dt.format': 'Format',
        'availability.dt.hours': 'Hours',
        'availability.dt.roles': 'Roles',
        'availability.dt.timeline': 'Timeline',
        'metrics.years': 'yrs experience',
        'metrics.tasks': 'tasks solved',
        'metrics.projects': 'projects',
        'project.more': 'Details (README)',
        'project.link': 'Live demo →',
        'projects.empty': 'No projects match this filter.',
        'projects.reset': 'Reset filter',
      },
    },
  },
  animations: {
    scroll: { enabled: true, threshold: 0.15, rootMargin: '0px 0px -50px 0px' },
    filters: { duration: 400, stagger: 50 },
    skills: { fillDuration: 1000, triggerOffset: 100 },
  },
  perf: { reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches, debounceDelay: 150 },
  features: { adminPanel: true },
};

export const isLocalhost = () =>
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const storage = {
  get: (k, f = null) => {
    try {
      const i = localStorage.getItem(k);
      return i ? JSON.parse(i) : f;
    } catch {
      return f;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
      return true;
    } catch {
      return false;
    }
  },
  remove: (k) => localStorage.removeItem(k),
};

export const debounce = (fn, delay = CONFIG.perf.debounceDelay) => {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(undefined, a), delay);
  };
};

export function apiUrl(path) {
  const base = CONFIG.apiBase.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
