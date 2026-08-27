import { useEffect, useRef, useState } from 'react';

/**
 * Two thresholds for one element, because mounting a background and running it
 * are separate decisions.
 *
 * Creating a WebGL context — compiling its shaders, allocating its buffers —
 * costs upwards of a hundred milliseconds on the main thread. Two things follow.
 *
 * `mounted` fires a viewport and a half early, so that cost is paid off screen
 * rather than on the snap boundary, where it read as a glitch at every
 * transition. And once it has fired it never goes back: tearing a context down
 * when a section scrolls away only means paying full price to build it again
 * when the reader scrolls back, which turned every change of direction into a
 * fresh stutter. A handful of contexts is well inside what a browser allows.
 *
 * What an early, permanent mount must not mean is an early, permanent render
 * loop — a full-screen fragment shader drawing a viewport away is pure waste
 * competing with the scroll for the same GPU. So `visible` tracks actual
 * intersection and keeps flipping both ways, and the shaders idle whenever it
 * is false.
 *
 * `eager` goes one step further for a background whose build cost is measured
 * in hundreds of milliseconds: it mounts on the first idle moment after load,
 * whether or not the section is anywhere near. That moment is the one place on
 * this page where a long task is free — the reader is at the hero and not
 * scrolling — and it means the thing is finished and waiting rather than
 * assembling itself in front of them when they finally arrive.
 *
 * @returns {[React.RefObject, boolean, boolean]} ref, mounted, visible
 */
export function useInView({ rootMargin = '150% 0px', visibleMargin = '10% 0px', eager = false } = {}) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!eager) return undefined;

    // `timeout` so a page that never goes idle still gets there.
    if (typeof requestIdleCallback === 'function') {
      const handle = requestIdleCallback(() => setMounted(true), { timeout: 3000 });
      return () => cancelIdleCallback(handle);
    }
    const handle = setTimeout(() => setMounted(true), 1200);
    return () => clearTimeout(handle);
  }, [eager]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mountObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setMounted(true);
      mountObserver.disconnect();
    }, { rootMargin });
    const visibleObserver = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: visibleMargin },
    );

    mountObserver.observe(el);
    visibleObserver.observe(el);

    return () => {
      mountObserver.disconnect();
      visibleObserver.disconnect();
    };
  }, [rootMargin, visibleMargin]);

  return [ref, mounted, visible];
}
