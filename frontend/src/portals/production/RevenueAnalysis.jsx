import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRevenueAnalysis } from '../../api/hooks';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import {
  CurrencyDollarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const fmt = (n) =>
  `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const SEGMENTS = [
  { key: 'talent_cost',          label: 'Talent',          color: 'bg-indigo-400' },
  { key: 'crew_cost',            label: 'Crew',            color: 'bg-violet-400' },
  { key: 'equipment_cost',       label: 'Equipment',       color: 'bg-blue-400' },
  { key: 'location_cost',        label: 'Location',        color: 'bg-amber-400' },
  { key: 'catering_cost',        label: 'Catering',        color: 'bg-emerald-400' },
  { key: 'travel_cost',          label: 'Travel',          color: 'bg-orange-400' },
  { key: 'gas_cost',             label: 'Gas',             color: 'bg-lime-400' },
  { key: 'post_production_cost', label: 'Post Production', color: 'bg-pink-400' },
  { key: 'other_cost',           label: 'Other',           color: 'bg-gray-400' },
];

/* ── Stacked breakdown bar ─────────────────────────────────────────────────── */
function BreakdownBar({ project }) {
  const total = Math.max(project.revenue, project.total_expenses);
  if (total === 0) return <span className="text-xs text-gray-300 italic">No data</span>;

  const segments = SEGMENTS.map((s) => ({
    ...s,
    amount: project[s.key],
    pct: Math.max((project[s.key] / total) * 100, 0),
  })).filter((s) => s.amount > 0);

  const profitPct = project.profit > 0 ? (project.profit / total) * 100 : 0;

  return (
    <div className="flex h-4 rounded-full overflow-hidden bg-gray-100 w-full">
      {segments.map((s) => (
        <div
          key={s.key}
          className={`h-full ${s.color} flex-shrink-0`}
          style={{ width: `${s.pct}%` }}
          title={`${s.label}: ${fmt(s.amount)}`}
        />
      ))}
      {profitPct > 0 && (
        <div
          className="h-full bg-emerald-400 flex-shrink-0"
          style={{ width: `${profitPct}%` }}
          title={`Profit: ${fmt(project.profit)}`}
        />
      )}
    </div>
  );
}

/* ── Per-client collapsible card ───────────────────────────────────────────── */
function ClientCard({ client }) {
  const [open, setOpen] = useState(true);
  const marginPct =
    client.total_revenue > 0
      ? Math.round((client.total_profit / client.total_revenue) * 100)
      : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Client header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-gray-50 to-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
            {client.client_name[0]}
          </div>
          <div>
            <span className="font-semibold text-gray-900">{client.client_name}</span>
            <span className="ml-2 text-xs text-gray-400">
              {client.projects.length} production{client.projects.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-6 text-sm">
            <div className="text-right">
              <p className="text-[11px] text-gray-400">Revenue</p>
              <p className="font-semibold text-gray-900">{fmt(client.total_revenue)}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-400">Expenses</p>
              <p className="font-semibold text-gray-700">{fmt(client.total_expenses)}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-400">Profit</p>
              <p className={`font-semibold ${client.total_profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {fmt(client.total_profit)}
                <span className="text-xs font-normal ml-1 text-gray-400">({marginPct}%)</span>
              </p>
            </div>
          </div>
          {open
            ? <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            : <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />}
        </div>
      </button>

      {open && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="w-8 px-5 py-2.5" />
                <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Production
                </th>
                <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Revenue
                </th>
                <th className="px-5 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider min-w-[200px]">
                  Cost Distribution
                </th>
                <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-3 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {client.projects.map((project) => {
                const projMargin =
                  project.revenue > 0
                    ? Math.round((project.profit / project.revenue) * 100)
                    : 0;
                return (
                  <tr
                    key={project.id}
                    className={`transition-colors ${
                      project.most_profitable
                        ? 'bg-amber-50/50 hover:bg-amber-50'
                        : 'hover:bg-indigo-50/30'
                    }`}
                  >
                    <td className="pl-5 pr-2 py-3.5 text-center">
                      {project.most_profitable && (
                        <StarIconSolid
                          className="w-4 h-4 text-amber-400 mx-auto"
                          title="Most profitable production"
                        />
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      <Link
                        to={`/production/projects/${project.id}`}
                        className="font-medium text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {project.revenue > 0 ? fmt(project.revenue) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <BreakdownBar project={project} />
                      {(project.revenue > 0 || project.total_expenses > 0) && (
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                          {SEGMENTS.filter((s) => project[s.key] > 0).map((s) => (
                            <span key={s.key} className="flex items-center gap-1 text-[10px] text-gray-400">
                              <span className={`w-2 h-2 rounded-sm ${s.color}`} />
                              {s.label} {fmt(project[s.key])}
                            </span>
                          ))}
                          {project.profit > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-500">
                              <span className="w-2 h-2 rounded-sm bg-emerald-400" />
                              Profit {fmt(project.profit)}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-right whitespace-nowrap">
                      {project.revenue > 0 ? (
                        <>
                          <p
                            className={`text-sm font-semibold ${
                              project.profit >= 0 ? 'text-emerald-600' : 'text-red-500'
                            }`}
                          >
                            {project.profit >= 0 ? '+' : ''}
                            {fmt(project.profit)}
                          </p>
                          <p className="text-[11px] text-gray-400">{projMargin}% margin</p>
                        </>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={project.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Client subtotal */}
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td colSpan={2} className="pl-5 pr-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Client Total
                </td>
                <td className="px-3 py-3 text-right text-sm font-bold text-gray-900 whitespace-nowrap">
                  {fmt(client.total_revenue)}
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {SEGMENTS.map((s) => {
                      const total = client.projects.reduce((acc, p) => acc + p[s.key], 0);
                      if (total === 0) return null;
                      return (
                        <span key={s.key} className="flex items-center gap-1 text-[11px] text-gray-500">
                          <span className={`w-2.5 h-2.5 rounded-sm ${s.color} opacity-80`} />
                          {s.label}: {fmt(total)}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-3 py-3 text-right whitespace-nowrap">
                  <p
                    className={`text-sm font-bold ${
                      client.total_profit >= 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {client.total_profit >= 0 ? '+' : ''}{fmt(client.total_profit)}
                  </p>
                  <p className="text-[11px] text-gray-400">{marginPct}% margin</p>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────────── */
export default function RevenueAnalysis() {
  const { data, isLoading } = useRevenueAnalysis();

  const overallMargin =
    data?.total_revenue > 0
      ? Math.round((data.total_profit / data.total_revenue) * 100)
      : 0;
  const totalProductions = data?.clients.reduce((s, c) => s + c.projects.length, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-100 rounded-xl">
          <CurrencyDollarIcon className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Analysis</h1>
          <p className="text-sm text-gray-500">
            Revenue, cost breakdown and profitability across all productions
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : !data ? null : (
        <>
          {/* Global KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Revenue', value: fmt(data.total_revenue),
                sub: 'from paid invoices', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-100',
              },
              {
                label: 'Total Expenses', value: fmt(data.total_expenses),
                sub: 'all cost categories', bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-100',
              },
              {
                label: 'Net Profit', value: fmt(data.total_profit),
                sub: `${overallMargin}% overall margin`,
                bg: data.total_profit >= 0 ? 'bg-indigo-50' : 'bg-red-50',
                text: data.total_profit >= 0 ? 'text-indigo-700' : 'text-red-600',
                ring: data.total_profit >= 0 ? 'ring-indigo-100' : 'ring-red-100',
              },
              {
                label: 'Productions', value: totalProductions,
                sub: `across ${data.clients.length} client${data.clients.length !== 1 ? 's' : ''}`,
                bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-100',
              },
            ].map((k) => (
              <div key={k.label} className={`${k.bg} ring-1 ${k.ring} rounded-2xl p-4`}>
                <p className="text-xs text-gray-500 font-medium">{k.label}</p>
                <p className={`text-2xl font-bold mt-1 ${k.text}`}>{k.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Colour legend */}
          <div className="flex items-center flex-wrap gap-x-5 gap-y-2 px-1">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide mr-1">
              Breakdown key:
            </span>
            {SEGMENTS.map((s) => (
              <span key={s.key} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className={`w-3 h-3 rounded-sm ${s.color}`} />
                {s.label}
              </span>
            ))}
            <span className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="w-3 h-3 rounded-sm bg-emerald-400" />
              Profit
            </span>
            <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium ml-4">
              <StarIconSolid className="w-3.5 h-3.5 text-amber-400" />
              Most profitable production
            </span>
          </div>

          {/* Client cards */}
          {data.clients.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-sm text-gray-400">
              No data yet. Add paid invoices and expenses to see revenue analysis.
            </div>
          ) : (
            <div className="space-y-4">
              {data.clients.map((client) => (
                <ClientCard key={client.client_name} client={client} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
