import { getAllTeam } from '@/server/content.js';
import { teamDefaults, TEAM_GROUPS } from '@/lib/about-content.js';
import TeamManager from './team-manager.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminTeamPage() {
  const rows = await getAllTeam();

  return (
    <div>
      <h1 className="mb-2 text-[1.6rem] font-semibold tracking-[-0.03em]">Team</h1>
      <p className="mb-8 max-w-xl text-[0.9rem] text-ink-soft">
        The people shown on <code className="rounded bg-porcelain px-1">/about</code>. Edit anyone
        inline, drag the order with the arrows, add a photo, or remove them. Lower “order” numbers
        come first within a group.
        {rows.length === 0 && ' The list is empty, so the page is showing the built-in roster below.'}
      </p>
      <TeamManager rows={rows} groups={TEAM_GROUPS} seed={teamDefaults} />
    </div>
  );
}
