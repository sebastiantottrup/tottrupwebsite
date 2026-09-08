(() => {
  const SELECTOR = '.work-page, .project-copy-scroll';
  const MIN_THUMB = 32;

  function initCustomScrollbar(target) {
    if (!target || target.dataset.customScrollbarReady === 'true') return;

    const parent = target.parentElement;
    if (!parent) return;

    target.dataset.customScrollbarReady = 'true';
    target.classList.add('custom-scrollbar-target');
    parent.classList.add('custom-scrollbar-parent');

    const track = document.createElement('div');
    track.className = 'custom-scrollbar';
    track.setAttribute('aria-hidden', 'true');

    const thumb = document.createElement('div');
    thumb.className = 'custom-scrollbar__thumb';
    track.appendChild(thumb);
    parent.appendChild(track);

    let dragging = false;
    let dragStartY = 0;
    let dragStartScrollTop = 0;

    function metrics() {
      const viewport = target.clientHeight;
      const content = target.scrollHeight;
      const maxScroll = Math.max(0, content - viewport);
      const thumbHeight = maxScroll > 0
        ? Math.max(MIN_THUMB, Math.min(viewport, Math.round((viewport / content) * viewport)))
        : viewport;
      const maxThumbTravel = Math.max(0, viewport - thumbHeight);
      return { viewport, content, maxScroll, thumbHeight, maxThumbTravel };
    }

    function update() {
      const { viewport, maxScroll, thumbHeight, maxThumbTravel } = metrics();

      track.style.top = `${target.offsetTop}px`;
      track.style.height = `${viewport}px`;

      /* Do not draw a fake scrollbar when there is nothing to scroll. */
      track.hidden = maxScroll <= 1 || viewport <= 0;
      if (track.hidden) return;

      const ratio = maxScroll ? target.scrollTop / maxScroll : 0;
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${Math.round(ratio * maxThumbTravel)}px)`;
    }

    target.addEventListener('scroll', update, { passive: true });

    track.addEventListener('pointerdown', event => {
      if (event.target === thumb) return;

      const rect = track.getBoundingClientRect();
      const { thumbHeight, maxScroll, maxThumbTravel } = metrics();
      if (!maxScroll || !maxThumbTravel) return;

      const desiredTop = Math.max(
        0,
        Math.min(maxThumbTravel, event.clientY - rect.top - thumbHeight / 2)
      );
      target.scrollTop = (desiredTop / maxThumbTravel) * maxScroll;
    });

    thumb.addEventListener('pointerdown', event => {
      dragging = true;
      dragStartY = event.clientY;
      dragStartScrollTop = target.scrollTop;
      thumb.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    thumb.addEventListener('pointermove', event => {
      if (!dragging) return;
      const { maxScroll, maxThumbTravel } = metrics();
      if (!maxScroll || !maxThumbTravel) return;

      const deltaY = event.clientY - dragStartY;
      target.scrollTop = dragStartScrollTop + (deltaY / maxThumbTravel) * maxScroll;
    });

    const stopDragging = event => {
      if (!dragging) return;
      dragging = false;
      try { thumb.releasePointerCapture(event.pointerId); } catch (_) {}
    };

    thumb.addEventListener('pointerup', stopDragging);
    thumb.addEventListener('pointercancel', stopDragging);

    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(update);
      resizeObserver.observe(target);
      if (target.firstElementChild) resizeObserver.observe(target.firstElementChild);
    }

    const mutationObserver = new MutationObserver(() => requestAnimationFrame(update));
    mutationObserver.observe(target, { childList: true, subtree: true, characterData: true });

    window.addEventListener('resize', update, { passive: true });
    requestAnimationFrame(update);
    window.setTimeout(update, 100);
    window.setTimeout(update, 500);
  }

  function initAll() {
    document.querySelectorAll(SELECTOR).forEach(initCustomScrollbar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll, { once: true });
  } else {
    initAll();
  }
})();
