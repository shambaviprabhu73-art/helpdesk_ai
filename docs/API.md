# HelpDesk AI — API Documentation

This document describes the database schema, RLS policies, and data flows used by the HelpDesk AI platform.

## Database Schema

### `profiles`
Extends Supabase's `auth.users` with application-specific user data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | References `auth.users.id` |
| `full_name` | text | User's display name |
| `phone` | text | Contact phone (nullable) |
| `department` | text | User's department (nullable) |
| `role` | text | `user`, `admin`, or `technician` (default: `user`) |
| `is_active` | boolean | Account active flag (default: `true`) |
| `avatar_url` | text | Profile picture URL (nullable) |
| `created_at` | timestamptz | Account creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

**RLS Policies:**
- SELECT: own profile OR staff
- UPDATE: own profile (self) OR admin (any)
- INSERT: own profile (triggered on signup)

### `categories`
IT issue categories for ticket classification.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Category ID |
| `name` | text (unique) | Category name |
| `description` | text | Category description |
| `icon` | text | Lucide icon name |
| `created_at` | timestamptz | Creation timestamp |

**RLS Policies:** SELECT for all authenticated; INSERT/UPDATE/DELETE for admins only.

### `tickets`
Support tickets created by users.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Ticket ID |
| `ticket_number` | text (unique) | Human-readable ID (`TKT-YYYY-NNNNN`) |
| `user_id` | uuid (FK) | Ticket owner |
| `assigned_to` | uuid (FK, nullable) | Assigned technician/admin |
| `category_id` | uuid (FK, nullable) | Issue category |
| `subject` | text | Short title |
| `description` | text | Detailed problem description |
| `priority` | text | `low`, `medium`, `high`, `urgent` |
| `status` | text | `open`, `in_progress`, `resolved`, `closed` |
| `ai_summary` | text | AI-generated summary (if escalated from chat) |
| `rating` | int | User satisfaction rating 1-5 |
| `rating_comment` | text | Rating comment |
| `resolved_at` | timestamptz | Resolution timestamp |
| `closed_at` | timestamptz | Closure timestamp |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

**RLS Policies:**
- SELECT: own tickets OR staff
- INSERT: own tickets (user_id defaults to `auth.uid()`)
- UPDATE: own tickets OR staff
- DELETE: own tickets OR admin

### `ticket_messages`
Conversation thread on a ticket.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Message ID |
| `ticket_id` | uuid (FK) | Ticket reference |
| `sender_id` | uuid (FK) | Message sender |
| `sender_role` | text | `user`, `admin`, `technician`, `system` |
| `body` | text | Message content |
| `is_internal` | boolean | Internal note (staff only) |
| `created_at` | timestamptz | Send timestamp |

### `attachments`
File attachments linked to tickets.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Attachment ID |
| `ticket_id` | uuid (FK) | Ticket reference |
| `uploaded_by` | uuid (FK) | Uploader |
| `file_name` | text | Original file name |
| `file_path` | text | Storage path |
| `file_size` | bigint | Size in bytes |
| `file_type` | text | MIME type |
| `created_at` | timestamptz | Upload timestamp |

### `chat_sessions`
AI chat sessions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Session ID |
| `user_id` | uuid (FK) | Owner |
| `title` | text | Session title (auto from first message) |
| `status` | text | `active`, `escalated`, `archived` |
| `escalated_ticket_id` | uuid (FK, nullable) | Ticket created from this session |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

### `chat_messages`
Individual messages in AI chat sessions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Message ID |
| `session_id` | uuid (FK) | Session reference |
| `role` | text | `user`, `assistant`, `system` |
| `content` | text | Message body |
| `suggested_category` | text | AI-suggested category |
| `can_escalate` | boolean | AI flags escalation opportunity |
| `created_at` | timestamptz | Send timestamp |

### `notifications`
User notification center.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Notification ID |
| `user_id` | uuid (FK) | Recipient |
| `type` | text | `ticket_update`, `ticket_assigned`, `ticket_resolved`, `ticket_closed`, `message_received`, `system` |
| `title` | text | Notification title |
| `body` | text | Notification body |
| `link` | text | URL to navigate to |
| `is_read` | boolean | Read flag |
| `created_at` | timestamptz | Creation timestamp |

### `knowledge_base`
IT troubleshooting articles.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Article ID |
| `category_id` | uuid (FK) | Category reference |
| `title` | text | Article title |
| `problem` | text | Problem description |
| `solution` | text | Step-by-step solution |
| `keywords` | text[] | Search keywords |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

## Helper Functions

### `is_staff()`
Returns `true` if the current authenticated user has role `admin` or `technician` and is active.

### `is_admin()`
Returns `true` if the current authenticated user has role `admin` and is active.

### `generate_ticket_number()`
Generates a unique, human-readable ticket number in the format `TKT-YYYY-NNNNN` using a Postgres sequence.

### `handle_new_user()`
Trigger function that auto-creates a `profiles` row when a new user signs up via `auth.users`.

## AI Engine

The AI assistant uses a keyword-matching algorithm against the `knowledge_base` table:

1. **Tokenize** the user's message
2. **Score** each article based on keyword matches, title matches, and problem matches
3. **Return** the highest-scoring article's solution
4. **Flag escalation** if no good match is found or after multiple messages

The engine handles greetings, thanks, and escalation triggers specially.

## Data Flow

### User creates a ticket via AI chat
1. User sends message → stored in `chat_messages`
2. AI generates response → stored in `chat_messages` with `can_escalate` flag
3. User clicks "Escalate to Ticket"
4. System creates `tickets` row with `ai_summary` containing chat history
5. `chat_sessions.status` updated to `escalated`
6. Notification sent to user

### Admin manages a ticket
1. Admin views ticket in admin console
2. Admin assigns technician → `tickets.assigned_to` updated
3. Notification sent to user (`ticket_assigned`)
4. Admin replies → `ticket_messages` row created
5. Notification sent to user (`message_received`)
6. Admin updates status → `tickets.status` updated
7. Notification sent to user (`ticket_resolved` or `ticket_closed`)
