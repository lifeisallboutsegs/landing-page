/**
 * Programmatic scrolling that cooperates with the Lenis smooth-scroll instance.
 *
 * Lenis drives `window` scroll from its own RAF loop, so a native
 * `element.scrollIntoView({ behavior: 'smooth' })` gets overwritten a frame
 * later and the page barely moves. Anything that wants to move the viewport in
 * code has to go through Lenis itself. `SmoothScroll` registers its instance
 * here on mount; callers use `scrollToElement`, which falls back to the native
 * API when Lenis is not mounted (SSR, reduced-motion bail-out, tests).
 */

let lenis = null;

export function setLenis(instance) {
  lenis = instance;
}

/**
 * @param {Element|null} target
 * @param {{ offset?: number, immediate?: boolean }} [opts]
 *   offset: pixels of breathing room above the element (negative = gap).
 */
export function scrollToElement(target, { offset = -96, immediate = false } = {}) {
  if (!target) return;

  if (lenis) {
    lenis.scrollTo(target, {
      offset,
      immediate,
      duration: immediate ? 0 : 1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
    return;
  }

  const top = window.scrollY + target.getBoundingClientRect().top + offset;
  window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' });
}
