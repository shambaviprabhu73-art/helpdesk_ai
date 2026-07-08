import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, Ticket, MessageSquare, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { supabase, type Notification } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, EmptyState, Skeleton } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { DashboardPageHeader } from '../../components/layout/DashboardLayout';

const typeIcons: Record<string, typeof Ticket> = {
  ticket_update: Ticket,
  ticket_assigned: Ticket,
  ticket_resolved: CheckCircle2,
  ticket_closed: CheckCircle2,
  message_received: MessageSquare,
  system: Info,
};

const typeColors: Record<string, string> = {
  ticket_update: 'bg-primary-100 text-primary-600',
  ticket_assigned: 'bg-accent-100 text-accent-600',
  ticket_resolved: 'bg-success-100 text-success-600',
  ticket_closed: 'bg-slate-100 text-slate-600',
  message_received: 'bg-warning-100 text-warning-600',
  system: 'bg-primary-100 text-primary-600',
};

export function NotificationsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setNotifications((data as Notification[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    await load();
    toast('success', 'All notifications marked as read.');
  };

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const deleteNotif = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto">
      <DashboardPageHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}.`}
        action={
          unreadCount > 0 && (
            <Button variant="secondary" onClick={markAllRead}>
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </Button>
          )
        }
      />

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-7 h-7" />}
            title="No notifications"
            description="You are all caught up. New notifications about your tickets will appear here."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => {
              const Icon = typeIcons[notif.type] || Info;
              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors group ${!notif.is_read ? 'bg-primary-50/30' : ''}`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[notif.type]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-sm font-medium ${notif.is_read ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</p>
                      {!notif.is_read && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{notif.body}</p>
                    <p className="text-xs text-slate-400">{new Date(notif.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {notif.link && (
                      <Link to={notif.link} onClick={() => markRead(notif.id)} className="p-1.5 rounded text-slate-400 hover:text-primary-600 hover:bg-primary-50">
                        <AlertCircle className="w-4 h-4" />
                      </Link>
                    )}
                    <button onClick={() => deleteNotif(notif.id)} className="p-1.5 rounded text-slate-400 hover:text-error-600 hover:bg-error-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
