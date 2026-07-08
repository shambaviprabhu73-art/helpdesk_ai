import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Ticket as TicketIcon, PlusCircle } from 'lucide-react';
import { supabase, type Ticket } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button, Input, Select, EmptyState, Skeleton } from '../../components/ui';
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

export function TrackTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('tickets')
        .select('*, categories(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setTickets((data as Ticket[]) || []);
      setLoading(false);
    })();
  }, [user]);

  const filtered = tickets.filter((t) => {
    const matchesSearch = !search ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.ticket_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <DashboardPageHeader
        title="My Tickets"
        description="Track the status of all your support tickets."
        action={
          <Link to="/dashboard/new-ticket">
            <Button><PlusCircle className="w-4 h-4" /> New Ticket</Button>
          </Link>
        }
      />

      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              icon={<Search className="w-4 h-4" />}
              placeholder="Search by subject or ticket ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<TicketIcon className="w-7 h-7" />}
            title={tickets.length === 0 ? 'No tickets yet' : 'No matching tickets'}
            description={tickets.length === 0 ? 'Submit a ticket to get IT support from our team.' : 'Try adjusting your search or filters.'}
            action={tickets.length === 0 ? <Link to="/dashboard/new-ticket"><Button>Submit a Ticket</Button></Link> : undefined}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/dashboard/tickets/${ticket.id}`}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                  <TicketIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-900 truncate group-hover:text-primary-700">{ticket.subject}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-mono">{ticket.ticket_number}</span>
                    <span>•</span>
                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    {ticket.categories && (
                      <>
                        <span>•</span>
                        <span>{ticket.categories.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <Badge color={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
                  <Badge color={statusColors[ticket.status]}>{statusLabels[ticket.status]}</Badge>
                </div>
                <div className="sm:hidden flex flex-col gap-1">
                  <Badge color={statusColors[ticket.status]}>{statusLabels[ticket.status]}</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
