import React from 'react';

/**
 * Shared editorial header for every snap. The previous per-character scroll
 * transform could travel into the supporting copy on short viewports. These
 * headers now stay in the document flow; section and card movement provides
 * the motion without ever compromising the reading order.
 */
export default function SectionIntro({ headline, body, align = 'left' }) {
  const centred = align === 'center';

  return (
    <div
      className={`relative mx-auto w-full max-w-[1600px] px-6 pt-20 pb-8 sm:px-8 sm:pt-28 sm:pb-10 md:px-16 ${
        centred ? 'text-center' : ''
      }`}
    >
      <h2 className="mb-7 max-w-5xl text-[clamp(2.4rem,5vw,4.8rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-ink">
        {headline}
      </h2>

      <p className={`max-w-2xl text-[1.12rem] leading-relaxed text-ink-soft ${centred ? 'mx-auto' : ''}`}>
        {body}
      </p>
    </div>
  );
}
