# Supabase Setup Guide for Resonance

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Name it `resonance-dev`
4. Choose a strong database password (save this!)
5. Select region closest to your users
6. Wait for project to be created (~2 minutes)

## Step 2: Get Your API Keys

1. Go to **Settings → API**
2. Copy these values:

```bash
# Project URL (public)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co

# Anon Key (public - safe for frontend)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Service Role Key (SECRET - backend only!)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Step 3: Run Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Click **New Query**
3. Copy the contents of `docs/supabase-schema.sql`
4. Click **Run**
5. Verify tables were created in **Table Editor**

## Step 4: Configure Environment Variables

### For the API service (`apps/api/.env`):

```bash
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### For the Web app (`apps/web/.env`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Step 5: Test the Connection

```bash
# From the API directory
cd apps/api
npm run dev

# Test the health endpoint
curl http://localhost:3001/health
```

You should see `"database": "configured"` in the response.

## Tables Created

| Table | Purpose |
|-------|---------|
| `customers` | Workspaces/accounts |
| `assistants` | AI chatbots per workspace |
| `conversations` | Chat sessions |
| `messages` | Individual messages |
| `escalations` | Human handoff tracking |
| `kb_documents` | Knowledge base files |
| `integrations` | Third-party connections |
| `analytics_events` | Usage tracking |

## Security Notes

- **Service Role Key**: Never expose in frontend code
- **Anon Key**: Safe for client-side, but limited by RLS
- **RLS Enabled**: All tables have Row Level Security
- Configure RLS policies based on your auth setup

## Next Steps

1. Set up authentication (Supabase Auth or custom)
2. Configure RLS policies for multi-tenancy
3. Add Stripe integration for billing
4. Set up database backups
