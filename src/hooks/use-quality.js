import { useEffect, useState } from 'react';

/**
 * How much decorative GPU work this visitor's device can absorb.
 *
 * Every snap on this page carries a full-screen fragment shader, and they
 * stack: a raymarched cloud field, a mouse-reactive lattice, a scan grid, a
 * globe. On a desktop GPU that is affordable. On a phone — or on any machine
 * where the compositor is already doing the work of a scroll-linked timeline —
 * it is not, and the cost lands as dropped frames in the middle of a scroll.
 *
 * So the page asks the device what it can take, once, and every background
 * reads the same answer:
 *
 * - NONE  no WebGL at all. Backgrounds fall back to CSS gradients, which are
 *         painted once and then cost nothing to scroll past.
 * - LOW   shaders render, but below native resolution and without the
 *         backdrop-filter effects that force a full-screen re-composite on
 *         every frame of an animated backdrop.
 * - HIGH  everything, at close to native resolution.
 *
 * Deliberately conservative about touch: a coarse pointer means the mouse-
 * reactive half of these effects can never fire anyway, so the shader would be
 * burning a phone's battery to draw something nobody can interact with.
 */
export const QUALITY = { NONE: 0, LOW: 1, HIGH: 2 };

const MEDIA = ['(prefers-reduced-motion: reduce)', '(pointer: coarse)', '(max-width: 900px)'];

export function measureQuality() {
  if (typeof window === 'undefined') return QUALITY.NONE;

  const [reduced, coarse, narrow] = MEDIA.map((query) => window.matchMedia(query).matches);
  if (reduced) return QUALITY.NONE;
  if (coarse || narrow) return QUALITY.NONE;

  // Neither number is reliable on its own — Safari reports no deviceMemory and
  // some laptops under-report cores — so treat a missing value as mid-range and
  // let the other signal decide.
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;

  if (cores <= 2 || memory <= 2) return QUALITY.NONE;
  if (cores <= 4 || memory <= 4) return QUALITY.LOW;
  return QUALITY.HIGH;
}

/**
 * Resolution ceiling for a full-screen shader. These backgrounds are soft
 * gradients and noise with no fine detail, so rendering below the device pixel
 * ratio and letting the compositor upscale is invisible — and pixel count is
 * the whole cost of a fragment shader.
 */
export function dprCapFor(tier) {
  return tier >= QUALITY.HIGH ? 1.5 : 1;
}

/**
 * Server render and first client render must agree, and neither can measure a
 * device — so start at NONE and settle after mount. That also keeps WebGL
 * context creation off the critical path of first paint.
 */
export function useQuality() {
  const [tier, setTier] = useState(QUALITY.NONE);

  useEffect(() => {
    const apply = () => setTier(measureQuality());
    apply();

    const lists = MEDIA.map((query) => window.matchMedia(query));
    lists.forEach((list) => list.addEventListener('change', apply));
    return () => lists.forEach((list) => list.removeEventListener('change', apply));
  }, []);

  return tier;
}
