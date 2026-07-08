import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare, PlusCircle, ListChecks, Clock, CheckCircle2,
  AlertCircle, ArrowRight, Bot, Ticket as TicketIcon, Bell, Activity
} from 'lucide-react';
import { supabase, type Ticket, type Notification } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button, EmptyState, Skeleton } from '../../components/ui';
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

export function DashboardPage() {
  const { user, profile } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [ticketsRes, notifRes] = await Promise.all([
        supabase
          .from('tickets')
          .select('*, categories(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);
      setTickets(ticketsRes.data as Ticket[] || []);
      setNotifications(notifRes.data as Notification[] || []);
      setLoading(false);
    })();
  }, [user]);

  const stats = [
    {
      label: 'Open Tickets',
      value: tickets.filter((t) => t.status === 'open').length,
      icon: AlertCircle,
      color: 'from-warning-500 to-warning-600',
      bg: 'bg-warning-50',
      text: 'text-warning-600',
    },
    {
      label: 'In Progress',
      value: tickets.filter((t) => t.status === 'in_progress').length,
      icon: Clock,
      color: 'from-primary-500 to-primary-600',
      bg: 'bg-primary-50',
      text: 'text-primary-600',
    },
    {
      label: 'Resolved',
      value: tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
      icon: CheckCircle2,
      color: 'from-success-500 to-success-600',
      bg: 'bg-success-50',
      text: 'text-success-600',
    },
    {
      label: 'Total Tickets',
      value: tickets.length,
      icon: TicketIcon,
      color: 'from-accent-500 to-accent-600',
      bg: 'bg-accent-50',
      text: 'text-accent-600',
    },
  ];

  const quickActions = [
    { to: '/dashboard/chat', label: 'Ask AI Assistant', description: 'Get instant IT help', icon: Bot, color: 'from-primary-500 to-primary-600' },
    { to: '/dashboard/new-ticket', label: 'Submit Ticket', description: 'Create a support ticket', icon: PlusCircle, color: 'from-accent-500 to-accent-600' },
    { to: '/dashboard/tickets', label: 'Track Tickets', description: 'View all your tickets', icon: ListChecks, color: 'from-success-500 to-success-600' },
    { to: '/dashboard/notifications', label: 'Notifications', description: 'Check for updates', icon: Bell, color: 'from-warning-500 to-warning-600' },
  ];

  return (
    <div>
      <DashboardPageHeader
        title={`Welcome back, ${profile?.full_name?.split(' ')[0] || 'User'}`}
        description="Here is an overview of your IT support activity."
        action={
          <Link to="/dashboard/chat">
            <Button>
              <MessageSquare className="w-4 h-4" />
              New Chat
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.text}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {loading ? <Skeleton className="w-12 h-7" /> : stat.value}
              </div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, i) => {
          const Icon = action.icon;
          return (
            <Link key={i} to={action.to} className="group">
              <Card hover className="p-5 h-full">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} text-white mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-0.5">{action.label}</h3>
                <p className="text-xs text-slate-500">{action.description}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Recent Tickets</h2>
              <Link to="/dashboard/tickets" className="text-sm text-primary-600 font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : tickets.length === 0 ? (
              <EmptyState
                icon={<TicketIcon className="w-7 h-7" />}
                title="No tickets yet"
                description="Start a chat with the AI assistant or submit a ticket to get IT support."
                action={<Link to="/dashboard/new-ticket"><Button>Submit a Ticket</Button></Link>}
              />
            ) : (
              <div className="space-y-2">
                {tickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    to={`/dashboard/tickets/${ticket.id}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                        <TicketIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 truncate group-hover:text-primary-700">{ticket.subject}</p>
                        <p className="text-xs text-slate-500 font-mono">{ticket.ticket_number}</p>
                      </div>
                    </div>
                    <Badge color={statusColors[ticket.status]}>{statusLabels[ticket.status]}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Notifications */}
        <div>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Notifications</h2>
              <Link to="/dashboard/notifications" className="text-sm text-primary-600 font-medium hover:underline">
                View all
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : notifications.length === 0 ? (
              <EmptyState
                icon={<Bell className="w-7 h-7" />}
                title="All caught up"
                description="No new notifications."
              />
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg border ${notif.is_read ? 'border-slate-100 bg-white' : 'border-primary-100 bg-primary-50/50'}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
