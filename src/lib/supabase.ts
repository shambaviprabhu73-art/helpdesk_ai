import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  department: string | null;
  role: 'user' | 'admin' | 'technician';
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
};

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type Ticket = {
  id: string;
  ticket_number: string;
  user_id: string;
  assigned_to: string | null;
  category_id: string | null;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  ai_summary: string | null;
  rating: number | null;
  rating_comment: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  assigned_profile?: Profile;
  categories?: Category;
};

export type TicketMessage = {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: 'user' | 'admin' | 'technician' | 'system';
  body: string;
  is_internal: boolean;
  created_at: string;
  profiles?: Profile;
};

export type Attachment = {
  id: string;
  ticket_id: string;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string | null;
  created_at: string;
};

export type ChatSession = {
  id: string;
  user_id: string;
  title: string;
  status: 'active' | 'escalated' | 'archived';
  escalated_ticket_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  suggested_category: string | null;
  can_escalate: boolean;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: 'ticket_update' | 'ticket_assigned' | 'ticket_resolved' | 'ticket_closed' | 'message_received' | 'system';
  title: string;
  body: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export type KnowledgeArticle = {
  id: string;
  category_id: string | null;
  title: string;
  problem: string;
  solution: string;
  keywords: string[];
  created_at: string;
  updated_at: string;
  categories?: Category;
};
