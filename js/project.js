import { loadProjects, loadSite, hydrateHeader, escapeHtml, mediaKind, revealPage } from './site.js';

const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');
const stage = document.querySelector('[data-project-stage]');
const thumbs = document.querySelector('[data-project-thumbs]');
const info = document.querySelector('[data-project-info]');

function stageMarkup(item, title) {
  if (mediaKind(item) === 'video') {
    const poster = item.poster ? ` poster="${escapeHtml(item.poster)}"` : '';
    return `<video src="${escapeHtml(item.src)}"${poster} controls playsinline preload="metadata"></video>`;
  }
  return `<img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt || title)}">`;
}

function thumbMarkup(item, title, index) {
  if (mediaKind(item) === 'video') {
    if (item.poster) {
      return `<img src="${escapeHtml(item.poster)}" alt="Video ${index + 1}: ${escapeHtml(title)}" loading="lazy">`;
    }
    return '<span class="thumb__fallback">VIDEO</span>';
  }
  return `<img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt || `${title} ${index + 1}`)}" loading="lazy">`;
}

try {
  const [projects, site] = await Promise.all([loadProjects(), loadSite()]);
  hydrateHeader(site);

  const project = projects.find(item => item.slug === slug);
  if (!project) throw new Error('Project not found.');

  document.title = `${project.title} — ${site.name || 'Portfolio'}`;

  const media = Array.isArray(project.media) && project.media.length
    ? project.media
    : [{ type: 'image', src: project.thumbnail, alt: project.title }];

  let activeIndex = 0;

  function renderActive() {
    stage.innerHTML = stageMarkup(media[activeIndex], project.title);
    [...thumbs.querySelectorAll('.thumb')].forEach((button, index) => {
      const active = index === activeIndex;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  thumbs.innerHTML = media.map((item, index) => `
    <button class="thumb ${index === 0 ? 'is-active' : ''}" type="button" data-index="${index}" aria-label="Show media ${index + 1}" aria-pressed="${index === 0 ? 'true' : 'false'}">
      ${thumbMarkup(item, project.title, index)}
    </button>
  `).join('');

  thumbs.addEventListener('click', event => {
    const button = event.target.closest('.thumb');
    if (!button) return;
    activeIndex = Number(button.dataset.index);
    renderActive();
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    activeIndex = (activeIndex + direction + media.length) % media.length;
    renderActive();
  });

  info.innerHTML = `
    <div class="project-heading">
      <h1>${escapeHtml(project.year)} : ${escapeHtml(project.title)}</h1>
    </div>
    <div class="project-details">
      ${project.description ? `<p>${escapeHtml(project.description)}</p>` : ''}
      ${(project.brand || project.client) ? `<p><span>Brand</span> ${escapeHtml(project.brand || project.client)}</p>` : ''}
      ${project.format ? `<p><span>Format</span> ${escapeHtml(project.format)}</p>` : ''}
      ${project.role ? `<p><span>Role</span> ${escapeHtml(project.role)}</p>` : ''}
    </div>
  `;

  renderActive();
  await revealPage({ imagesWithin: stage });
} catch (error) {
  stage.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
  await revealPage();
}
