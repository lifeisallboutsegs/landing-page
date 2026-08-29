'use client';

import React from 'react';
import { SmoothScroll } from '@/components/SmoothScroll';
import { SiteContentProvider } from '@/lib/use-site-content';
import Hero from '@/sections/Hero';
import SnapBuild from '@/sections/SnapBuild';
import SnapAttract from '@/sections/SnapAttract';
import SnapConvert from '@/sections/SnapConvert';
import SnapProof from '@/sections/SnapProof';
import SnapFounder from '@/sections/SnapFounder';
import SnapDiagnose from '@/sections/SnapDiagnose';
import SnapStart from '@/sections/SnapStart';

export default function App({ content }) {
  return (
    <SiteContentProvider value={content}>
      <SmoothScroll>
        <main className="w-full bg-paper font-sans text-ink antialiased">
          <Hero />
          <SnapBuild />
          <SnapAttract />
          <SnapConvert />
          <SnapProof />
          <SnapFounder />
          <SnapDiagnose />
          <SnapStart />
        </main>
      </SmoothScroll>
    </SiteContentProvider>
  );
}
