'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { groupToSlug, groupedNav } from '@/lib/cms-schema';

const NAV = groupedNav();

function Item({ href, label, active }) {
  return (
    <Link
      href={href}
      className={`block truncate rounded-lg px-3 py-1.5 text-[0.85rem] transition-colors ${
        active ? 'bg-ink font-medium text-white' : 'text-ink-soft hover:bg-porcelain hover:text-ink'
      }`}
    >
      {label}
    </Link>
  );
}

export default function AdminSidebar() {
  const path = usePathname();
  const isActive = (href) => path === href;

  return (
    <nav className="shrink-0 space-y-6 md:sticky md:top-6 md:h-fit md:w-56">
      <div className="space-y-1">
        <Item href="/admin" label="Leads" active={isActive('/admin')} />
        <Item href="/admin/team" label="Team" active={isActive('/admin/team')} />
      </div>

      {NAV.map((bucket) => (
        <div key={bucket.label} className="space-y-1">
          <p className="px-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            {bucket.label}
          </p>
          {bucket.items.map((g) => {
            const href = `/admin/content/${groupToSlug(g.id)}`;
            return <Item key={g.id} href={href} label={g.label} active={isActive(href)} />;
          })}
        </div>
      ))}
    </nav>
  );
}
