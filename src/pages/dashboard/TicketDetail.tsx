import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Ticket as TicketIcon, Send, Paperclip, FileText, Download, Star,
  CheckCircle2, Clock, AlertCircle, User as UserIcon, Bot
} from 'lucide-react';
import { supabase, type Ticket, type TicketMessage, type Attachment } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button, Textarea, Avatar, EmptyState, Skeleton, Modal } from '../../components/ui';
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

export function TicketDetailPage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ratingModal, setRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const loadTicket = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from('tickets')
      .select('*, categories(*), assigned_profile:profiles!tickets_assigned_to_fkey(*)')
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

  const loadAttachments = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from('attachments')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at', { ascending: false });
    setAttachments((data as Attachment[]) || []);
  }, [id]);

  useEffect(() => {
    loadTicket();
    loadMessages();
    loadAttachments();
  }, [loadTicket, loadMessages, loadAttachments]);

  const handleReply = async () => {
    if (!reply.trim() || !id || !user) return;
    setSending(true);
    const { data } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: id,
        sender_id: user.id,
        sender_role: profile?.role || 'user',
        body: reply.trim(),
      })
      .select('*, profiles(*)')
      .single();
    if (data) {
      setMessages((prev) => [...prev, data as TicketMessage]);
      setReply('');
      toast('success', 'Reply sent!');
    }
    setSending(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !id || !user) return;
    setUploading(true);
    for (const file of Array.from(e.target.files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast('warning', 'File too large', `${file.name} exceeds 10MB.`);
        continue;
      }
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);
      if (uploadError) {
        toast('error', 'Upload failed', file.name);
        continue;
      }
      await supabase.from('attachments').insert({
        ticket_id: id,
        uploaded_by: user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
      });
    }
    await loadAttachments();
    setUploading(false);
    toast('success', 'Files uploaded.');
    e.target.value = '';
  };

  const handleDownload = async (attachment: Attachment) => {
    const { data } = await supabase.storage.from('attachments').createSignedUrl(attachment.file_path, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  const submitRating = async () => {
    if (!id || rating === 0) return;
    await supabase
      .from('tickets')
      .update({
        rating,
        rating_comment: ratingComment,
        status: 'closed',
        closed_at: new Date().toISOString(),
      })
      .eq('id', id);
    setRatingModal(false);
    toast('success', 'Thank you for your feedback!');
    loadTicket();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState
          icon={<TicketIcon className="w-7 h-7" />}
          title="Ticket not found"
          description="This ticket may have been deleted or you do not have access."
          action={<Button onClick={() => navigate('/dashboard/tickets')}>Back to Tickets</Button>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/dashboard/tickets" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary-600 mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Tickets
      </Link>

      {/* Ticket header */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-slate-500">{ticket.ticket_number}</span>
              <Badge color={statusColors[ticket.status]}>{statusLabels[ticket.status]}</Badge>
              <Badge color={priorityColors[ticket.priority]}>{ticket.priority} priority</Badge>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-1">{ticket.subject}</h1>
            {ticket.categories && (
              <p className="text-sm text-slate-500">Category: {ticket.categories.name}</p>
            )}
          </div>
          {ticket.status === 'resolved' && !ticket.rating && (
            <Button size="sm" onClick={() => setRatingModal(true)}>
              <Star className="w-4 h-4" />
              Rate Service
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Created</p>
            <p className="text-sm font-medium text-slate-900">{new Date(ticket.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Assigned To</p>
            <p className="text-sm font-medium text-slate-900">
              {ticket.assigned_profile ? ticket.assigned_profile.full_name : 'Unassigned'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Last Update</p>
            <p className="text-sm font-medium text-slate-900">{new Date(ticket.updated_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Status</p>
            <div className="flex items-center gap-1.5">
              {ticket.status === 'open' && <AlertCircle className="w-3.5 h-3.5 text-warning-500" />}
              {ticket.status === 'in_progress' && <Clock className="w-3.5 h-3.5 text-primary-500" />}
              {(ticket.status === 'resolved' || ticket.status === 'closed') && <CheckCircle2 className="w-3.5 h-3.5 text-success-500" />}
              <span className="text-sm font-medium text-slate-900">{statusLabels[ticket.status]}</span>
            </div>
          </div>
        </div>

        {ticket.rating && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Your Rating</p>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= ticket.rating! ? 'fill-warning-400 text-warning-400' : 'text-slate-300'}`} />
                ))}
              </div>
              {ticket.rating_comment && <span className="text-sm text-slate-600">"{ticket.rating_comment}"</span>}
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col h-[500px]">
            <div className="px-5 py-3 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 text-sm">Conversation</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Initial ticket description as first message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-900">You</span>
                    <span className="text-xs text-slate-500">{new Date(ticket.created_at).toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-50 rounded-2xl rounded-tl-sm p-3 text-sm text-slate-700 whitespace-pre-wrap">
                    {ticket.description}
                  </div>
                </div>
              </div>

              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender_id === user?.id ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                    {msg.sender_role === 'system' ? (
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-slate-500" />
                      </div>
                    ) : msg.sender_id === user?.id ? (
                      <Avatar name={profile?.full_name || 'You'} size="sm" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className={`flex-1 ${msg.sender_id === user?.id ? 'text-right' : ''}`}>
                    <div className={`flex items-center gap-2 mb-1 ${msg.sender_id === user?.id ? 'justify-end' : ''}`}>
                      <span className="text-xs text-slate-500">{new Date(msg.created_at).toLocaleString()}</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {msg.sender_role === 'system' ? 'System' : msg.sender_id === user?.id ? 'You' : msg.profiles?.full_name || 'Support'}
                      </span>
                    </div>
                    <div className={`inline-block max-w-[85%] p-3 rounded-2xl text-sm text-left whitespace-pre-wrap ${
                      msg.sender_id === user?.id
                        ? 'bg-primary-600 text-white rounded-tr-sm'
                        : msg.sender_role === 'system'
                        ? 'bg-slate-100 text-slate-600 rounded-tl-sm'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                    }`}>
                      {msg.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply box */}
            {ticket.status !== 'closed' && (
              <div className="p-4 border-t border-slate-200">
                <Textarea
                  rows={2}
                  placeholder="Type your reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="mb-2"
                />
                <div className="flex justify-end">
                  <Button onClick={handleReply} loading={sending} disabled={!reply.trim()}>
                    <Send className="w-4 h-4" />
                    Send Reply
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Attachments */}
        <div>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 text-sm">Attachments</h3>
              <label className="cursor-pointer">
                <input type="file" multiple className="hidden" onChange={handleUpload} accept="image/*,.pdf,.doc,.docx,.txt,.log,.zip" />
                <span className="text-primary-600 hover:text-primary-700">
                  <Paperclip className="w-4 h-4 inline" />
                </span>
              </label>
            </div>

            {uploading && <p className="text-xs text-slate-500 mb-2">Uploading...</p>}

            {attachments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No attachments yet.</p>
            ) : (
              <div className="space-y-2">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <FileText className="w-4 h-4 text-primary-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{att.file_name}</p>
                      <p className="text-xs text-slate-500">{(att.file_size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={() => handleDownload(att)} className="p-1 rounded text-slate-400 hover:text-primary-600">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Rating Modal */}
      <Modal open={ratingModal} onClose={() => setRatingModal(false)} title="Rate Your Support Experience">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 text-center">How satisfied were you with the support you received?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(s)}
              >
                <Star className={`w-10 h-10 transition-colors ${
                  s <= (hoverRating || rating) ? 'fill-warning-400 text-warning-400' : 'text-slate-300'
                }`} />
              </button>
            ))}
          </div>
          <Textarea
            label="Comments (optional)"
            placeholder="Tell us about your experience..."
            rows={3}
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setRatingModal(false)}>Cancel</Button>
            <Button onClick={submitRating} disabled={rating === 0}>
              <Star className="w-4 h-4" />
              Submit Rating
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
