import {
  loadProjects,
  loadSite,
  hydrateHeader,
  hydrateSeo,
  hydratePersonSchema,
  hydrateProjectSchema,
  escapeHtml,
  mediaKind,
  revealPage
} from './site.js?v=20260908-3';

const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');
const stage = document.querySelector('[data-project-stage]');
const controls = document.querySelector('[data-project-controls]');
const header = document.querySelector('[data-project-header]');
const copy = document.querySelector('[data-project-copy]');
const lightbox = document.querySelector('[data-project-lightbox]');
const lightboxStage = document.querySelector('[data-lightbox-stage]');
const lightboxCounter = document.querySelector('[data-lightbox-counter]');
const lightboxClose = document.querySelector('[data-lightbox-close]');
const lightboxPrev = document.querySelector('[data-lightbox-prev]');
const lightboxNext = document.querySelector('[data-lightbox-next]');

const MEDIA_FADE_MS = 180;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mediaSwapTokens = new WeakMap();

function mediaMarkup(item, title, { lightbox = false } = {}) {
  if (mediaKind(item) === 'video') {
    const poster = item.poster ? ` poster="${escapeHtml(item.poster)}"` : '';
    return `<video src="${escapeHtml(item.src)}"${poster} controls playsinline preload="metadata" ${lightbox ? 'autoplay' : ''}></video>`;
  }
  return `<img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt || title)}">`;
}

function replaceMedia(container, markup, { animate = false } = {}) {
  const token = (mediaSwapTokens.get(container) || 0) + 1;
  mediaSwapTokens.set(container, token);

  if (!animate || prefersReducedMotion.matches || !container.firstElementChild) {
    container.classList.remove('is-media-faded');
    container.innerHTML = markup;
    return;
  }

  container.classList.add('is-media-faded');

  window.setTimeout(() => {
    if (mediaSwapTokens.get(container) !== token) return;

    container.innerHTML = markup;
    void container.offsetWidth;

    requestAnimationFrame(() => {
      if (mediaSwapTokens.get(container) === token) {
        container.classList.remove('is-media-faded');
      }
    });
  }, MEDIA_FADE_MS);
}

function clearMedia(container) {
  mediaSwapTokens.set(container, (mediaSwapTokens.get(container) || 0) + 1);
  container.classList.remove('is-media-faded');
  container.innerHTML = '';
}

function projectHeadline(project) {
  const brand = project.brand || project.client || '';
  const year = project.year ? String(project.year) : '';

  return `
    <span class="project-title-main">${escapeHtml(project.title)}</span>
    ${brand ? ` <span class="project-title-prefix">for </span><span class="project-title-brand">${escapeHtml(brand)}</span>` : ''}
    ${year ? ` <span class="project-title-year">${escapeHtml(year)}</span>` : ''}
  `;
}

function descriptionParagraphs(value = '') {
  return String(value)
    .split(/\n\s*\n/g)
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => `<p>${escapeHtml(part)}</p>`)
    .join('');
}

function metaExcerpt(value = '', max = 158) {
  const clean = String(value).replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const shortened = clean.slice(0, max - 1);
  const lastSpace = shortened.lastIndexOf(' ');
  return `${shortened.slice(0, lastSpace > 90 ? lastSpace : shortened.length).replace(/[.,;:!?\s]+$/, '')}…`;
}

try {
  if (!stage || !controls || !header || !copy || !lightbox || !lightboxStage || !lightboxCounter || !lightboxClose || !lightboxPrev || !lightboxNext) {
    throw new Error('Project layout could not initialize. Refresh the page to load the latest version.');
  }

  const [projects, site] = await Promise.all([loadProjects(), loadSite()]);
  hydrateHeader(site);

  const project = projects.find(item => item.slug === slug);
  if (!project) throw new Error('Project not found.');

  const brand = project.brand || project.client || '';
  const defaultSeoTitle = brand
    ? `${project.title} for ${brand} — ${site.name || 'Sebastian Tottrup'}`
    : `${project.title} — ${site.name || 'Sebastian Tottrup'}`;

  hydrateSeo(site, {
    title: project.seoTitle || defaultSeoTitle,
    description: project.seoDescription || metaExcerpt(project.description) || `${project.title}, a project by ${site.name || 'Sebastian Tottrup'}.`,
    path: `project.html?slug=${encodeURIComponent(project.slug)}`,
    image: project.seoImage || project.thumbnail,
    imageAlt: project.thumbnailAlt || project.title,
    type: 'article'
  });
  hydratePersonSchema(site);
  hydrateProjectSchema(site, project);

  const media = Array.isArray(project.media) && project.media.length
    ? project.media
    : [{ type: 'image', src: project.thumbnail, alt: project.thumbnailAlt || project.title }];

  let activeIndex = 0;
  let previousFocus = null;

  function renderStage({ animate = false } = {}) {
    replaceMedia(stage, mediaMarkup(media[activeIndex], project.title), { animate });
    const imageIsActive = mediaKind(media[activeIndex]) === 'image';
    stage.classList.toggle('is-clickable', imageIsActive);
    stage.setAttribute('tabindex', imageIsActive ? '0' : '-1');
    controls.innerHTML = `
      <button type="button" data-gallery-prev aria-label="Previous media">&lt;</button>
      <span>${String(activeIndex + 1).padStart(2, '0')} of ${String(media.length).padStart(2, '0')}</span>
      <button type="button" data-gallery-next aria-label="Next media">&gt;</button>
    `;
  }

  function renderLightbox({ animate = false } = {}) {
    replaceMedia(
      lightboxStage,
      mediaMarkup(media[activeIndex], project.title, { lightbox: true }),
      { animate }
    );
    lightboxCounter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(media.length).padStart(2, '0')}`;
  }

  function changeIndex(direction) {
    activeIndex = (activeIndex + direction + media.length) % media.length;
    renderStage({ animate: true });
    if (!lightbox.hidden) renderLightbox({ animate: true });
  }

  function openLightbox() {
    previousFocus = document.activeElement;
    renderLightbox();
    lightbox.hidden = false;
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-lightbox-open');
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-lightbox-open');
    clearMedia(lightboxStage);
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
  }

  controls.addEventListener('click', event => {
    if (event.target.closest('[data-gallery-prev]')) changeIndex(-1);
    if (event.target.closest('[data-gallery-next]')) changeIndex(1);
  });

  stage.addEventListener('click', () => {
    if (mediaKind(media[activeIndex]) === 'image') openLightbox();
  });

  stage.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && mediaKind(media[activeIndex]) === 'image') {
      event.preventDefault();
      openLightbox();
    }
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => changeIndex(-1));
  lightboxNext.addEventListener('click', () => changeIndex(1));

  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', event => {
    if (!lightbox.hidden) {
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowRight') changeIndex(1);
      if (event.key === 'ArrowLeft') changeIndex(-1);
      return;
    }

    if (event.key === 'ArrowRight') changeIndex(1);
    if (event.key === 'ArrowLeft') changeIndex(-1);
  });

  header.innerHTML = `
    <h1>${projectHeadline(project)}</h1>
    ${project.format ? `<p class="project-format">${escapeHtml(project.format)}</p>` : ''}
  `;

  const meta = [
    project.brand ? ['Brand', project.brand] : null,
    project.client && project.client !== project.brand ? ['Client', project.client] : null,
    project.role ? ['Role', project.role] : null
  ].filter(Boolean);

  copy.innerHTML = `
    ${descriptionParagraphs(project.description)}
    ${meta.length ? `
      <div class="project-copy-meta">
        ${meta.map(([label, value]) => `<p><span>${escapeHtml(label)}</span><span>${escapeHtml(value)}</span></p>`).join('')}
      </div>
    ` : ''}
  `;

  renderStage();
  await revealPage({ imagesWithin: stage });
} catch (error) {
  if (stage) stage.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
  await revealPage();
}
