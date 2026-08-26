'use client';

import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';

export default function BlobCursor({
  blobType = 'circle',
  fillColor = 'rgba(99, 102, 241, 0.45)',
  trailCount = 3,
  sizes = [55, 110, 75],
  innerSizes = [18, 32, 22],
  innerColor = 'rgba(255,255,255,0.95)',
  opacities = [0.75, 0.6, 0.45],
  shadowColor = 'rgba(99, 102, 241, 0.25)',
  shadowBlur = 12,
  shadowOffsetX = 0,
  shadowOffsetY = 4,
  filterId = 'blob',
  filterStdDeviation = 24,
  filterColorMatrixValues = '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 35 -10',
  useFilter = true,
  fastDuration = 0.15,
  slowDuration = 0.6,
  fastEase = 'power3.out',
  slowEase = 'power1.out',
  zIndex = 9999
}) {
  const containerRef = useRef(null);
  const blobsRef = useRef([]);

  const handleMove = useCallback(e => {
    const x = 'clientX' in e ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const y = 'clientY' in e ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

    blobsRef.current.forEach((el, i) => {
      if (!el) return;
      const isLead = i === 0;
      gsap.to(el, {
        x: x,
        y: y,
        duration: isLead ? fastDuration : slowDuration,
        ease: isLead ? fastEase : slowEase
      });
    });
  }, [fastDuration, slowDuration, fastEase, slowEase]);

  useEffect(() => {
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('touchmove', handleMove);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, [handleMove]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none w-screen h-screen overflow-hidden"
      style={{ zIndex }}>
      {useFilter && (
        <svg className="absolute w-0 h-0 pointer-events-none">
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation={filterStdDeviation} />
            <feColorMatrix in="blur" values={filterColorMatrixValues} />
          </filter>
        </svg>
      )}

      <div
        className="pointer-events-none absolute inset-0 overflow-hidden select-none"
        style={{ filter: useFilter ? `url(#${filterId})` : undefined }}>
        {Array.from({ length: trailCount }).map((_, i) => (
          <div
            key={i}
            ref={el => {
              blobsRef.current[i] = el;
            }}
            className="absolute top-0 left-0 will-change-transform transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: sizes[i] || 60,
              height: sizes[i] || 60,
              borderRadius: blobType === 'circle' ? '50%' : '0',
              backgroundColor: fillColor,
              opacity: opacities[i] || 0.6,
              boxShadow: `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px 0 ${shadowColor}`
            }}>
            <div
              className="absolute"
              style={{
                width: innerSizes[i] || 20,
                height: innerSizes[i] || 20,
                top: ((sizes[i] || 60) - (innerSizes[i] || 20)) / 2,
                left: ((sizes[i] || 60) - (innerSizes[i] || 20)) / 2,
                backgroundColor: innerColor,
                borderRadius: blobType === 'circle' ? '50%' : '0'
              }} />
          </div>
        ))}
      </div>
    </div>
  );
}
