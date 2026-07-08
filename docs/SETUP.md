# HelpDesk AI — Setup Instructions

## Prerequisites

1. **Node.js** 18 or higher
   - Check: `node --version`
   - Download: [nodejs.org](https://nodejs.org)

2. **npm** (comes with Node.js)
   - Check: `npm --version`

3. **A Supabase project** (free tier is fine)
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Note your Project URL and anon key from Settings → API

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This installs:
- React, React DOM, React Router
- Supabase JS client
- Recharts (for charts)
- Tailwind CSS, PostCSS, Autoprefixer
- Lucide React (icons)
- TypeScript, Vite, ESLint (dev)

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database Setup

The database schema is applied automatically via Supabase migrations. If you are setting up from scratch:

1. Go to your Supabase Dashboard
2. Open the SQL Editor
3. Run the schema SQL (found in the migration file)

This creates all tables, RLS policies, triggers, and seeds initial data (categories + knowledge base articles).

### 4. Create Storage Buckets

In Supabase Dashboard → Storage:

1. Create a bucket named `attachments` (set to **private**)
2. Create a bucket named `avatars` (set to **public**)

Storage policies are applied via migration to allow users to upload to their own folders.

### 5. Create an Admin User

1. Start the app and sign up a normal user
2. In Supabase Dashboard → SQL Editor, run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```
3. Sign out and sign in at `/admin/login`

### 6. Run the Development Server

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

### 7. Build for Production

```bash
npm run build
npm run preview
```

The production build is in the `dist/` folder.

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env` exists and has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after editing `.env`

### "User not found" or "Profile not loading"
- The `handle_new_user()` trigger should auto-create a profile on signup
- If it did not, manually insert: `INSERT INTO profiles (id, full_name) VALUES ('<user-id>', '<name>');`

### "Cannot upload files"
- Ensure the `attachments` storage bucket exists
- Check that storage policies are applied (see migration)

### "Admin cannot access admin panel"
- Verify the user's role: `SELECT role FROM profiles WHERE email = 'your-email';`
- If not `admin`, update it: `UPDATE profiles SET role = 'admin' WHERE email = 'your-email';`

### AI assistant not responding
- Ensure the `knowledge_base` table has seeded data
- Check the browser console for errors
- Verify the user is authenticated

## Verification Checklist

- [ ] `.env` configured with Supabase URL and anon key
- [ ] Database schema applied (tables exist)
- [ ] Storage buckets created (`attachments`, `avatars`)
- [ ] Storage policies applied
- [ ] At least one admin user created
- [ ] Dev server runs without errors
- [ ] Can sign up a new user
- [ ] Can sign in and reach dashboard
- [ ] AI chat responds to messages
- [ ] Can submit a ticket
- [ ] Can view tickets in admin panel
- [ ] Charts render on admin dashboard
