import {
  loadProjects,
  loadSite,
  hydrateChrome,
  projectUrl,
  escapeHtml,
  sortProjects,
  revealPage
} from './site.js';

const list = document.querySelector('[data-work-list]');
const grid = document.querySelector('[data-work-grid]');
const listView = document.querySelector('[data-work-list-view]');
const gridView = document.querySelector('[data-work-grid-view]');
const displayButtons = [...document.querySelectorAll('[data-display]')];
const preview = document.querySelector('[data-work-preview]');
const previewImage = document.querySelector('[data-work-preview-image]');

let currentView = 'list';
let activePreviewProject = null;

function setView(view, { persist = true } = {}) {
  currentView = view === 'grid' ? 'grid' : 'list';
  listView.hidden = currentView !== 'list';
  gridView.hidden = currentView !== 'grid';

  displayButtons.forEach(button => {
    const active = button.dataset.display === currentView;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  hidePreview();

  if (persist) {
    try { localStorage.setItem('portfolio-work-view', currentView); } catch (_) {}
    const url = new URL(window.location.href);
    url.searchParams.set('view', currentView);
    history.replaceState({}, '', url);
  }
}

function positionPreview(event) {
  if (!preview || !activePreviewProject) return;
  const box = preview.getBoundingClientRect();
  const gap = 18;
  const maxLeft = window.innerWidth - box.width - gap;
  const maxTop = window.innerHeight - box.height - gap;
  const left = Math.min(Math.max(gap, event.clientX + gap), maxLeft);
  const top = Math.min(Math.max(gap, event.clientY + gap), maxTop);
  preview.style.left = `${left}px`;
  preview.style.top = `${top}px`;
}

function showPreview(project, event) {
  if (!project?.thumbnail || !preview || !previewImage || currentView !== 'list') return;
  activePreviewProject = project;
  previewImage.src = project.thumbnail;
  previewImage.alt = `${project.title} preview`;
  preview.classList.add('is-visible');
  if (event?.clientX != null) positionPreview(event);
}

function hidePreview() {
  activePreviewProject = null;
  preview?.classList.remove('is-visible');
}

try {
  const [projects, site] = await Promise.all([loadProjects(), loadSite()]);
  hydrateChrome(site);
  document.title = `Work — ${site.name || 'Portfolio'}`;

  const sorted = sortProjects(projects);

  grid.innerHTML = sorted.map(project => `
    <a class="work-grid-card" href="${projectUrl(project)}">
      <div class="work-grid-card__media">
        <img src="${escapeHtml(project.thumbnail)}" alt="${escapeHtml(project.title)}" loading="lazy">
      </div>
      <div class="work-grid-card__title"><span>${escapeHtml(project.title)}</span></div>
    </a>
  `).join('');

  list.innerHTML = sorted.map((project, index) => `
    <a
      class="work-list__row"
      href="${projectUrl(project)}"
      data-project-index="${index}"
      role="row"
    >
      <span role="cell">${escapeHtml(project.title)}</span>
      <span role="cell">${escapeHtml(project.format || '—')}</span>
      <span role="cell">${escapeHtml(project.brand || project.client || '—')}</span>
      <span role="cell">${escapeHtml(project.year || '')}</span>
    </a>
  `).join('');

  if (!sorted.length) {
    grid.innerHTML = '<p class="empty-state">No projects yet.</p>';
    list.innerHTML = '<p class="empty-state">No projects yet.</p>';
  }

  list.querySelectorAll('.work-list__row').forEach(row => {
    const project = sorted[Number(row.dataset.projectIndex)];
    row.addEventListener('mouseenter', event => showPreview(project, event));
    row.addEventListener('mousemove', positionPreview);
    row.addEventListener('mouseleave', hidePreview);
    row.addEventListener('focus', () => {
      if (!project?.thumbnail || !preview || !previewImage) return;
      activePreviewProject = project;
      previewImage.src = project.thumbnail;
      previewImage.alt = `${project.title} preview`;
      preview.style.left = '24px';
      preview.style.top = '24px';
      preview.classList.add('is-visible');
    });
    row.addEventListener('blur', hidePreview);
  });

  displayButtons.forEach(button => {
    button.addEventListener('click', () => setView(button.dataset.display));
  });

  const queryView = new URLSearchParams(window.location.search).get('view');
  let storedView = null;
  try { storedView = localStorage.getItem('portfolio-work-view'); } catch (_) {}
  setView(queryView || storedView || 'list', { persist: false });
  await revealPage({ imagesWithin: currentView === 'grid' ? grid : null });
} catch (error) {
  list.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
  grid.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
  await revealPage();
}
