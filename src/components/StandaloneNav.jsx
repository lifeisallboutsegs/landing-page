'use client';

import PillNav from '@/components/PillNav';

const NAV_ITEMS = [
  { label: 'Work', href: '/work' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: "Let's talk", href: '/contact' },
];

export default function StandaloneNav() {
  return (
    <div className="relative h-[52px] w-full [&>div]:!static [&>div]:!top-auto [&>div]:!w-full [&_nav]:!w-full [&_nav]:!max-w-none [&_nav]:!justify-between">
      <PillNav
        logo="/favicon.svg"
        logoAlt="Digital Web Assurances"
        homeHref="/"
        items={NAV_ITEMS}
        baseColor="#0b0b12"
        pillColor="#ffffff"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#0b0b12"
        initialLoadAnimation={false}
      />
    </div>
  );
}
