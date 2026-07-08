import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketCheck, Upload, X, FileText, Lightbulb } from 'lucide-react';
import { supabase, type Category } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Input, Textarea, Select, Button, Card, Alert } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { DashboardPageHeader } from '../../components/layout/DashboardLayout';

export function SubmitTicketPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    subject: '',
    description: '',
    category_id: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories((data as Category[]) || []);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter((f) => f.size < 10 * 1024 * 1024);
    if (valid.length !== selected.length) {
      toast('warning', 'Some files skipped', 'Files must be under 10MB.');
    }
    setFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);

    if (form.subject.trim().length < 5) {
      setError('Subject must be at least 5 characters.');
      return;
    }
    if (form.description.trim().length < 10) {
      setError('Please provide a more detailed description (at least 10 characters).');
      return;
    }

    setLoading(true);

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        user_id: user.id,
        subject: form.subject.trim(),
        description: form.description.trim(),
        category_id: form.category_id || null,
        priority: form.priority,
      })
      .select()
      .single();

    if (ticketError || !ticket) {
      setError('Could not create ticket. Please try again.');
      setLoading(false);
      return;
    }

    for (const file of files) {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/${ticket.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (uploadError) {
        toast('warning', 'Attachment failed', `Could not upload ${file.name}`);
        continue;
      }

      await supabase.from('attachments').insert({
        ticket_id: ticket.id,
        uploaded_by: user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
      });
    }

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'system',
      title: 'Ticket submitted',
      body: `Your ticket ${ticket.ticket_number} has been received. We will respond shortly.`,
      link: `/dashboard/tickets/${ticket.id}`,
    });

    toast('success', 'Ticket created!', `Your ticket ${ticket.ticket_number} has been submitted.`);
    setLoading(false);
    navigate(`/dashboard/tickets/${ticket.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <DashboardPageHeader
        title="Submit a Ticket"
        description="Cannot find an answer with the AI assistant? Submit a ticket and a technician will help."
      />

      <Card className="p-6">
        {error && <Alert variant="error" className="mb-4">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Subject"
            required
            placeholder="Brief summary of your issue"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Select>

            <Select
              label="Priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
            >
              <option value="low">Low — Not urgent</option>
              <option value="medium">Medium — Normal priority</option>
              <option value="high">High — Affects work</option>
              <option value="urgent">Urgent — Critical issue</option>
            </Select>
          </div>

          <Textarea
            label="Description"
            required
            rows={6}
            placeholder="Describe your issue in detail. Include any error messages, what you were doing when it happened, and what you have already tried."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div>
            <label className="label">Attachments (optional)</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept="image/*,.pdf,.doc,.docx,.txt,.log,.zip"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 font-medium">Click to upload files</p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG, PDF, DOC, TXT, LOG, ZIP up to 10MB</p>
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-primary-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="p-1 rounded text-slate-400 hover:text-error-600 hover:bg-error-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg bg-primary-50 border border-primary-100 flex gap-2.5">
            <Lightbulb className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-primary-800">
              <p className="font-medium mb-1">Tip: Try the AI assistant first</p>
              <p className="text-primary-700">Many common IT issues can be resolved instantly by our AI assistant. <a href="/dashboard/chat" className="font-semibold underline">Try it here</a> before submitting a ticket.</p>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => navigate('/dashboard/tickets')}>Cancel</Button>
            <Button type="submit" loading={loading}>
              <TicketCheck className="w-4 h-4" />
              Submit Ticket
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
