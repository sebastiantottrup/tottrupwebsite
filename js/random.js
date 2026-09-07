import {
  loadProjects,
  loadSite,
  hydrateChrome,
  hydrateSeo,
  projectUrl,
  escapeHtml,
  revealPage
} from './site.js';

const status = document.querySelector('[data-random-status]');

try {
  const [projects, site] = await Promise.all([loadProjects(), loadSite()]);
  hydrateChrome(site);
  hydrateSeo(site, {
    title: `Random — ${site.name || 'Portfolio'}`,
    description: 'Random project selection.',
    path: 'random.html',
    robots: 'noindex,follow'
  });

  if (!projects.length) throw new Error('No projects available.');

  let lastSlug = null;
  try { lastSlug = localStorage.getItem('portfolio-random-last'); } catch (_) {}

  const pool = projects.length > 1 ? projects.filter(project => project.slug !== lastSlug) : projects;
  const project = pool[Math.floor(Math.random() * pool.length)];

  try { localStorage.setItem('portfolio-random-last', project.slug); } catch (_) {}
  window.location.replace(projectUrl(project));
} catch (error) {
  if (status) status.textContent = escapeHtml(error.message);
  await revealPage();
}
