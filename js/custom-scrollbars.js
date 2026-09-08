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

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

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

      track.hidden = maxScroll <= 1 || viewport <= 0;
      if (track.hidden) return;

      /* Safari can briefly report negative / beyond-max scrollTop while
         rubber-banding. Clamp the visual thumb so it never leaves the track. */
      const safeScrollTop = clamp(target.scrollTop, 0, maxScroll);
      const ratio = maxScroll ? safeScrollTop / maxScroll : 0;
      const thumbTop = clamp(Math.round(ratio * maxThumbTravel), 0, maxThumbTravel);

      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${thumbTop}px)`;
    }

    target.addEventListener('scroll', update, { passive: true });

    track.addEventListener('pointerdown', event => {
      if (event.target === thumb) return;

      const rect = track.getBoundingClientRect();
      const { thumbHeight, maxScroll, maxThumbTravel } = metrics();
      if (!maxScroll || !maxThumbTravel) return;

      const desiredTop = clamp(event.clientY - rect.top - thumbHeight / 2, 0, maxThumbTravel);
      target.scrollTop = clamp((desiredTop / maxThumbTravel) * maxScroll, 0, maxScroll);
    });

    thumb.addEventListener('pointerdown', event => {
      dragging = true;
      dragStartY = event.clientY;
      const { maxScroll } = metrics();
      dragStartScrollTop = clamp(target.scrollTop, 0, maxScroll);
      thumb.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    thumb.addEventListener('pointermove', event => {
      if (!dragging) return;
      const { maxScroll, maxThumbTravel } = metrics();
      if (!maxScroll || !maxThumbTravel) return;

      const deltaY = event.clientY - dragStartY;
      const nextScrollTop = dragStartScrollTop + (deltaY / maxThumbTravel) * maxScroll;
      target.scrollTop = clamp(nextScrollTop, 0, maxScroll);
    });

    const stopDragging = event => {
      if (!dragging) return;
      dragging = false;
      try { thumb.releasePointerCapture(event.pointerId); } catch (_) {}
      update();
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
