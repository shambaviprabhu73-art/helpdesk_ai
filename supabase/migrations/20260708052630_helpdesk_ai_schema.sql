/*
# HelpDesk AI - Complete Database Schema

## Overview
Creates the complete database schema for the HelpDesk AI platform — a modern IT support
system pairing AI-powered troubleshooting with human ticket escalation.

## New Tables
1. profiles — extends auth.users with full_name, phone, department, role, is_active, avatar_url
2. categories — IT issue categories (Wi-Fi, Printer, Software, etc.)
3. tickets — support tickets with auto-generated ticket_number, status, priority, assignment
4. ticket_messages — conversation thread between user and assigned staff
5. attachments — file uploads linked to tickets
6. chat_sessions — AI chat sessions, can be escalated to tickets
7. chat_messages — individual messages in an AI chat session
8. notifications — user notification center
9. knowledge_base — IT troubleshooting articles the AI references

## Security (RLS)
- All tables have RLS enabled.
- Users CRUD their own tickets, chat sessions, messages, attachments, notifications.
- Staff (admin/technician) can read/update all tickets, read all profiles, post messages.
- Admins can manage users (deactivate, change role) and manage categories/knowledge base.
- Helper functions is_staff() and is_admin() (SECURITY DEFINER) check the caller's role.

## Important Notes
1. profiles is auto-populated via a trigger on auth.users INSERT.
2. ticket_number is generated via a Postgres sequence + function (TKT-YYYY-NNNNN).
3. Owner columns default to auth.uid() so frontend inserts work without passing user_id.
4. Order matters: profiles table created first, then helper functions, then profiles policies.
*/

-- ============================================================
-- STEP 1: Create profiles table WITHOUT RLS/policies first
-- ============================================================

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

-- ============================================================
-- STEP 2: Create helper functions (now profiles exists)
-- ============================================================

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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
-- STEP 3: Enable RLS and add policies on profiles
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_staff" ON public.profiles;
CREATE POLICY "profiles_select_own_or_staff" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR public.is_staff());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_all" ON public.categories;
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "categories_insert_admin" ON public.categories;
CREATE POLICY "categories_insert_admin" ON public.categories FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "categories_update_admin" ON public.categories;
CREATE POLICY "categories_update_admin" ON public.categories FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "categories_delete_admin" ON public.categories;
CREATE POLICY "categories_delete_admin" ON public.categories FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- TICKETS TABLE
-- ============================================================

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

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at DESC);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tickets_select_own_or_staff" ON public.tickets;
CREATE POLICY "tickets_select_own_or_staff" ON public.tickets FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "tickets_insert_own" ON public.tickets;
CREATE POLICY "tickets_insert_own" ON public.tickets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "tickets_update_own_or_staff" ON public.tickets;
CREATE POLICY "tickets_update_own_or_staff" ON public.tickets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR public.is_staff())
  WITH CHECK (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "tickets_delete_own_or_admin" ON public.tickets;
CREATE POLICY "tickets_delete_own_or_admin" ON public.tickets FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP TRIGGER IF EXISTS trg_tickets_updated_at ON public.tickets;
CREATE TRIGGER trg_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- TICKET_MESSAGES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_role text NOT NULL DEFAULT 'user' CHECK (sender_role IN ('user', 'admin', 'technician', 'system')),
  body text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON public.ticket_messages(created_at);

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ticket_messages_select_own_or_staff" ON public.ticket_messages;
CREATE POLICY "ticket_messages_select_own_or_staff" ON public.ticket_messages FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_messages.ticket_id AND t.user_id = auth.uid())
    OR public.is_staff()
  );

DROP POLICY IF EXISTS "ticket_messages_insert_own_or_staff" ON public.ticket_messages;
CREATE POLICY "ticket_messages_insert_own_or_staff" ON public.ticket_messages FOR INSERT
  TO authenticated WITH CHECK (
    (auth.uid() = sender_id AND EXISTS (
      SELECT 1 FROM public.tickets t WHERE t.id = ticket_messages.ticket_id AND t.user_id = auth.uid()
    ))
    OR (public.is_staff() AND auth.uid() = sender_id)
  );

DROP POLICY IF EXISTS "ticket_messages_delete_staff" ON public.ticket_messages;
CREATE POLICY "ticket_messages_delete_staff" ON public.ticket_messages FOR DELETE
  TO authenticated USING (public.is_staff());

-- ============================================================
-- ATTACHMENTS TABLE
-- ============================================================

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

CREATE INDEX IF NOT EXISTS idx_attachments_ticket_id ON public.attachments(ticket_id);

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attachments_select_own_or_staff" ON public.attachments;
CREATE POLICY "attachments_select_own_or_staff" ON public.attachments FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = attachments.ticket_id AND t.user_id = auth.uid())
    OR public.is_staff()
  );

DROP POLICY IF EXISTS "attachments_insert_own" ON public.attachments;
CREATE POLICY "attachments_insert_own" ON public.attachments FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = uploaded_by AND EXISTS (
      SELECT 1 FROM public.tickets t WHERE t.id = attachments.ticket_id AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "attachments_delete_own_or_staff" ON public.attachments;
CREATE POLICY "attachments_delete_own_or_staff" ON public.attachments FOR DELETE
  TO authenticated USING (
    auth.uid() = uploaded_by OR public.is_staff()
  );

-- ============================================================
-- CHAT_SESSIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New Chat',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'escalated', 'archived')),
  escalated_ticket_id uuid REFERENCES public.tickets(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON public.chat_sessions(created_at DESC);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_sessions_select_own" ON public.chat_sessions;
CREATE POLICY "chat_sessions_select_own" ON public.chat_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_sessions_insert_own" ON public.chat_sessions;
CREATE POLICY "chat_sessions_insert_own" ON public.chat_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_sessions_update_own" ON public.chat_sessions;
CREATE POLICY "chat_sessions_update_own" ON public.chat_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_sessions_delete_own" ON public.chat_sessions;
CREATE POLICY "chat_sessions_delete_own" ON public.chat_sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trg_chat_sessions_updated_at ON public.chat_sessions;
CREATE TRIGGER trg_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- CHAT_MESSAGES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  suggested_category text,
  can_escalate boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_messages_select_own" ON public.chat_messages;
CREATE POLICY "chat_messages_select_own" ON public.chat_messages FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.chat_sessions s WHERE s.id = chat_messages.session_id AND s.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "chat_messages_insert_own" ON public.chat_messages;
CREATE POLICY "chat_messages_insert_own" ON public.chat_messages FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.chat_sessions s WHERE s.id = chat_messages.session_id AND s.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "chat_messages_delete_own" ON public.chat_messages;
CREATE POLICY "chat_messages_delete_own" ON public.chat_messages FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.chat_sessions s WHERE s.id = chat_messages.session_id AND s.user_id = auth.uid())
  );

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================

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

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_own_or_staff" ON public.notifications;
CREATE POLICY "notifications_insert_own_or_staff" ON public.notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- KNOWLEDGE_BASE TABLE
-- ============================================================

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

ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kb_select_all" ON public.knowledge_base;
CREATE POLICY "kb_select_all" ON public.knowledge_base FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "kb_insert_admin" ON public.knowledge_base;
CREATE POLICY "kb_insert_admin" ON public.knowledge_base FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "kb_update_admin" ON public.knowledge_base;
CREATE POLICY "kb_update_admin" ON public.knowledge_base FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "kb_delete_admin" ON public.knowledge_base;
CREATE POLICY "kb_delete_admin" ON public.knowledge_base FOR DELETE
  TO authenticated USING (public.is_admin());

DROP TRIGGER IF EXISTS trg_kb_updated_at ON public.knowledge_base;
CREATE TRIGGER trg_kb_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- SEED DATA: CATEGORIES
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

-- ============================================================
-- SEED DATA: KNOWLEDGE BASE
-- ============================================================

INSERT INTO public.knowledge_base (category_id, title, problem, solution, keywords) VALUES
  (
    (SELECT id FROM public.categories WHERE name = 'Wi-Fi & Network'),
    'Cannot connect to office Wi-Fi',
    'Your laptop is not connecting to the office wireless network, or the connection keeps dropping.',
    '1. Click the Wi-Fi icon in the system tray and ensure Wi-Fi is turned ON.
2. Select the office network (e.g. "Corp-WiFi") and click Connect.
3. Enter your network credentials when prompted.
4. If the connection fails, forget the network: Settings > Network & Internet > Wi-Fi > Manage known networks > select the network > Forget. Then reconnect.
5. Restart your computer and router (if accessible).
6. Run the Windows Network Troubleshooter: Settings > Network & Internet > Status > Network troubleshooter.
7. If still failing, check with IT whether your device MAC address is registered on the network.',
    ARRAY['wifi', 'wireless', 'connect', 'internet', 'network', 'connection']
  ),
  (
    (SELECT id FROM public.categories WHERE name = 'Wi-Fi & Network'),
    'VPN not connecting',
    'Your VPN client will not establish a connection to the corporate network.',
    '1. Ensure you have an active internet connection first.
2. Open your VPN client (Cisco AnyConnect, GlobalProtect, etc.).
3. Enter the VPN address provided by IT and click Connect.
4. Enter your corporate username, password, and MFA token when prompted.
5. If it hangs on "connecting", try switching to a different network (mobile hotspot) to rule out ISP blocking.
6. Restart the VPN client and your computer.
7. If the issue persists, the VPN server may be down — check the IT status page or contact support.',
    ARRAY['vpn', 'remote', 'access', 'connection', 'cisco', 'globalprotect']
  ),
  (
    (SELECT id FROM public.categories WHERE name = 'Printer & Hardware'),
    'Printer not printing or offline',
    'Documents sent to the printer are not printing, or the printer shows as offline.',
    '1. Check the printer is powered ON and connected to the network (look for a solid Wi-Fi or network light).
2. On your computer, go to Settings > Devices > Printers & scanners.
3. Select your printer and click "Open queue" — clear any stuck documents.
4. Click "Set as default printer" and ensure "Let Windows manage my default printer" is OFF.
5. Run the printer troubleshooter: Settings > Devices > Printers & scanners > Run the troubleshooter.
6. Remove the printer and re-add it: Remove device > Add a printer or scanner.
7. Check for paper jams, low ink/toner, or error lights on the printer itself.
8. Restart the print spooler: open Services (services.msc) > Print Spooler > Restart.',
    ARRAY['printer', 'print', 'offline', 'not printing', 'queue', 'spooler']
  ),
  (
    (SELECT id FROM public.categories WHERE name = 'Software & Applications'),
    'Software installation error',
    'You are unable to install a software application, or the installer shows an error.',
    '1. Ensure you are logged in as an administrator on your computer, or run the installer as administrator (right-click > Run as administrator).
2. Check the software is approved by IT — unapproved software may be blocked by policy.
3. Temporarily disable antivirus during installation (re-enable after).
4. Check available disk space: you need at least 2x the installer size free.
5. Download the latest version from the official vendor site or IT software portal.
6. If you see error 1603 or similar, the previous version may not have been removed — uninstall it first from Control Panel.
7. Restart your computer and try again.
8. If still failing, note the exact error code and contact IT support.',
    ARRAY['install', 'software', 'error', 'setup', 'application', 'installer']
  ),
  (
    (SELECT id FROM public.categories WHERE name = 'Account & Password'),
    'Forgot password or locked out of account',
    'You cannot sign in because you forgot your password or your account is locked.',
    '1. Go to the sign-in page and click "Forgot Password".
2. Enter your work email address and click "Send reset link".
3. Check your inbox (and spam/junk folder) for an email from the system.
4. Click the reset link in the email — it expires in 60 minutes.
5. Enter a new password that meets the policy: at least 8 characters, with uppercase, lowercase, a number, and a symbol.
6. Sign in with your new password.
7. If your account is locked after too many attempts, wait 15 minutes or contact IT to unlock it.
8. If you do not receive the reset email, verify you are using the correct email address and contact IT.',
    ARRAY['password', 'forgot', 'reset', 'locked', 'account', 'login', 'sign in']
  ),
  (
    (SELECT id FROM public.categories WHERE name = 'Email & Communication'),
    'Cannot log in to email or email not syncing',
    'You cannot access your email account, or new emails are not arriving in your inbox.',
    '1. Go to the webmail portal (mail.yourcompany.com) and try signing in there first — this rules out desktop client issues.
2. Verify your password is correct by signing in to another company service.
3. If webmail works but the desktop client does not, remove and re-add the account: File > Account Settings > Account Settings > Remove, then Add Account.
4. Check for a yellow exclamation mark in Outlook — click it to enter your password.
5. If you see "need password" at the bottom, click it and enter credentials.
6. Restart the email client.
7. If still not syncing, run the Support and Recovery Assistant (SARA) tool from Microsoft.
8. Contact IT if your mailbox may be full — you may need to archive old emails.',
    ARRAY['email', 'outlook', 'login', 'sync', 'inbox', 'mail', 'cannot access']
  ),
  (
    (SELECT id FROM public.categories WHERE name = 'Hardware & Devices'),
    'Computer running very slowly',
    'Your computer is taking a long time to start up, open applications, or respond to clicks.',
    '1. Restart your computer — this resolves most temporary slowness.
2. Check Task Manager (Ctrl+Shift+Esc) for apps using high CPU or memory. Close unnecessary apps.
3. Check the Startup tab in Task Manager and disable apps you do not need at startup.
4. Run a full antivirus scan — malware can cause slowness.
5. Free up disk space: aim for at least 15% free. Use Storage Sense (Settings > System > Storage) to clean up.
6. Check for Windows updates and install them.
7. If the hard disk is nearly full, move large files to OneDrive or an external drive.
8. If the computer is more than 4 years old, it may need a hardware upgrade (SSD, more RAM) — contact IT.',
    ARRAY['slow', 'performance', 'lag', 'freeze', 'hang', 'speed', 'computer']
  ),
  (
    (SELECT id FROM public.categories WHERE name = 'Hardware & Devices'),
    'Blue screen of death (BSOD)',
    'Your computer shows a blue screen with an error code and restarts.',
    '1. Note the error code on the blue screen (e.g. CRITICAL_PROCESS_DIED, 0x000000EF).
2. Restart the computer. If it boots normally, it may have been a one-time issue.
3. If it blue-screens repeatedly, boot into Safe Mode: Settings > Recovery > Advanced startup > Restart now > Troubleshoot > Advanced options > Startup Settings > Restart > press 4 or F4.
4. In Safe Mode, uninstall any recently installed software or drivers.
5. Run Windows Update and install all pending updates.
6. Run a full antivirus scan.
7. Check Device Manager for any devices with yellow exclamation marks and update their drivers.
8. If the issue persists, contact IT — there may be a hardware fault (RAM, hard drive).',
    ARRAY['bsod', 'blue screen', 'crash', 'restart', 'error', 'stop', 'critical']
  ),
  (
    (SELECT id FROM public.categories WHERE name = 'Security & Antivirus'),
    'Computer may have a virus or malware',
    'Your computer is showing pop-ups, running slowly, or behaving suspiciously — you suspect malware.',
    '1. Disconnect from the internet immediately to prevent data exfiltration.
2. Run a full scan with your installed antivirus (Windows Defender: Settings > Privacy & security > Windows Security > Virus & threat protection > Scan options > Full scan).
3. If the scan finds threats, allow the antivirus to quarantine or remove them.
4. Restart your computer and run the scan again to confirm it is clean.
5. Change your passwords for important accounts (email, banking) from a different, known-clean device.
6. Do NOT pay any ransom or click any links in pop-ups.
7. If the antivirus cannot remove the threat, contact IT immediately — your computer may need to be wiped and re-imaged.',
    ARRAY['virus', 'malware', 'antivirus', 'security', 'popup', 'infected', 'trojan']
  ),
  (
    (SELECT id FROM public.categories WHERE name = 'Software & Applications'),
    'Microsoft Office will not activate',
    'Microsoft Word, Excel, or Outlook shows an activation error or "Unlicensed Product".',
    '1. Open any Office app (e.g. Word) and sign in with your work account in the top-right corner.
2. If already signed in, sign out and sign back in.
3. Check your internet connection — Office needs to contact the licensing server.
4. Run the Office Repair tool: Control Panel > Programs > Microsoft 365 > Change > Online Repair.
5. Check the date and time on your computer are correct — incorrect time breaks activation.
6. If you see error 0xC0000005 or similar, your license may have expired — contact IT to verify your license.
7. As a workaround, use Office on the web at office.com while the issue is being resolved.',
    ARRAY['office', 'word', 'excel', 'outlook', 'activate', 'license', 'unlicensed', 'microsoft']
  )
ON CONFLICT DO NOTHING;
