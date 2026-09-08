(() => {
  const SLIDE_DURATION = 360;
  const NORMAL_NAV_DELAY = 180;

  const style = document.createElement('style');
  style.textContent = `
    .site-footer {
      transform: translateY(0);
      transition: transform ${SLIDE_DURATION}ms cubic-bezier(.22, .61, .36, 1);
      will-change: transform;
    }
    body[data-menu-sliding="true"] .site-footer {
      transform: translateY(var(--menu-slide-y, 0px));
    }
    @media (prefers-reduced-motion: reduce) {
      .site-footer { transition: none !important; }
    }
  `;
  document.head.appendChild(style);

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

  function currentIsHome() {
    return Boolean(document.querySelector('.page--home'));
  }

  function targetIsHome(link) {
    const href = (link.getAttribute('href') || '').trim();
    const url = new URL(link.href, window.location.href);
    return href === 'index.html' ||
      href === './index.html' ||
      href === './' ||
      url.pathname.endsWith('/index.html');
  }

  function targetContentHeight(home) {
    const root = getComputedStyle(document.documentElement);
    const fixedHeight = parseFloat(root.getPropertyValue('--fixed-content-height')) || 500;
    const homeHeight = parseFloat(root.getPropertyValue('--home-height')) || 250;

    if (home) {
      const horizontalGutter = window.innerWidth <= 590 ? 20 : 32;
      return Math.min(homeHeight, Math.max(0, (window.innerWidth - horizontalGutter) * 0.4545));
    }

    const reservedViewportSpace = window.innerWidth <= 700 ? 105 : 120;
    return Math.min(fixedHeight, Math.max(0, window.innerHeight - reservedViewportSpace));
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!isInternalNavigation(link, event)) return;

    const fromHome = currentIsHome();
    const toHome = targetIsHome(link);

    // All non-home pages already share one fixed height, so their menu
    // position does not need a vertical transition.
    if (fromHome === toHome) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    document.body.dataset.pageState = 'leaving';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      window.setTimeout(() => {
        window.location.href = link.href;
      }, NORMAL_NAV_DELAY);
      return;
    }

    const main = document.querySelector('.site-shell > main');
    const currentHeight = main ? main.getBoundingClientRect().height : targetContentHeight(fromHome);
    const nextHeight = targetContentHeight(toHome);

    // The complete site object is vertically centered. Increasing the
    // content height by 250px therefore moves the footer down by 125px.
    const footerDistance = (nextHeight - currentHeight) / 2;
    document.body.style.setProperty('--menu-slide-y', `${footerDistance}px`);

    requestAnimationFrame(() => {
      document.body.dataset.menuSliding = 'true';
    });

    window.setTimeout(() => {
      window.location.href = link.href;
    }, SLIDE_DURATION + 20);
  }, true);
})();
