# HelpDesk AI — IT Support, Reimagined

A modern, full-stack IT support platform that pairs **AI-powered troubleshooting** with **human ticket escalation**. Built as a final-year IT engineering project, production-ready and immediately deployable.

![HelpDesk AI](https://img.shields.io/badge/HelpDesk-AI-2563eb) ![React](https://img.shields.io/badge/React-18-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6) ![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Environment Configuration](#environment-configuration)
7. [Database Setup](#database-setup)
8. [Running Locally](#running-locally)
9. [Usage Guide](#usage-guide)
10. [Security](#security)
11. [API Reference](#api-reference)
12. [License](#license)

---

## Overview

HelpDesk AI bridges the gap between instant self-service and human expertise. Most IT issues are common and repeatable — perfect for AI. But when you need a human, you need one fast, with full context. This platform delivers both.

**The flow:**
1. User describes their IT issue in a natural-language chat
2. The AI assistant matches it against a curated knowledge base and walks them through a solution
3. If AI cannot resolve it, the user escalates to a support ticket with one click — full chat history attached
4. Technicians manage tickets from the admin console, with real-time status updates and notifications

---

## Features

### Authentication
- **Sign Up** with email, password, and full name
- **Sign In** with secure session management (Supabase Auth, JWT-based)
- **Sign Out** with full session cleanup
- **Forgot Password** with email-based reset link (60-minute expiry)
- **Password validation** — 8+ chars, uppercase, lowercase, number
- **Admin login** — separate, secure admin console access

### User Dashboard
- **Real-time AI chat** — natural language IT troubleshooting
- **AI knowledge base** covering: Wi-Fi, VPN, printers, software install, email, passwords, slow performance, BSOD, malware, Office activation
- **One-click escalation** — convert chat to support ticket with full context
- **File uploads** — screenshots, logs, documents (up to 10MB)
- **Auto-generated ticket IDs** — format `TKT-YYYY-NNNNN`
- **Ticket status tracking** — Open → In Progress → Resolved → Closed
- **Ticket history** with search and status filters
- **Notification center** for ticket updates
- **Profile management** — edit name, phone, department, avatar, change password
- **Ticket rating** — 1-5 stars after resolution

### Admin Dashboard
- **Secure admin authentication** (role-based: admin, technician)
- **Ticket management** — view all, filter, search, assign, update status
- **User management** — view, edit, deactivate, change roles
- **Reports & analytics** — interactive charts (ticket volume, resolution time, category breakdown, priority distribution)
- **CSV export** of all ticket data
- **Internal notes** on tickets (visible to staff only)
- **Notification sending** — notify users of ticket updates

### Public Website
- **Home** — hero, features, how-it-works, testimonials, CTA
- **About** — mission, vision, values, journey timeline
- **Services** — 8 service categories, pricing plans
- **FAQ** — categorized, expandable
- **Contact** — contact form, business info, hours

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| **Database** | PostgreSQL (via Supabase) with Row Level Security |
| **Auth** | Supabase Auth (JWT sessions, bcrypt password hashing) |
| **Storage** | Supabase Storage (attachments, avatars) |
| **Charts** | Recharts (bar, line, area, pie, radial) |
| **Routing** | React Router v6 |

---

## Project Structure

```
helpdesk-ai/
├── public/                  # Static assets (favicon)
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Button, Input, Card, Modal, Toast, etc.
│   │   └── layout/          # Navbar, Footer, DashboardLayout, AdminLayout
│   ├── context/             # React contexts (AuthContext)
│   ├── lib/                 # Supabase client, AI engine, types
│   ├── pages/               # All pages
│   │   ├── public/          # Home, About, Services, FAQ, Contact
│   │   ├── auth/            # SignIn, SignUp, ForgotPassword, AdminLogin
│   │   ├── dashboard/       # User dashboard pages
│   │   └── admin/           # Admin dashboard pages
│   ├── App.tsx              # Main app with routing
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles + Tailwind
├── supabase/
│   └── functions/           # Edge functions (if needed)
├── docs/                    # Documentation
├── .env.example             # Environment template
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- A **Supabase** project (free tier at [supabase.com](https://supabase.com))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd helpdesk-ai

# Install dependencies
npm install

# Copy the environment template
cp .env.example .env

# Add your Supabase credentials to .env (see below)
```

---

## Environment Configuration

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase Dashboard → Project Settings → API.

> **Note:** The `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_DB_URL` are used server-side only and should NEVER be exposed in the frontend.

---

## Database Setup

The database schema is applied via Supabase migrations. The schema includes:

- `profiles` — extends `auth.users` with role, department, etc.
- `categories` — IT issue categories
- `tickets` — support tickets with auto-generated IDs
- `ticket_messages` — conversation threads
- `attachments` — file uploads
- `chat_sessions` / `chat_messages` — AI chat history
- `notifications` — user notification center
- `knowledge_base` — IT troubleshooting articles

### Applying the Schema

The schema is applied automatically when you run the project with a provisioned Supabase instance. If you need to apply it manually, use the Supabase MCP `apply_migration` tool with the SQL from the migration file.

### Seeded Data

The schema seeds:
- **8 categories** (Wi-Fi, Printer, Software, Email, Account, Security, Hardware, Other)
- **10 knowledge base articles** covering common IT issues

### Storage Buckets

Create two storage buckets in Supabase:
- `attachments` (private) — for ticket file uploads
- `avatars` (public) — for user profile pictures

### Creating an Admin User

1. Sign up a normal user through the app
2. In the Supabase Dashboard, run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```
3. Sign in through the admin login page at `/admin/login`

---

## Running Locally

```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview

# Run type checking
npm run typecheck

# Run linting
npm run lint
```

The dev server runs at `http://localhost:5173`.

---

## Usage Guide

### For Users

1. **Sign up** at `/signup` with your name, email, and password
2. **Chat with AI** — go to the AI Assistant and describe your IT issue
3. **Escalate if needed** — if AI cannot resolve, click "Escalate to Ticket"
4. **Track tickets** — view all your tickets under "My Tickets"
5. **Rate resolved tickets** — leave a 1-5 star rating after resolution

### For Admins

1. **Sign in** at `/admin/login` with an admin account
2. **View overview** — dashboard with charts and recent tickets
3. **Manage tickets** — assign technicians, update status, reply to users
4. **Manage users** — edit profiles, change roles, deactivate accounts
5. **View reports** — analytics on ticket volume, resolution times, categories
6. **Export data** — download CSV of all tickets

---

## Security

### Authentication & Authorization
- **Supabase Auth** — JWT-based sessions with automatic refresh
- **Password hashing** — bcrypt via Supabase (never stored in plain text)
- **Role-based access** — `user`, `technician`, `admin` roles
- **Protected routes** — frontend guards + backend RLS

### Row Level Security (RLS)
Every table has RLS enabled with strict policies:
- Users can only access their own tickets, chats, notifications
- Staff (admin/technician) can access all tickets and user profiles
- Only admins can manage users and categories

### Data Protection
- **SQL injection prevention** — parameterized queries via Supabase client
- **XSS prevention** — React's built-in escaping, no `dangerouslySetInnerHTML`
- **CSRF protection** — Supabase Auth handles CSRF tokens
- **File upload validation** — 10MB limit, type checking
- **Session security** — httpOnly cookies, secure token storage

### Helper Functions
- `is_staff()` — checks if current user is admin or technician
- `is_admin()` — checks if current user is admin
- `generate_ticket_number()` — creates unique, human-readable ticket IDs

---

## API Reference

The app uses Supabase's auto-generated REST API. Key tables:

| Table | Operations | Access |
|-------|-----------|--------|
| `profiles` | SELECT, UPDATE | Own profile / Admin all |
| `tickets` | CRUD | Own tickets / Staff all |
| `ticket_messages` | SELECT, INSERT | Own tickets / Staff all |
| `attachments` | SELECT, INSERT, DELETE | Own / Staff all |
| `chat_sessions` | CRUD | Own only |
| `chat_messages` | SELECT, INSERT, DELETE | Own only |
| `notifications` | SELECT, UPDATE, DELETE | Own only |
| `categories` | SELECT | All authenticated |
| `knowledge_base` | SELECT | All authenticated |

---

## License

This project is built as a final-year IT engineering project. Free to use for educational purposes.

---

**Built with care. Ship it.**
