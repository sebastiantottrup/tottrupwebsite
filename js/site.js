const CONTENT_ROOT = './content';
const PAGE_LOAD_STARTED = performance.now();
const MIN_LOADING_TIME = 280;
const PAGE_FADE_TIME = 180;

function delay(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

function isInternalNavigation(link, event) {
  if (!link || event.defaultPrevented) return false;
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (link.target && link.target !== '_self') return false;
  if (link.hasAttribute('download')) return false;

  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;

  const url = new URL(link.href, window.location.href);
  if (!['http:', 'https:'].includes(url.protocol)) return false;
  if (url.origin !== window.location.origin) return false;

  const sameDocument = url.pathname === window.location.pathname &&
    url.search === window.location.search &&
    url.hash;
  return !sameDocument;
}

function setupPageTransitions() {
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!isInternalNavigation(link, event)) return;

    event.preventDefault();
    document.body.dataset.pageState = 'leaving';

    window.setTimeout(() => {
      window.location.href = link.href;
    }, PAGE_FADE_TIME);
  });

  window.addEventListener('pageshow', event => {
    if (event.persisted && document.body.dataset.pageState === 'leaving') {
      document.body.dataset.pageState = 'ready';
    }
  });
}

setupPageTransitions();

export async function loadJson(filename) {
  const response = await fetch(`${CONTENT_ROOT}/${filename}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Could not load ${filename}.`);
  return response.json();
}

export async function loadProjects() {
  const data = await loadJson('projects.json');
  return Array.isArray(data.projects) ? data.projects : [];
}

export async function loadSite() {
  return loadJson('site.json');
}

export async function waitForImages(root, timeout = 1200) {
  if (!root) return;
  const images = [...root.querySelectorAll('img')];
  if (!images.length) return;

  const ready = Promise.all(images.map(image => {
    if (image.complete) {
      return typeof image.decode === 'function' ? image.decode().catch(() => {}) : Promise.resolve();
    }

    return new Promise(resolve => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  }));

  await Promise.race([ready, delay(timeout)]);
}

export async function revealPage({ imagesWithin = null } = {}) {
  if (imagesWithin) await waitForImages(imagesWithin);

  const elapsed = performance.now() - PAGE_LOAD_STARTED;
  if (elapsed < MIN_LOADING_TIME) await delay(MIN_LOADING_TIME - elapsed);

  requestAnimationFrame(() => {
    document.body.dataset.pageState = 'ready';
  });
}

export function hydrateChrome(site) {
  document.querySelectorAll('[data-site-name]').forEach(element => {
    element.textContent = site.name || 'YOUR NAME';
  });

  document.querySelectorAll('[data-copyright]').forEach((element, index) => {
    const currentYear = new Date().getFullYear();
    const startYear = Number(site.copyrightStartYear || 0);
    const years = startYear && startYear < currentYear
      ? `${startYear}–${currentYear}`
      : `${currentYear}`;
    const copyright = `${site.name || 'YOUR NAME'} © ${years}`;
    const credit = site.siteCredit || `Site design + development — ${site.name || 'YOUR NAME'} / ${currentYear}`;
    const creditId = `site-credit-${index + 1}`;

    element.classList.add('site-credit-trigger');
    element.setAttribute('role', 'button');
    element.setAttribute('tabindex', '0');
    element.setAttribute('aria-expanded', 'false');
    element.setAttribute('aria-controls', creditId);
    element.setAttribute('aria-label', `${copyright}. Site credit.`);
    element.innerHTML = `
      <span class="site-credit-trigger__label"></span>
      <span class="site-credit-popover" id="${creditId}" hidden></span>
    `;

    const label = element.querySelector('.site-credit-trigger__label');
    const popover = element.querySelector('.site-credit-popover');
    label.textContent = copyright;
    popover.textContent = credit;

    const setOpen = open => {
      element.classList.toggle('is-open', open);
      element.setAttribute('aria-expanded', open ? 'true' : 'false');
      popover.hidden = !open;
    };

    const toggle = event => {
      event.stopPropagation();
      setOpen(!element.classList.contains('is-open'));
    };

    element.addEventListener('click', toggle);
    element.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle(event);
      }
      if (event.key === 'Escape') setOpen(false);
    });

    document.addEventListener('click', event => {
      if (!element.contains(event.target)) setOpen(false);
    });
  });
}

export const hydrateHeader = hydrateChrome;

export function projectUrl(project) {
  return `project.html?slug=${encodeURIComponent(project.slug)}`;
}

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function mediaKind(item = {}) {
  if (item.type) return item.type;
  const src = String(item.src || '').toLowerCase();
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/.test(src) ? 'video' : 'image';
}

export function sortProjects(projects) {
  return [...projects].sort((a, b) => {
    const yearDiff = Number(b.year || 0) - Number(a.year || 0);
    if (yearDiff) return yearDiff;
    return String(a.title || '').localeCompare(String(b.title || ''));
  });
}
