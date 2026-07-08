import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Ticket as TicketIcon, Send, User as UserIcon, Bot,
  CheckCircle2, Lock
} from 'lucide-react';
import { supabase, type Ticket, type TicketMessage, type Profile } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button, Textarea, Avatar, Select, EmptyState, Skeleton } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';

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

const priorityColors: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'gray'> = {
  low: 'gray',
  medium: 'blue',
  high: 'yellow',
  urgent: 'red',
};

export function AdminTicketDetailPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [staff, setStaff] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);

  const loadTicket = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from('tickets')
      .select('*, categories(*), profiles!tickets_user_id_fkey(*), assigned_profile:profiles!tickets_assigned_to_fkey(*)')
      .eq('id', id)
      .maybeSingle();
    setTicket(data as Ticket | null);
    setLoading(false);
  }, [id]);

  const loadMessages = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from('ticket_messages')
      .select('*, profiles(*)')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });
    setMessages((data as TicketMessage[]) || []);
  }, [id]);

  const loadStaff = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'technician'])
      .eq('is_active', true);
    setStaff((data as Profile[]) || []);
  }, []);

  useEffect(() => {
    loadTicket();
    loadMessages();
    loadStaff();
  }, [loadTicket, loadMessages, loadStaff]);

  const handleReply = async () => {
    if (!reply.trim() || !id || !profile) return;
    setSending(true);
    const { data } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: id,
        sender_id: profile.id,
        sender_role: profile.role,
        body: reply.trim(),
        is_internal: isInternal,
      })
      .select('*, profiles(*)')
      .single();
    if (data) {
      setMessages((prev) => [...prev, data as TicketMessage]);
      if (!isInternal && ticket) {
        await supabase.from('notifications').insert({
          user_id: ticket.user_id,
          type: 'message_received',
          title: 'New message on your ticket',
          body: `A support agent replied to your ticket ${ticket.ticket_number}.`,
          link: `/dashboard/tickets/${ticket.id}`,
        });
      }
      setReply('');
      toast('success', isInternal ? 'Internal note added' : 'Reply sent!');
    }
    setSending(false);
  };

  const updateTicket = async (updates: Record<string, unknown>, notifyType?: string, notifyBody?: string) => {
    if (!id || !ticket) return;
    const { error } = await supabase.from('tickets').update(updates).eq('id', id);
    if (error) { toast('error', 'Update failed'); return; }
    if (notifyType && ticket) {
      await supabase.from('notifications').insert({
        user_id: ticket.user_id,
        type: notifyType,
        title: `Ticket ${statusLabels[updates.status as string] || 'updated'}`,
        body: notifyBody || `Your ticket ${ticket.ticket_number} has been updated.`,
        link: `/dashboard/tickets/${ticket.id}`,
      });
    }
    toast('success', 'Ticket updated.');
    loadTicket();
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-5xl mx-auto">
        <EmptyState
          icon={<TicketIcon className="w-7 h-7" />}
          title="Ticket not found"
          action={<Button onClick={() => navigate('/admin/tickets')}>Back to Tickets</Button>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link to="/admin/tickets" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary-600 mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to All Tickets
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket header */}
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-mono text-slate-500">{ticket.ticket_number}</span>
                  <Badge color={statusColors[ticket.status]}>{statusLabels[ticket.status]}</Badge>
                  <Badge color={priorityColors[ticket.priority]}>{ticket.priority} priority</Badge>
                </div>
                <h1 className="text-xl font-bold text-slate-900 mb-1">{ticket.subject}</h1>
                {ticket.categories && <p className="text-sm text-slate-500">{ticket.categories.name}</p>}
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Description</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>
            {ticket.ai_summary && (
              <div className="mt-4 p-3 rounded-lg bg-accent-50 border border-accent-100">
                <p className="text-xs font-semibold text-accent-700 mb-1 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" /> AI Summary
                </p>
                <p className="text-xs text-accent-800 whitespace-pre-wrap line-clamp-4">{ticket.ai_summary}</p>
              </div>
            )}
          </Card>

          {/* Conversation */}
          <Card className="flex flex-col h-[400px]">
            <div className="px-5 py-3 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 text-sm">Conversation</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <p className="text-center text-sm text-slate-500 py-8">No messages yet. Start the conversation below.</p>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.is_internal ? 'bg-warning-50/50 p-3 rounded-lg -mx-3' : ''}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                    {msg.sender_role === 'system' ? (
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-slate-500" />
                      </div>
                    ) : msg.sender_id === ticket.user_id ? (
                      <Avatar name={ticket.profiles?.full_name || 'User'} size="sm" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900">
                        {msg.sender_role === 'system' ? 'System' : msg.sender_id === ticket.user_id ? ticket.profiles?.full_name : msg.profiles?.full_name || 'Staff'}
                      </span>
                      {msg.is_internal && <Badge color="yellow"><Lock className="w-3 h-3" /> Internal</Badge>}
                      <span className="text-xs text-slate-500">{new Date(msg.created_at).toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap">{msg.body}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-200">
              <Textarea
                rows={2}
                placeholder={isInternal ? "Internal note (visible to staff only)..." : "Reply to user..."}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="mb-2"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  Internal note
                </label>
                <Button onClick={handleReply} loading={sending} disabled={!reply.trim()}>
                  <Send className="w-4 h-4" />
                  {isInternal ? 'Add Note' : 'Send Reply'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-semibold text-slate-900 text-sm mb-4">Ticket Controls</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Status</label>
                <Select
                  value={ticket.status}
                  onChange={(e) => {
                    const status = e.target.value;
                    const updates: Record<string, unknown> = { status };
                    if (status === 'resolved') updates.resolved_at = new Date().toISOString();
                    if (status === 'closed') updates.closed_at = new Date().toISOString();
                    updateTicket(updates, status === 'resolved' ? 'ticket_resolved' : status === 'closed' ? 'ticket_closed' : 'ticket_update', `Your ticket ${ticket.ticket_number} is now ${statusLabels[status].toLowerCase()}.`);
                  }}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Priority</label>
                <Select
                  value={ticket.priority}
                  onChange={(e) => updateTicket({ priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Assign To</label>
                <Select
                  value={ticket.assigned_to || ''}
                  onChange={(e) => {
                    updateTicket({ assigned_to: e.target.value || null, status: e.target.value ? 'in_progress' : ticket.status });
                    if (e.target.value) {
                      supabase.from('notifications').insert({
                        user_id: ticket.user_id,
                        type: 'ticket_assigned',
                        title: 'Ticket assigned',
                        body: `Your ticket ${ticket.ticket_number} has been assigned to a technician.`,
                        link: `/dashboard/tickets/${ticket.id}`,
                      });
                    }
                  }}
                >
                  <option value="">Unassigned</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>{s.full_name} ({s.role})</option>
                  ))}
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">User Info</h3>
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={ticket.profiles?.full_name || 'User'} src={ticket.profiles?.avatar_url} size="md" />
              <div className="min-w-0">
                <p className="font-medium text-slate-900 truncate">{ticket.profiles?.full_name}</p>
                <p className="text-xs text-slate-500 capitalize">{ticket.profiles?.role}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Department</span>
                <span className="text-slate-900">{ticket.profiles?.department || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Created</span>
                <span className="text-slate-900">{new Date(ticket.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned</span>
                <span className="text-slate-900">{ticket.assigned_profile?.full_name || 'Unassigned'}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">Timeline</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5" />
                <div>
                  <p className="text-slate-900">Ticket created</p>
                  <p className="text-xs text-slate-500">{new Date(ticket.created_at).toLocaleString()}</p>
                </div>
              </div>
              {ticket.resolved_at && (
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success-500 mt-0.5" />
                  <div>
                    <p className="text-slate-900">Marked resolved</p>
                    <p className="text-xs text-slate-500">{new Date(ticket.resolved_at).toLocaleString()}</p>
                  </div>
                </div>
              )}
              {ticket.closed_at && (
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400 mt-1.5" />
                  <div>
                    <p className="text-slate-900">Ticket closed</p>
                    <p className="text-xs text-slate-500">{new Date(ticket.closed_at).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
