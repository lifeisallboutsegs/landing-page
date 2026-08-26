import { useEffect, useRef, useState } from 'react';

/**
 * Every snap carries a WebGL background. Mounting them all at once means a
 * dozen live GL contexts competing for the GPU, which is what makes the scroll
 * stutter. This keeps only the backgrounds near the viewport alive.
 */
export function useInView({ rootMargin = '120% 0px' } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Creating a WebGL context costs tens of milliseconds. With a tight margin
    // that cost landed exactly on the snap boundary, which read as a glitch at
    // every transition. Mounting more than a viewport early moves the hitch
    // off-screen, where nobody sees it.
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, inView];
}
