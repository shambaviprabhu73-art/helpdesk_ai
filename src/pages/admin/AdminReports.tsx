import { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, RadialBarChart, RadialBar
} from 'recharts';
import { TrendingUp, Clock, CheckCircle2, AlertCircle, Download, BarChart3 } from 'lucide-react';
import { supabase, type Ticket } from '../../lib/supabase';
import { Card, Button, Skeleton, EmptyState, Badge } from '../../components/ui';
import { DashboardPageHeader } from '../../components/layout/DashboardLayout';

const CHART_COLORS = ['#2563eb', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export function AdminReportsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from('tickets').select('*, categories(*)');
    setTickets((data as Ticket[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Resolution time (mock based on created_at to resolved_at)
  const resolvedTickets = tickets.filter((t) => t.resolved_at);
  const avgResolutionHours = resolvedTickets.length > 0
    ? resolvedTickets.reduce((sum, t) => {
        const created = new Date(t.created_at).getTime();
        const resolved = new Date(t.resolved_at!).getTime();
        return sum + (resolved - created) / (1000 * 60 * 60);
      }, 0) / resolvedTickets.length
    : 0;

  // Last 30 days trend
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const created = tickets.filter((t) => {
      const c = new Date(t.created_at);
      return c >= dayStart && c < dayEnd;
    }).length;
    const resolved = tickets.filter((t) => {
      if (!t.resolved_at) return false;
      const r = new Date(t.resolved_at);
      return r >= dayStart && r < dayEnd;
    }).length;
    return {
      name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      created,
      resolved,
    };
  });

  // Category breakdown
  const categoryData = tickets.reduce((acc, t) => {
    const name = t.categories?.name || 'Uncategorized';
    const existing = acc.find((a) => a.name === name);
    if (existing) existing.value++;
    else acc.push({ name, value: 1 });
    return acc;
  }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value);

  // Priority distribution
  const priorityData = [
    { name: 'Low', value: tickets.filter((t) => t.priority === 'low').length, fill: '#94a3b8' },
    { name: 'Medium', value: tickets.filter((t) => t.priority === 'medium').length, fill: '#2563eb' },
    { name: 'High', value: tickets.filter((t) => t.priority === 'high').length, fill: '#f59e0b' },
    { name: 'Urgent', value: tickets.filter((t) => t.priority === 'urgent').length, fill: '#ef4444' },
  ];

  // Status distribution
  const statusData = [
    { name: 'Open', value: tickets.filter((t) => t.status === 'open').length, fill: '#f59e0b' },
    { name: 'In Progress', value: tickets.filter((t) => t.status === 'in_progress').length, fill: '#2563eb' },
    { name: 'Resolved', value: tickets.filter((t) => t.status === 'resolved').length, fill: '#22c55e' },
    { name: 'Closed', value: tickets.filter((t) => t.status === 'closed').length, fill: '#94a3b8' },
  ];

  // Resolution rate
  const resolutionRate = tickets.length > 0
    ? Math.round((resolvedTickets.length / tickets.length) * 100)
    : 0;

  // Average rating
  const ratedTickets = tickets.filter((t) => t.rating);
  const avgRating = ratedTickets.length > 0
    ? (ratedTickets.reduce((sum, t) => sum + (t.rating || 0), 0) / ratedTickets.length).toFixed(1)
    : '—';

  const kpis = [
    { label: 'Total Tickets', value: tickets.length, icon: BarChart3, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Avg Resolution', value: `${avgResolutionHours.toFixed(1)}h`, icon: Clock, color: 'text-accent-600', bg: 'bg-accent-50' },
    { label: 'Resolution Rate', value: `${resolutionRate}%`, icon: CheckCircle2, color: 'text-success-600', bg: 'bg-success-50' },
    { label: 'Avg Rating', value: avgRating, icon: TrendingUp, color: 'text-warning-600', bg: 'bg-warning-50' },
  ];

  const handleExport = () => {
    const csv = [
      ['Ticket #', 'Subject', 'Status', 'Priority', 'Category', 'Created', 'Resolved', 'Rating'].join(','),
      ...tickets.map((t) => [
        t.ticket_number,
        `"${t.subject.replace(/"/g, '""')}"`,
        t.status,
        t.priority,
        t.categories?.name || '',
        new Date(t.created_at).toISOString(),
        t.resolved_at ? new Date(t.resolved_at).toISOString() : '',
        t.rating || '',
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `helpdesk-tickets-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <DashboardPageHeader
        title="Reports & Analytics"
        description="Insights into ticket volume, resolution times, and common issues."
        action={
          <Button variant="secondary" onClick={handleExport} disabled={tickets.length === 0}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i} className="p-5">
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {loading ? <Skeleton className="w-16 h-7" /> : kpi.value}
              </div>
              <div className="text-sm text-slate-500">{kpi.label}</div>
            </Card>
          );
        })}
      </div>

      {/* 30-day trend */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">30-Day Ticket Trend</h3>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary-500" /> Created</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success-500" /> Resolved</span>
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={last30Days}>
              <defs>
                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={4} />
              <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="created" stroke="#2563eb" strokeWidth={2} fill="url(#colorCreated)" />
              <Area type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} fill="url(#colorResolved)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category breakdown */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Tickets by Category</h3>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : categoryData.length === 0 ? (
            <EmptyState icon={<BarChart3 className="w-7 h-7" />} title="No data" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={12} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={120} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Priority distribution */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Priority Distribution</h3>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : priorityData.every((d) => d.value === 0) ? (
            <EmptyState icon={<AlertCircle className="w-7 h-7" />} title="No data" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart data={priorityData} innerRadius="20%" outerRadius="90%" startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={6}>
                  {priorityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </RadialBar>
                <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </RadialBarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Status distribution */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Status Distribution</h3>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : statusData.every((d) => d.value === 0) ? (
            <EmptyState icon={<BarChart3 className="w-7 h-7" />} title="No data" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} paddingAngle={3}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Top categories list */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Top Issue Categories</h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : categoryData.length === 0 ? (
            <EmptyState icon={<BarChart3 className="w-7 h-7" />} title="No data" />
          ) : (
            <div className="space-y-3">
              {categoryData.slice(0, 6).map((cat, i) => {
                const max = categoryData[0].value;
                const pct = (cat.value / max) * 100;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                      <Badge color="blue">{cat.value}</Badge>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
