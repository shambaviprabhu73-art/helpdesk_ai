-- HelpDesk AI — Database Schema
-- This file documents the complete database schema for reference.
-- The schema is applied via Supabase migrations in the actual project.

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Check if the current authenticated user is staff (admin or technician)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'technician')
    AND is_active = true
  );
$$;

-- Check if the current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
    AND is_active = true
  );
$$;

-- Generate a human-readable ticket number (TKT-YYYY-NNNNN)
CREATE SEQUENCE IF NOT EXISTS public.ticket_number_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_val bigint;
  year text := to_char(now(), 'YYYY');
BEGIN
  SELECT nextval('public.ticket_number_seq') INTO next_val;
  RETURN 'TKT-' || year || '-' || lpad(next_val::text, 5, '0');
END;
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text,
  department text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'technician')),
  is_active boolean NOT NULL DEFAULT true,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tickets
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE NOT NULL DEFAULT public.generate_ticket_number(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  subject text NOT NULL,
  description text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  ai_summary text,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  rating_comment text,
  resolved_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ticket Messages
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_role text NOT NULL DEFAULT 'user' CHECK (sender_role IN ('user', 'admin', 'technician', 'system')),
  body text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Attachments
CREATE TABLE IF NOT EXISTS public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  file_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Chat Sessions
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New Chat',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'escalated', 'archived')),
  escalated_ticket_id uuid REFERENCES public.tickets(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  suggested_category text,
  can_escalate boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('ticket_update', 'ticket_assigned', 'ticket_resolved', 'ticket_closed', 'message_received', 'system')),
  title text NOT NULL,
  body text NOT NULL,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Knowledge Base
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  problem text NOT NULL,
  solution text NOT NULL,
  keywords text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_attachments_ticket_id ON public.attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- ============================================================
-- TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS trg_tickets_updated_at ON public.tickets;
CREATE TRIGGER trg_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- See migration file for full policy definitions.
-- Key policies:
-- - Users can CRUD their own tickets, chats, notifications
-- - Staff can read/update all tickets, read all profiles
-- - Admins can manage users and categories
-- - Categories and knowledge base are readable by all authenticated users

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO public.categories (name, description, icon) VALUES
  ('Wi-Fi & Network', 'Wireless connectivity, VPN, and network access issues', 'wifi'),
  ('Printer & Hardware', 'Printer setup, hardware failures, peripheral devices', 'printer'),
  ('Software & Applications', 'Installation, licensing, and application errors', 'app-window'),
  ('Email & Communication', 'Email login, configuration, and messaging tools', 'mail'),
  ('Account & Password', 'Password resets, account access, MFA issues', 'key-round'),
  ('Security & Antivirus', 'Malware, antivirus, and security policy issues', 'shield-check'),
  ('Hardware & Devices', 'Laptop, desktop, and mobile device problems', 'laptop'),
  ('Other', 'Issues not covered by other categories', 'circle-help')
ON CONFLICT (name) DO NOTHING;

-- Knowledge base articles are seeded in the full migration.
