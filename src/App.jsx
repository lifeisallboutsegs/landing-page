'use client';

import React, { useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SmoothScroll } from '@/components/SmoothScroll';
import Loader from '@/sections/Loader';
import Hero from '@/sections/Hero';
import SnapBuild from '@/sections/SnapBuild';
import SnapAttract from '@/sections/SnapAttract';
import SnapConvert from '@/sections/SnapConvert';
import SnapProof from '@/sections/SnapProof';
import SnapDiagnose from '@/sections/SnapDiagnose';
import SnapStart from '@/sections/SnapStart';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  // The loader holds `body { overflow: hidden }` while it owns the screen, so
  // every scroll-driven measurement taken during that window — ScrollTrigger's
  // start/end positions and Framer Motion's useScroll targets alike — is taken
  // against a page that cannot scroll, and comes out as zero. Nothing
  // re-measures on its own afterwards, which left whole sections frozen at
  // their starting values. Re-measure once the page is actually scrollable.
  const handleLoaded = useCallback(() => {
    const resync = () => {
      ScrollTrigger.refresh();
      window.dispatchEvent(new Event('resize'));
    };
    requestAnimationFrame(resync);
    setTimeout(resync, 260);
  }, []);

  return (
    <SmoothScroll>
      <Loader onDone={handleLoaded} />
      <main className="w-full bg-paper font-sans text-ink antialiased">
        <Hero />
        <SnapBuild />
        <SnapAttract />
        <SnapConvert />
        <SnapProof />
        <SnapDiagnose />
        <SnapStart />
      </main>
    </SmoothScroll>
  );
}
