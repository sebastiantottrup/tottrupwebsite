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

function absoluteUrl(site, value = '') {
  if (!value) return '';
  try {
    if (/^https?:\/\//i.test(value)) return new URL(value).href;
    if (site.siteUrl) return new URL(value, `${site.siteUrl.replace(/\/$/, '')}/`).href;
  } catch (_) {}
  return '';
}

function ensureMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function ensureLink(rel) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  return element;
}

export function hydrateSeo(site, {
  title,
  description,
  path = '',
  image = '',
  type = 'website',
  robots = 'index,follow,max-image-preview:large'
} = {}) {
  const siteName = site.name || 'Portfolio';
  const resolvedTitle = title || siteName;
  const resolvedDescription = description || site.seoDescription || site.intro || '';
  const canonical = site.siteUrl
    ? absoluteUrl(site, path || `${window.location.pathname}${window.location.search}`)
    : '';
  const resolvedImage = absoluteUrl(site, image || site.seoImage || '');

  document.title = resolvedTitle;
  ensureMeta('meta[name="description"]', { name: 'description', content: resolvedDescription });
  ensureMeta('meta[name="robots"]', { name: 'robots', content: robots });
  ensureMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: siteName });
  ensureMeta('meta[property="og:title"]', { property: 'og:title', content: resolvedTitle });
  ensureMeta('meta[property="og:description"]', { property: 'og:description', content: resolvedDescription });
  ensureMeta('meta[property="og:type"]', { property: 'og:type', content: type });
  ensureMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: resolvedImage ? 'summary_large_image' : 'summary' });
  ensureMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: resolvedTitle });
  ensureMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: resolvedDescription });

  if (canonical) {
    ensureLink('canonical').href = canonical;
    ensureMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
  }
  if (resolvedImage) {
    ensureMeta('meta[property="og:image"]', { property: 'og:image', content: resolvedImage });
    ensureMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: resolvedImage });
  }
}

export function injectJsonLd(id, data) {
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export function hydratePersonSchema(site) {
  const sameAs = [];
  if (site.instagram) sameAs.push(`https://instagram.com/${String(site.instagram).replace(/^@/, '')}`);
  if (site.strava) sameAs.push(site.strava);
  if (site.linkedin) sameAs.push(site.linkedin);
  if (site.website) sameAs.push(site.website);

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name || 'Portfolio owner',
    description: site.seoDescription || site.intro || undefined,
    url: site.siteUrl || undefined,
    email: site.email ? `mailto:${site.email}` : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    homeLocation: site.location ? {
      '@type': 'Place',
      name: site.location
    } : undefined
  };

  Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
  injectJsonLd('person-schema', data);
}

export function hydrateProjectSchema(site, project) {
  const canonical = site.siteUrl ? absoluteUrl(site, projectUrl(project)) : undefined;
  const image = absoluteUrl(site, project.seoImage || project.thumbnail || '');
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.seoDescription || project.description || undefined,
    dateCreated: project.year ? String(project.year) : undefined,
    creator: {
      '@type': 'Person',
      name: site.name || 'Portfolio owner'
    },
    image: image || undefined,
    url: canonical,
    genre: project.format || undefined,
    about: project.brand || project.client || undefined
  };
  Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
  injectJsonLd('project-schema', data);
}

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
