import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Ticket as TicketIcon } from 'lucide-react';
import { supabase, type Ticket, type Profile } from '../../lib/supabase';
import { Card, Badge, Input, Select, EmptyState, Skeleton } from '../../components/ui';
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

const priorityColors: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'gray'> = {
  low: 'gray',
  medium: 'blue',
  high: 'yellow',
  urgent: 'red',
};

export function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [staff, setStaff] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const load = useCallback(async () => {
    const [tRes, sRes] = await Promise.all([
      supabase.from('tickets').select('*, categories(*), profiles!tickets_user_id_fkey(*), assigned_profile:profiles!tickets_assigned_to_fkey(*)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').in('role', ['admin', 'technician']).eq('is_active', true),
    ]);
    setTickets((tRes.data as Ticket[]) || []);
    setStaff((sRes.data as Profile[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tickets.filter((t) => {
    const matchesSearch = !search ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
      t.profiles?.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const assignTicket = async (ticketId: string, staffId: string) => {
    const { error } = await supabase
      .from('tickets')
      .update({ assigned_to: staffId || null, status: staffId ? 'in_progress' : 'open' })
      .eq('id', ticketId);
    if (error) return;
    if (staffId) {
      const ticket = tickets.find((t) => t.id === ticketId);
      if (ticket) {
        await supabase.from('notifications').insert({
          user_id: ticket.user_id,
          type: 'ticket_assigned',
          title: 'Ticket assigned',
          body: `Your ticket ${ticket.ticket_number} has been assigned to a technician.`,
          link: `/dashboard/tickets/${ticket.id}`,
        });
      }
    }
    setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, assigned_to: staffId || null, status: staffId ? 'in_progress' : 'open' } : t));
  };

  const updateStatus = async (ticketId: string, status: string) => {
    const updates: Record<string, unknown> = { status };
    if (status === 'resolved') updates.resolved_at = new Date().toISOString();
    if (status === 'closed') updates.closed_at = new Date().toISOString();
    const { error } = await supabase.from('tickets').update(updates).eq('id', ticketId);
    if (error) return;
    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket) {
      const type = status === 'resolved' ? 'ticket_resolved' : status === 'closed' ? 'ticket_closed' : 'ticket_update';
      await supabase.from('notifications').insert({
        user_id: ticket.user_id,
        type,
        title: `Ticket ${statusLabels[status]}`,
        body: `Your ticket ${ticket.ticket_number} is now ${statusLabels[status].toLowerCase()}.`,
        link: `/dashboard/tickets/${ticket.id}`,
      });
    }
    setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, ...updates } as Ticket : t));
  };

  return (
    <div>
      <DashboardPageHeader
        title="All Tickets"
        description="Manage and assign all support tickets across the platform."
      />

      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder="Search by subject, ID, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </Select>
          <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<TicketIcon className="w-7 h-7" />}
            title="No tickets found"
            description="Try adjusting your filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase px-4 py-3">Ticket</th>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase px-4 py-3 hidden md:table-cell">User</th>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase px-4 py-3 hidden lg:table-cell">Priority</th>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase px-4 py-3">Assignee</th>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/admin/tickets/${ticket.id}`} className="block">
                        <p className="font-medium text-slate-900 hover:text-primary-700 truncate max-w-xs">{ticket.subject}</p>
                        <p className="text-xs text-slate-500 font-mono">{ticket.ticket_number}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-slate-700">{ticket.profiles?.full_name || 'Unknown'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={statusColors[ticket.status]}>{statusLabels[ticket.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <Badge color={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={ticket.assigned_to || ''}
                        onChange={(e) => assignTicket(ticket.id, e.target.value)}
                        className="text-xs px-2 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {staff.map((s) => (
                          <option key={s.id} value={s.id}>{s.full_name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={ticket.status}
                        onChange={(e) => updateStatus(ticket.id, e.target.value)}
                        className="text-xs px-2 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
