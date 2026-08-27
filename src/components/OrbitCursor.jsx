'use client';

import { useEffect, useRef } from 'react';

export default function OrbitCursor({ color = '#3b82f6', containerRef }) {
  const cursorRef = useRef(null);

  useEffect(() => {
    const container = containerRef?.current;
    const target = container || window;
    if (!cursorRef.current) return;

    let x = 0;
    let y = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = null;
    let shown = false;

    const draw = () => {
      frame = null;
      currentX += (x - currentX) * 0.18;
      currentY += (y - currentY) * 0.18;
      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      if (Math.abs(x - currentX) > 0.1 || Math.abs(y - currentY) > 0.1) frame = requestAnimationFrame(draw);
    };

    const move = (event) => {
      const bounds = container?.getBoundingClientRect();
      x = bounds ? event.clientX - bounds.left : event.clientX;
      y = bounds ? event.clientY - bounds.top : event.clientY;
      if (!shown && cursorRef.current) {
        shown = true;
        currentX = x;
        currentY = y;
        cursorRef.current.style.opacity = '1';
      }
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const hide = () => {
      shown = false;
      if (cursorRef.current) cursorRef.current.style.opacity = '0';
    };

    target.addEventListener('pointermove', move, { passive: true });
    if (container) container.addEventListener('pointerleave', hide);
    return () => {
      target.removeEventListener('pointermove', move);
      if (container) container.removeEventListener('pointerleave', hide);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [containerRef]);

  return (
    <div ref={cursorRef} className="absolute left-0 top-0 z-[60] h-0 w-0 pointer-events-none opacity-0 transition-opacity duration-200">
      <span className="absolute -left-4 -top-4 h-8 w-8 rounded-full border border-current opacity-70" style={{ color }} />
      <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-current" style={{ color }} />
      <span className="absolute -left-[1.85rem] -top-px h-px w-3 bg-current" style={{ color }} />
    </div>
  );
}
