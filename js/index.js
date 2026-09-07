import {
  loadProjects,
  loadSite,
  hydrateChrome,
  projectUrl,
  escapeHtml,
  revealPage
} from './site.js';

const grid = document.querySelector('[data-project-grid]');

try {
  const [projects, site] = await Promise.all([loadProjects(), loadSite()]);
  hydrateChrome(site);
  document.title = site.name || 'Portfolio';

  const featured = projects
    .filter(project => project.featured)
    .sort((a, b) => Number(a.featuredOrder ?? 999) - Number(b.featuredOrder ?? 999))
    .slice(0, 4);

  grid.innerHTML = featured.map(project => `
    <a class="project-card" href="${projectUrl(project)}">
      <div class="project-card__media">
        <img src="${escapeHtml(project.thumbnail)}" alt="${escapeHtml(project.title)}" loading="eager">
      </div>
      <div class="project-card__meta"><span>${escapeHtml(project.title)}</span></div>
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
