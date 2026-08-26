import React from 'react';
import ScrollFloat from '@/components/ScrollFloat';
import ScrollReveal from '@/components/ScrollReveal';

/**
 * Shared editorial header for every snap. Composed from the React Bits
 * scroll-driven text components so the type moves with the scroll rather than
 * fading in on a timer.
 */
export default function SectionIntro({ headline, body, align = 'left' }) {
  const centred = align === 'center';

  return (
    <div
      className={`relative mx-auto w-full max-w-[1600px] px-8 pt-28 pb-10 md:px-16 ${
        centred ? 'text-center' : ''
      }`}
    >
      <ScrollFloat
        containerClassName={`mb-7 !overflow-visible ${centred ? 'text-center' : ''}`}
        textClassName="!text-[clamp(2.4rem,5vw,4.8rem)] !leading-[1.08] !font-semibold tracking-[-0.045em] text-ink"
        animationDuration={1.1}
        ease="power3.out"
        scrollStart="center bottom+=40%"
        scrollEnd="bottom bottom-=30%"
        stagger={0.022}
      >
        {headline}
      </ScrollFloat>

      <ScrollReveal
        containerClassName={`max-w-2xl !overflow-visible ${centred ? 'mx-auto' : ''}`}
        textClassName="!text-[1.12rem] !leading-relaxed !font-normal text-ink-soft"
        baseOpacity={0.12}
        baseRotation={2}
        blurStrength={5}
        enableBlur
      >
        {body}
      </ScrollReveal>
    </div>
  );
}
