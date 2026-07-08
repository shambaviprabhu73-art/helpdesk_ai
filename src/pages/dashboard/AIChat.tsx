import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, Send, Sparkles, TicketCheck, Plus, MessageSquare,
  Trash2, ArrowUpRight, Lightbulb, Zap
} from 'lucide-react';
import { supabase, type ChatSession, type ChatMessage, type KnowledgeArticle } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { generateAIResponse, QUICK_PROMPTS } from '../../lib/aiEngine';
import { Button, Card, Modal, Input, Textarea, Select, Spinner } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { DashboardPageHeader } from '../../components/layout/DashboardLayout';

export function AIChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeArticle[]>([]);
  const [escalateModal, setEscalateModal] = useState(false);
  const [escalateForm, setEscalateForm] = useState<{ subject: string; description: string; priority: 'low' | 'medium' | 'high' | 'urgent' }>({ subject: '', description: '', priority: 'medium' });
  const [escalating, setEscalating] = useState(false);
  const [canEscalate, setCanEscalate] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadSessions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    setSessions((data as ChatSession[]) || []);
    setLoading(false);
  }, [user]);

  const loadMessages = useCallback(async (sessionId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    setMessages((data as ChatMessage[]) || []);
  }, []);

  const loadKnowledgeBase = useCallback(async () => {
    const { data } = await supabase
      .from('knowledge_base')
      .select('*, categories(*)');
    setKnowledgeBase((data as KnowledgeArticle[]) || []);
  }, []);

  useEffect(() => {
    loadSessions();
    loadKnowledgeBase();
  }, [loadSessions, loadKnowledgeBase]);

  useEffect(() => {
    if (activeSession) loadMessages(activeSession.id);
    else setMessages([]);
  }, [activeSession, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createNewSession = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, title: 'New Chat' })
      .select()
      .single();
    if (error) {
      toast('error', 'Could not start a new chat.');
      return;
    }
    const newSession = data as ChatSession;
    setSessions((prev) => [newSession, ...prev]);
    setActiveSession(newSession);
    setMessages([]);
    setCanEscalate(false);
  };

  const deleteSession = async (sessionId: string) => {
    const { error } = await supabase.from('chat_sessions').delete().eq('id', sessionId);
    if (error) {
      toast('error', 'Could not delete chat.');
      return;
    }
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSession?.id === sessionId) {
      setActiveSession(null);
      setMessages([]);
    }
    toast('success', 'Chat deleted.');
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !activeSession || !user) return;

    setSending(true);
    setInput('');

    const { data: userMsg } = await supabase
      .from('chat_messages')
      .insert({
        session_id: activeSession.id,
        role: 'user',
        content: content.trim(),
      })
      .select()
      .single();

    if (userMsg) {
      setMessages((prev) => [...prev, userMsg as ChatMessage]);
    }

    if (activeSession.title === 'New Chat') {
      const title = content.trim().slice(0, 40) + (content.length > 40 ? '...' : '');
      const { data: updated } = await supabase
        .from('chat_sessions')
        .update({ title })
        .eq('id', activeSession.id)
        .select()
        .single();
      if (updated) {
        setActiveSession(updated as ChatSession);
        setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated as ChatSession : s)));
      }
    }

    await new Promise((r) => setTimeout(r, 600));

    const aiResponse = generateAIResponse(content, knowledgeBase, messages.length);

    const { data: aiMsg } = await supabase
      .from('chat_messages')
      .insert({
        session_id: activeSession.id,
        role: 'assistant',
        content: aiResponse.content,
        suggested_category: aiResponse.suggestedCategory,
        can_escalate: aiResponse.canEscalate,
      })
      .select()
      .single();

    if (aiMsg) {
      setMessages((prev) => [...prev, aiMsg as ChatMessage]);
    }

    setCanEscalate(aiResponse.canEscalate);
    setSending(false);
  };

  const handleEscalate = async () => {
    if (!activeSession || !user) return;
    setEscalating(true);

    const chatSummary = messages
      .map((m) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
      .join('\n\n')
      .slice(0, 2000);

    const subject = escalateForm.subject || activeSession.title;
    const description = escalateForm.description
      ? `${escalateForm.description}\n\n--- Chat History ---\n${chatSummary}`
      : `Escalated from AI chat session.\n\n--- Chat History ---\n${chatSummary}`;

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert({
        user_id: user.id,
        subject,
        description,
        priority: escalateForm.priority,
        ai_summary: chatSummary,
      })
      .select()
      .single();

    if (error) {
      toast('error', 'Could not create ticket.');
      setEscalating(false);
      return;
    }

    await supabase
      .from('chat_sessions')
      .update({ status: 'escalated', escalated_ticket_id: ticket.id })
      .eq('id', activeSession.id);

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'system',
      title: 'Ticket created from chat',
      body: `Your chat has been escalated to ticket ${ticket.ticket_number}. A technician will respond soon.`,
      link: `/dashboard/tickets/${ticket.id}`,
    });

    setEscalateModal(false);
    setEscalateForm({ subject: '', description: '', priority: 'medium' });
    setEscalating(false);
    toast('success', 'Ticket created!', `Ticket ${ticket.ticket_number} has been submitted.`);
    navigate(`/dashboard/tickets/${ticket.id}`);
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold text-slate-900 mt-2 mb-1">{line.slice(2, -2)}</p>;
      }
      if (line.match(/^\d+\.\s/)) {
        return <p key={i} className="ml-4 mb-1">{line}</p>;
      }
      if (line.trim() === '') return <div key={i} className="h-2" />;
      return <p key={i} className="mb-1">{line}</p>;
    });
  };

  return (
    <div>
      <DashboardPageHeader
        title="AI Assistant"
        description="Chat with our AI to troubleshoot IT issues instantly. Escalate to a human if needed."
        action={
          <Button onClick={createNewSession}>
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-13rem)]">
        {/* Sessions sidebar */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 text-sm">Chat History</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <div className="p-4"><Spinner /></div>
              ) : sessions.length === 0 ? (
                <p className="text-xs text-slate-500 text-center p-4">No chats yet. Click "New Chat" to start.</p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors ${
                      activeSession?.id === session.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => setActiveSession(session)}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{session.title}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(session.created_at).toLocaleDateString()}
                        {session.status === 'escalated' && <span className="ml-1 text-warning-600">• Escalated</span>}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-error-600 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col overflow-hidden">
            {!activeSession ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white mb-4 shadow-lg animate-float">
                    <Bot className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">AI IT Support Assistant</h2>
                  <p className="text-sm text-slate-600 mb-6">
                    I can help you troubleshoot Wi-Fi, printers, software, email, passwords, and more. Start a new chat to begin.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {QUICK_PROMPTS.slice(0, 4).map((prompt, i) => (
                      <button
                        key={i}
                        onClick={async () => {
                          await createNewSession();
                          setTimeout(() => sendMessage(prompt.message), 100);
                        }}
                        className="text-left p-3 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-sm"
                      >
                        <div className="flex items-center gap-2 text-primary-600 mb-1">
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">Quick start</span>
                        </div>
                        <span className="text-slate-700">{prompt.label}</span>
                      </button>
                    ))}
                  </div>
                  <Button onClick={createNewSession}>
                    <Sparkles className="w-4 h-4" />
                    Start New Chat
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{activeSession.title}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                        AI Online
                      </p>
                    </div>
                  </div>
                  {canEscalate && (
                    <Button size="sm" onClick={() => setEscalateModal(true)}>
                      <TicketCheck className="w-4 h-4" />
                      Escalate to Ticket
                    </Button>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-600 mb-3">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <p className="text-sm text-slate-600 mb-4">Hi! Describe your IT issue and I will help you troubleshoot.</p>
                      <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                        {QUICK_PROMPTS.slice(0, 4).map((prompt, i) => (
                          <button
                            key={i}
                            onClick={() => sendMessage(prompt.message)}
                            className="text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-xs"
                          >
                            {prompt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                          msg.role === 'user'
                            ? 'bg-primary-600 text-white rounded-tr-sm'
                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                        }`}
                      >
                        <div className={msg.role === 'user' ? 'text-white' : 'text-slate-700'}>
                          {formatMessage(msg.content)}
                        </div>
                        {msg.role === 'assistant' && msg.can_escalate && (
                          <button
                            onClick={() => setEscalateModal(true)}
                            className="mt-2 flex items-center gap-1.5 text-xs text-primary-600 font-medium hover:underline"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            Escalate to a human
                          </button>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-slate-600">
                          You
                        </div>
                      )}
                    </div>
                  ))}

                  {sending && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce-soft" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce-soft" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce-soft" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200">
                  <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Describe your IT issue..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={sending}
                    />
                    <Button type="submit" loading={sending} disabled={!input.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Escalation Modal */}
      <Modal open={escalateModal} onClose={() => setEscalateModal(false)} title="Escalate to Support Ticket" size="md">
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-primary-50 border border-primary-100 flex gap-2.5">
            <Zap className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-primary-800">
              Your chat history will be attached to the ticket so the technician has full context.
            </p>
          </div>

          <Input
            label="Subject"
            placeholder="Brief summary of the issue"
            value={escalateForm.subject}
            onChange={(e) => setEscalateForm({ ...escalateForm, subject: e.target.value })}
          />

          <Textarea
            label="Additional Details (optional)"
            placeholder="Add any extra context that may help the technician..."
            rows={4}
            value={escalateForm.description}
            onChange={(e) => setEscalateForm({ ...escalateForm, description: e.target.value })}
          />

          <Select
            label="Priority"
            value={escalateForm.priority}
            onChange={(e) => setEscalateForm({ ...escalateForm, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
          >
            <option value="low">Low — Not urgent</option>
            <option value="medium">Medium — Normal priority</option>
            <option value="high">High — Affects work</option>
            <option value="urgent">Urgent — Critical issue</option>
          </Select>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => setEscalateModal(false)}>Cancel</Button>
            <Button onClick={handleEscalate} loading={escalating}>
              <TicketCheck className="w-4 h-4" />
              Create Ticket
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
