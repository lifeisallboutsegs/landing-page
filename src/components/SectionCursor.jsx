'use client';

import { useEffect, useRef, useState } from 'react';
import Crosshair from '@/components/Crosshair';
import OrbitCursor from '@/components/OrbitCursor';
import TargetCursor from '@/components/TargetCursor';

// Cursor components render full-screen layers and some of them hide the native
// pointer. They need a single source of truth instead of letting each section
// independently react to IntersectionObserver callbacks.
const cursorSections = new Map();
let cursorOwner = null;
let frameId = null;

const refreshCursorOwner = () => {
  frameId = null;
  const viewportCenter = window.innerHeight / 2;
  let nextOwner = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  cursorSections.forEach(({ section }) => {
    const rect = section.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;

    // A section containing the reading position wins. For stacked content,
    // DOM registration order naturally favours the later visual layer.
    const distance = viewportCenter < rect.top
      ? rect.top - viewportCenter
      : viewportCenter > rect.bottom
        ? viewportCenter - rect.bottom
        : 0;

    if (distance <= nearestDistance) {
      nearestDistance = distance;
      nextOwner = section.id;
    }
  });

  if (nextOwner === cursorOwner) return;
  cursorOwner = nextOwner;
  cursorSections.forEach(({ setActive }, id) => setActive(id === cursorOwner));
};

const scheduleCursorOwnerRefresh = () => {
  if (frameId !== null) return;
  frameId = requestAnimationFrame(refreshCursorOwner);
};

const registerCursorSection = (section, setActive) => {
  cursorSections.set(section.id, { section, setActive });
  if (cursorSections.size === 1) {
    window.addEventListener('scroll', scheduleCursorOwnerRefresh, { passive: true });
    window.addEventListener('resize', scheduleCursorOwnerRefresh, { passive: true });
  }
  scheduleCursorOwnerRefresh();

  return () => {
    cursorSections.delete(section.id);
    if (cursorOwner === section.id) cursorOwner = null;
    setActive(false);
    if (cursorSections.size === 0) {
      window.removeEventListener('scroll', scheduleCursorOwnerRefresh);
      window.removeEventListener('resize', scheduleCursorOwnerRefresh);
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
    } else {
      scheduleCursorOwnerRefresh();
    }
  };
};

/*
 * Cursor effects are intentionally scoped to a visible story beat. Several of
 * the supplied cursors are full-screen canvases, so mounting them all at once
 * would make them compete for pointer events and GPU time. This controller
 * gives every snap a distinct cursor personality, one at a time.
 */
export default function SectionCursor({ sectionId, variant, color = '#1b4be0', targets }) {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const section = document.getElementById(sectionId);
    sectionRef.current = section;
    if (!section || window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return;

    return registerCursorSection(section, setActive);
  }, [sectionId]);

  if (!active) return null;

  if (variant === 'crosshair') return <Crosshair color={color} containerRef={sectionRef} />;
  if (variant === 'orbit') return <OrbitCursor color={color} containerRef={sectionRef} />;
  return <TargetCursor targetSelector={targets ?? `#${sectionId} a, #${sectionId} button`} cursorColor={color} cursorColorOnTarget="#ff8a5b" spinDuration={3.5} />;
}
