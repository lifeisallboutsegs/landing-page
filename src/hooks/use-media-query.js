import { useEffect, useState } from 'react';

/**
 * A media query as React state.
 *
 * Several snaps do not have a smaller version of themselves — a pinned
 * horizontal rail and a 200vh laptop are desktop compositions, and shrinking
 * them produces a worse layout rather than a smaller one. Those snaps render a
 * different tree below the breakpoint instead, which needs the breakpoint as a
 * value and not only as a class.
 *
 * Starts false so the server render and the first client render agree; the
 * narrow layout is the safe thing to render before the viewport is known.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    const apply = () => setMatches(list.matches);
    apply();
    list.addEventListener('change', apply);
    return () => list.removeEventListener('change', apply);
  }, [query]);

  return matches;
}
