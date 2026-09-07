import {
  loadProjects,
  loadSite,
  hydrateChrome,
  hydrateSeo,
  hydratePersonSchema,
  projectUrl,
  escapeHtml,
  revealPage
} from './site.js';

const grid = document.querySelector('[data-project-grid]');

try {
  const [projects, site] = await Promise.all([loadProjects(), loadSite()]);
  hydrateChrome(site);
  hydrateSeo(site, {
    title: site.seoTitle || site.name || 'Portfolio',
    description: site.seoDescription || site.intro || 'Selected personal and professional projects.',
    path: 'index.html',
    image: site.seoImage || projects.find(project => project.featured)?.thumbnail,
    type: 'website'
  });
  hydratePersonSchema(site);

  const featured = projects
    .filter(project => project.featured)
    .sort((a, b) => Number(a.featuredOrder ?? 999) - Number(b.featuredOrder ?? 999))
    .slice(0, 4);

  grid.innerHTML = featured.map(project => `
    <a class="project-card" href="${projectUrl(project)}" aria-label="${escapeHtml(project.title)}">
      <div class="project-card__media">
        <img src="${escapeHtml(project.thumbnail)}" alt="${escapeHtml(project.thumbnailAlt || project.title)}" loading="eager" fetchpriority="high">
      </div>
    </a>
  `).join('');

  if (!featured.length) {
    grid.innerHTML = '<p class="empty-state">No featured projects yet.</p>';
  }

  await revealPage({ imagesWithin: grid });
} catch (error) {
  grid.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
  await revealPage();
}
