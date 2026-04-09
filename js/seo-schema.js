import { pick } from './content-loader.js';

export function injectSchemaJsonLd(data) {
  const el = document.getElementById('schema-jsonld');
  if (!el || !data) return;

  const lang = document.documentElement.lang === 'en' ? 'en' : 'ru';
  const base = (data.meta?.siteUrl || window.location.origin).replace(/\/$/, '');
  const name = pick(data.header?.name, lang) || 'Mikhail Kirichenko';
  const jobTitle = pick(data.header?.title, lang) || 'Developer';

  const sameAs = [data.contacts?.github, data.contacts?.kaggle].filter(Boolean);
  const knowsAbout = [];
  (data.stackProof || []).forEach((row) => {
    const t = pick(row.technology, lang);
    if (t) knowsAbout.push(t);
  });
  (data.skillMetrics || []).forEach((m) => {
    if (m.name) knowsAbout.push(m.name);
  });

  const projectItems = (data.projects || [])
    .filter((p) => p.visible !== false)
    .map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'CreativeWork',
        name: pick(p.title, lang),
        description: pick(p.description, lang),
        datePublished: p.date || undefined,
        url: p.link || `${base}/#project-${p.id}`,
      },
    }));

  const graph = [
    {
      '@type': 'Person',
      name,
      jobTitle,
      url: `${base}/`,
      sameAs,
      knowsAbout: [...new Set(knowsAbout)].slice(0, 40),
    },
    {
      '@type': 'ItemList',
      name: lang === 'ru' ? 'Проекты' : 'Projects',
      numberOfItems: projectItems.length,
      itemListElement: projectItems,
    },
  ];

  el.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}
