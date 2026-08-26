import { desc, sql as raw } from 'drizzle-orm';

import { db, schema } from '@/server/db/index.js';

export const dynamic = 'force-dynamic';

const STATUS_STYLES = {
  new: 'bg-cobalt/10 text-cobalt',
  contacted: 'bg-amber-100 text-amber-800',
  qualified: 'bg-emerald-100 text-emerald-800',
  won: 'bg-emerald-600 text-white',
  lost: 'bg-zinc-200 text-zinc-600',
};

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-line bg-paper px-6 py-5">
      <span className="mb-2 block text-[0.75rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </span>
      <span className="text-[1.9rem] font-semibold tracking-[-0.03em]">{value}</span>
    </div>
  );
}

export default async function AdminLeadsPage() {
  const rows = await db.select().from(schema.leads).orderBy(desc(schema.leads.createdAt)).limit(200);

  const [counts] = await db
    .select({
      total: raw`count(*)::int`,
      last7: raw`count(*) filter (where created_at > now() - interval '7 days')::int`,
      fromAds: raw`count(*) filter (where gclid is not null or utm_source is not null)::int`,
      unhandled: raw`count(*) filter (where status = 'new')::int`,
    })
    .from(schema.leads);

  return (
    <div>
      <h1 className="mb-8 text-[1.6rem] font-semibold tracking-[-0.03em]">Leads</h1>

      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Total" value={counts?.total ?? 0} />
        <Stat label="Last 7 days" value={counts?.last7 ?? 0} />
        <Stat label="From campaigns" value={counts?.fromAds ?? 0} />
        <Stat label="Unhandled" value={counts?.unhandled ?? 0} />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-paper px-6 py-16 text-center">
          <p className="text-[0.95rem] text-ink-soft">
            No enquiries yet. They will appear here the moment the form is submitted.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-paper">
          <table className="w-full min-w-[860px] text-left text-[0.9rem]">
            <thead className="border-b border-line text-[0.75rem] uppercase tracking-[0.12em] text-ink-faint">
              <tr>
                <th className="px-5 py-4 font-medium">Received</th>
                <th className="px-5 py-4 font-medium">Contact</th>
                <th className="px-5 py-4 font-medium">Wants</th>
                <th className="px-5 py-4 font-medium">Source</th>
                <th className="px-5 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((lead) => (
                <tr key={lead.id} className="align-top transition-colors hover:bg-porcelain/60">
                  <td className="whitespace-nowrap px-5 py-4 text-ink-soft">
                    {new Date(lead.createdAt).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <span className="block font-medium">{lead.name}</span>
                    <a href={`mailto:${lead.email}`} className="block text-ink-soft hover:text-cobalt">
                      {lead.email}
                    </a>
                    {lead.website && (
                      <span className="block text-[0.82rem] text-ink-faint">{lead.website}</span>
                    )}
                  </td>
                  <td className="max-w-[22rem] px-5 py-4">
                    {lead.service && <span className="block font-medium">{lead.service}</span>}
                    {lead.message && (
                      <span className="block text-[0.85rem] leading-relaxed text-ink-soft">
                        {lead.message}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-[0.82rem] text-ink-soft">
                    {lead.utmSource || lead.gclid ? (
                      <>
                        <span className="block">{lead.utmSource ?? 'paid'}</span>
                        {lead.utmCampaign && (
                          <span className="block text-ink-faint">{lead.utmCampaign}</span>
                        )}
                        {lead.gclid && <span className="block text-ink-faint">gclid ✓</span>}
                      </>
                    ) : (
                      <span className="text-ink-faint">direct / organic</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-[0.75rem] font-medium ${
                        STATUS_STYLES[lead.status] ?? STATUS_STYLES.new
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
