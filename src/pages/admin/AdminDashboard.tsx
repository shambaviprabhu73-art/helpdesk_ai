import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket as TicketIcon, Users, Clock, CheckCircle2, TrendingUp, AlertCircle,
  ArrowRight, Activity, BarChart3, UserCheck
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { supabase, type Ticket as TicketType, type Profile } from '../../lib/supabase';
import { Card, Badge, Button, Skeleton, EmptyState } from '../../components/ui';
import { DashboardPageHeader } from '../../components/layout/DashboardLayout';

const statusColors: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'gray'> = {
  open: 'yellow',
  in_progress: 'blue',
  resolved: 'green',
  closed: 'gray',
};

const statusLabels: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export function AdminDashboardPage() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [tRes, uRes] = await Promise.all([
      supabase.from('tickets').select('*, categories(*), profiles!tickets_user_id_fkey(*)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    ]);
    setTickets((tRes.data as TicketType[]) || []);
    setUsers((uRes.data as Profile[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
    users: users.length,
    activeUsers: users.filter((u) => u.is_active).length,
    staff: users.filter((u) => u.role === 'admin' || u.role === 'technician').length,
  };

  const statusData = [
    { name: 'Open', value: stats.open, color: '#f59e0b' },
    { name: 'In Progress', value: stats.inProgress, color: '#2563eb' },
    { name: 'Resolved', value: stats.resolved, color: '#22c55e' },
  ].filter((d) => d.value > 0);

  const categoryData = tickets.reduce((acc, t) => {
    const name = t.categories?.name || 'Uncategorized';
    const existing = acc.find((a) => a.name === name);
    if (existing) existing.value++;
    else acc.push({ name, value: 1 });
    return acc;
  }, [] as { name: string; value: number }[]);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const count = tickets.filter((t) => {
      const created = new Date(t.created_at);
      return created >= dayStart && created < dayEnd;
    }).length;
    return { name: dayStr, tickets: count };
  });

  const priorityData = [
    { name: 'Low', value: tickets.filter((t) => t.priority === 'low').length, color: '#94a3b8' },
    { name: 'Medium', value: tickets.filter((t) => t.priority === 'medium').length, color: '#2563eb' },
    { name: 'High', value: tickets.filter((t) => t.priority === 'high').length, color: '#f59e0b' },
    { name: 'Urgent', value: tickets.filter((t) => t.priority === 'urgent').length, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  const recentTickets = tickets.slice(0, 5);

  const statCards = [
    { label: 'Total Tickets', value: stats.total, icon: TicketIcon, color: 'from-primary-500 to-primary-600', bg: 'bg-primary-50', text: 'text-primary-600' },
    { label: 'Open', value: stats.open, icon: AlertCircle, color: 'from-warning-500 to-warning-600', bg: 'bg-warning-50', text: 'text-warning-600' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'from-accent-500 to-accent-600', bg: 'bg-accent-50', text: 'text-accent-600' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'from-success-500 to-success-600', bg: 'bg-success-50', text: 'text-success-600' },
    { label: 'Total Users', value: stats.users, icon: Users, color: 'from-primary-600 to-accent-600', bg: 'bg-primary-50', text: 'text-primary-600' },
    { label: 'Active Users', value: stats.activeUsers, icon: UserCheck, color: 'from-success-600 to-accent-600', bg: 'bg-success-50', text: 'text-success-600' },
  ];

  return (
    <div>
      <DashboardPageHeader
        title="Admin Overview"
        description="Real-time view of your IT support operations."
        action={
          <Link to="/admin/tickets">
            <Button>
              <TicketIcon className="w-4 h-4" />
              Manage Tickets
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="p-4">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4.5 h-4.5 ${stat.text}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {loading ? <Skeleton className="w-10 h-6" /> : stat.value}
              </div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Tickets — Last 7 Days</h3>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="tickets" stroke="#2563eb" strokeWidth={2.5} dot={{ fill: '#2563eb', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Ticket Status</h3>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : statusData.length === 0 ? (
            <EmptyState icon={<BarChart3 className="w-7 h-7" />} title="No data" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={3}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Tickets by Category</h3>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : categoryData.length === 0 ? (
            <EmptyState icon={<BarChart3 className="w-7 h-7" />} title="No data" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={12} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={100} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Priority Distribution</h3>
            <AlertCircle className="w-4 h-4 text-slate-400" />
          </div>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : priorityData.length === 0 ? (
            <EmptyState icon={<AlertCircle className="w-7 h-7" />} title="No data" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                  {priorityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Recent tickets */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Recent Tickets</h3>
          <Link to="/admin/tickets" className="text-sm text-primary-600 font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : recentTickets.length === 0 ? (
          <EmptyState icon={<TicketIcon className="w-7 h-7" />} title="No tickets yet" />
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/admin/tickets/${ticket.id}`}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                  <TicketIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate group-hover:text-primary-700">{ticket.subject}</p>
                  <p className="text-xs text-slate-500">
                    <span className="font-mono">{ticket.ticket_number}</span>
                    {ticket.profiles && <> • {ticket.profiles.full_name}</>}
                  </p>
                </div>
                <Badge color={statusColors[ticket.status]}>{statusLabels[ticket.status]}</Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
