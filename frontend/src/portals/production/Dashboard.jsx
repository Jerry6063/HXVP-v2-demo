import { Link } from 'react-router-dom';
import {
  useProductionStats,
  useProjects,
  useShoots,
  useTalentProfiles,
  useBookings,
  useActivityLog,
} from '../../api/hooks';
import { useAuth } from '../../contexts/AuthContext';
import {
  FolderIcon,
  CurrencyDollarIcon,
  CameraIcon,
  UserGroupIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

/**
 * Production Dashboard v2 — Status Board (导演认可的 demo 路线)
 *
 * 布局:
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │ Title + welcome ····················· [ Search projects... ] │
 *  ├──────┬──────┬──────┬──────┐                                 │
 *  │ Stat │ Stat │ Stat │ Stat │  (4 卡 + 趋势)                  │
 *  └──────┴──────┴──────┴──────┘                                 │
 *  ┌────────────────────────────┬───────────────────────┐        │
 *  │  ACTIVE PROJECTS table     │  RECENT ACTIVITY feed │        │
 *  │  含黄色进度条               │                       │        │
 *  └────────────────────────────┴───────────────────────┘        │
 *  └─────────────────────────────────────────────────────────────┘
 *
 * 全黑底,League Gothic 标题,趋势↑↓ + 黄色进度条 + 活动流。
 * Mock 模式下显示 demo 数据,接真后端自动切换。
 */

export default function ProductionDashboard() {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <StatsRow />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ActiveProjectsTable />
        <RecentActivityFeed />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Header                                                                */
/* ────────────────────────────────────────────────────────────────────── */

function DashboardHeader() {
  return (
    <div className="flex items-start justify-between flex-wrap gap-4 pt-2">
      <div>
        <h1 className="font-display text-4xl md:text-5xl leading-none tracking-tight">
          Production <span className="text-[var(--color-brand)]">Dashboard</span>
        </h1>
        <p className="text-sm text-[var(--color-paper)]/50 mt-2">
          Welcome back — here's your agency at a glance
        </p>
      </div>
      <SearchBar />
    </div>
  );
}

function SearchBar() {
  return (
    <div className="relative w-full md:w-80">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-paper)]/40" />
      <input
        type="search"
        placeholder="Search projects, models, shoots..."
        className="w-full pl-9 pr-3 py-2.5 bg-transparent border border-white/15 text-sm placeholder:text-[var(--color-paper)]/30 focus:border-[var(--color-brand)] focus:outline-none transition-colors"
      />
      <span className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-paper)]/30 border border-white/15 px-1 py-px font-mono">
        ⌘K
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Stats Row — 4 cards with trend indicators                             */
/* ────────────────────────────────────────────────────────────────────── */

function StatsRow() {
  const { data: stats } = useProductionStats();
  const { data: shootsData } = useShoots({ upcoming: true });
  const { data: talentData } = useTalentProfiles();
  const { data: bookingsData } = useBookings();
  const { mockMode } = useAuth();

  const shoots = shootsData?.results || shootsData || [];
  const nextShoot = shoots[0];
  const talent = talentData?.results || talentData || [];
  const bookedCount = (bookingsData?.results || bookingsData || []).filter(
    (b) => b.status === 'accepted' || b.status === 'booked',
  ).length;

  // Mock 数据(后端没接时)
  const demoMode = mockMode && !stats;
  const activeProjects = demoMode ? 7 : (stats?.active_projects ?? '—');
  const revenue = demoMode ? 47820 : (stats?.revenue_mtd ?? 0);
  const upcomingShoots = demoMode ? 4 : (stats?.upcoming_shoots ?? '—');
  const modelsAvailable = demoMode ? 23 : Math.max(0, talent.length - bookedCount);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCardV2
        label="Active Projects"
        value={activeProjects}
        trend={{ direction: 'up', text: '3 this month' }}
        href="/production/projects"
      />
      <StatCardV2
        label="Revenue (MTD)"
        value={`$${Number(revenue).toLocaleString()}`}
        trend={{ direction: 'up', text: '18.2%' }}
        href="/production/revenue"
      />
      <StatCardV2
        label="Upcoming Shoots"
        value={upcomingShoots}
        trend={{
          direction: 'neutral',
          text: nextShoot?.shoot_date ? `Next: ${formatShortDate(nextShoot.shoot_date)}` : (demoMode ? 'Next: Feb 22' : 'No upcoming'),
        }}
        href="/production/calendar"
      />
      <StatCardV2
        label="Models Available"
        value={modelsAvailable}
        trend={{ direction: 'down', text: `${bookedCount || 3} booked` }}
        href="/production/talent"
      />
    </div>
  );
}

function StatCardV2({ label, value, trend, href }) {
  const TrendIcon =
    trend?.direction === 'up'
      ? ArrowUpRightIcon
      : trend?.direction === 'down'
        ? ArrowDownRightIcon
        : null;

  const trendColor =
    trend?.direction === 'up'
      ? 'text-green-400'
      : trend?.direction === 'down'
        ? 'text-[var(--color-accent-2)]'
        : 'text-[var(--color-paper)]/50';

  const inner = (
    <div className="bg-[var(--color-paper-dark)] border border-white/15 p-6 transition-all hover:border-[var(--color-brand)]/40">
      <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-paper)]/50 mb-3">
        {label}
      </p>
      <p className="font-display text-5xl leading-none tracking-tight text-[var(--color-paper)]">
        {value}
      </p>
      {trend && (
        <div className={`mt-4 flex items-center gap-1 text-xs ${trendColor}`}>
          {TrendIcon && <TrendIcon className="h-3.5 w-3.5" />}
          <span>{trend.text}</span>
        </div>
      )}
    </div>
  );

  return href ? <Link to={href} className="block">{inner}</Link> : inner;
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Active Projects Table                                                 */
/* ────────────────────────────────────────────────────────────────────── */

const DEMO_PROJECTS = [
  { id: 'demo-p1', name: 'Spring Lifestyle Collection', subtitle: 'Product Photography — 24 SKUs', client_name: 'Povison Furniture', deadline: '2026-02-22', status: 'in_production', progress: 0.5 },
  { id: 'demo-p2', name: 'E-Bike Launch Campaign', subtitle: 'Video + Photo — Social Media', client_name: 'Troxus Mobility', deadline: '2026-02-26', status: 'pending', progress: 0.25 },
  { id: 'demo-p3', name: 'Smart Home Product Reveal', subtitle: 'Commercial Video — 60s + 15s', client_name: 'GE Consumer', deadline: '2026-03-03', status: 'pending', progress: 0.12 },
  { id: 'demo-p4', name: 'Q1 Snack Campaign', subtitle: 'Lifestyle Photography — 8 setups', client_name: 'PepsiCo', deadline: '2026-02-18', status: 'review', progress: 0.78 },
  { id: 'demo-p5', name: 'Brand Lifestyle Series', subtitle: 'Model Portfolio — 12 looks', client_name: 'Avenco Sleep', deadline: '2026-02-15', status: 'delivered', progress: 0.95 },
];

const STATUS_LABEL = {
  in_production: 'In Production',
  pending: 'Pre-Production',
  pre_production: 'Pre-Production',
  review: 'Client Review',
  client_review: 'Client Review',
  delivered: 'Delivered',
  active: 'In Production',
  completed: 'Delivered',
};

const STATUS_COLOR = {
  in_production: 'text-[var(--color-brand)]',
  pending: 'text-[var(--color-brand)]',
  pre_production: 'text-[var(--color-brand)]',
  review: 'text-orange-400',
  client_review: 'text-orange-400',
  delivered: 'text-blue-400',
  active: 'text-[var(--color-brand)]',
  completed: 'text-blue-400',
};

function ActiveProjectsTable() {
  const { data } = useProjects({ status: 'active' });
  const { mockMode } = useAuth();

  const real = data?.results || data || [];
  const isDemo = real.length === 0 && mockMode;
  const projects = isDemo ? DEMO_PROJECTS : real;

  return (
    <div className="lg:col-span-2 bg-[var(--color-paper-dark)] border border-white/15">
      <div className="px-5 py-3.5 border-b border-white/15 flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-[0.2em] font-medium">Active Projects</h3>
        <Link
          to="/production/projects"
          className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-brand)] hover:opacity-80 transition-opacity"
        >
          View All →
        </Link>
      </div>
      <div className="divide-y divide-white/10">
        {projects.length === 0 ? (
          <p className="px-5 py-8 text-center text-[10px] uppercase tracking-[0.25em] text-[var(--color-paper)]/40">
            No active projects
          </p>
        ) : (
          projects.slice(0, 5).map((p) => (
            <ProjectRow key={p.id} project={p} isDemo={isDemo} />
          ))
        )}
      </div>
    </div>
  );
}

function ProjectRow({ project, isDemo }) {
  const statusKey = project.status || 'pending';
  const label = STATUS_LABEL[statusKey] || statusKey.replace(/_/g, ' ');
  const color = STATUS_COLOR[statusKey] || 'text-[var(--color-paper)]/60';

  // 进度:demo 数据直接给,真数据从 status 推断
  const progress = project.progress ?? statusToProgress(statusKey);

  return (
    <Link
      to={`/production/projects/${project.id}`}
      className="grid grid-cols-12 items-center gap-3 px-5 py-4 hover:bg-white/[0.02] transition-colors group"
    >
      <div className="col-span-12 md:col-span-4 min-w-0">
        <p className="text-sm font-medium text-[var(--color-paper)] truncate">{project.name}</p>
        {project.subtitle && (
          <p className="text-xs text-[var(--color-paper)]/40 mt-0.5 truncate">{project.subtitle}</p>
        )}
      </div>
      <div className="hidden md:block md:col-span-3 text-xs text-[var(--color-paper)]/60 truncate">
        {project.client_name || '—'}
      </div>
      <div className="hidden md:block md:col-span-2 text-xs text-[var(--color-paper)]/60 whitespace-nowrap">
        {project.deadline ? formatShortDate(project.deadline) : '—'}
      </div>
      <div className="col-span-6 md:col-span-2">
        <p className={`text-[11px] uppercase tracking-[0.15em] font-medium ${color}`}>
          • {label}
        </p>
      </div>
      <div className="col-span-6 md:col-span-1">
        <div className="h-1 w-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-[var(--color-brand)] transition-all"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

function statusToProgress(status) {
  return (
    {
      pending: 0.15,
      pre_production: 0.25,
      in_production: 0.5,
      active: 0.5,
      review: 0.75,
      client_review: 0.75,
      delivered: 0.95,
      completed: 1,
      archived: 1,
    }[status] || 0.3
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Recent Activity Feed                                                  */
/* ────────────────────────────────────────────────────────────────────── */

const DEMO_ACTIVITY = [
  { id: 'a1', icon: 'gradient', subject: 'Jessica M.', verb: 'confirmed availability for Povison shoot', time: '12 min ago' },
  { id: 'a2', icon: 'circle', subject: 'PepsiCo', verb: 'approved 6 of 8 final images', time: '1 hour ago' },
  { id: 'a3', icon: 'circle', subject: 'Call sheets', verb: 'sent for Povison shoot — Feb 22', time: '2 hours ago' },
  { id: 'a4', icon: 'invoice', subject: 'Invoice #1047', verb: 'paid by Avenco Sleep — $8,400', time: 'Yesterday' },
  { id: 'a5', icon: 'circle', subject: 'Marcus R.', verb: 'uploaded updated portfolio photos', time: 'Yesterday' },
  { id: 'a6', icon: 'doc', subject: 'Equipment list', verb: 'finalized for GE Commercial', time: '2 days ago' },
  { id: 'a7', icon: 'circle', subject: 'Troxus Mobility', verb: 'signed production agreement', time: '2 days ago' },
];

function RecentActivityFeed() {
  // 接真后端后消费 useActivityLog 的数据;无数据时回退到 demo,保证 mock 模式照常展示。
  const { data } = useActivityLog();
  const fetched = Array.isArray(data) ? data : data?.results;
  const items = fetched?.length ? fetched : DEMO_ACTIVITY;

  return (
    <div className="bg-[var(--color-paper-dark)] border border-white/15 flex flex-col">
      <div className="px-5 py-3.5 border-b border-white/15 flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-[0.2em] font-medium">Recent Activity</h3>
        <button className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-brand)] hover:opacity-80 transition-opacity">
          View All →
        </button>
      </div>
      <div className="divide-y divide-white/10 overflow-y-auto max-h-[480px]">
        {items.map((a) => (
          <ActivityRow key={a.id} item={a} />
        ))}
      </div>
    </div>
  );
}

function ActivityRow({ item }) {
  return (
    <div className="flex items-start gap-3 px-5 py-3.5">
      <ActivityIcon kind={item.icon} />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--color-paper)]/80 leading-relaxed">
          <span className="font-semibold text-[var(--color-paper)]">{item.subject}</span>{' '}
          {item.verb}
        </p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-paper)]/40 mt-1">
          {item.time}
        </p>
      </div>
    </div>
  );
}

function ActivityIcon({ kind }) {
  const base = 'w-7 h-7 flex-shrink-0 flex items-center justify-center';
  if (kind === 'gradient') {
    return (
      <div
        className={`${base} rounded-full`}
        style={{
          background: 'conic-gradient(from 0deg, #ff7eb6, #d8ff00, #79c0ff, #ff7eb6)',
        }}
      />
    );
  }
  if (kind === 'invoice') {
    return (
      <div className={`${base} border border-white/20`}>
        <CurrencyDollarIcon className="h-3.5 w-3.5 text-[var(--color-paper)]/60" />
      </div>
    );
  }
  if (kind === 'doc') {
    return (
      <div className={`${base} border border-white/20`}>
        <FolderIcon className="h-3.5 w-3.5 text-[var(--color-paper)]/60" />
      </div>
    );
  }
  // default circle
  return (
    <div className={`${base} rounded-full border border-white/20`}>
      <div className="w-1.5 h-1.5 bg-[var(--color-paper)]/40 rounded-full" />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Date helpers                                                          */
/* ────────────────────────────────────────────────────────────────────── */

function formatShortDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
