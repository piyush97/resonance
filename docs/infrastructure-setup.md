# Infrastructure Setup Guide

Step-by-step guide to set up all free-tier services for Resonance MVP.

## 1. Supabase (Database + Auth)

1. Go to [supabase.com](https://supabase.com)
2. Sign up for free account
3. Create new project:
   - Name: `resonance-dev`
   - Database password: (save this securely)
   - Region: Choose closest to you
4. Wait for project to initialize (~2 minutes)
5. Go to SQL Editor → New Query
6. Copy and paste contents of `docs/supabase-schema.sql`
7. Run the query
8. Go to Settings → API
9. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_KEY` (backend only, never expose)

## 2. Pinecone (Vector Database)

1. Go to [pinecone.io](https://pinecone.io)
2. Sign up for free account
3. Create index:
   - Name: `assistant-default` (you'll create per-assistant indexes later)
   - Dimensions: `1536` (for text-embedding-3-small)
   - Metric: `cosine`
   - Cloud: `AWS`
   - Region: `us-east-1` (or closest)
4. Go to API Keys
5. Copy API key → `PINECONE_API_KEY`

## 3. OpenAI (LLM API)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up / Log in
3. Go to API Keys → Create new secret key
4. Copy key → `OPENAI_API_KEY`
5. Set usage limits:
   - Go to Billing → Usage limits
   - Set hard limit: $50/month (adjust based on budget)
   - This prevents surprise bills

**Cost optimization:**
- Use `gpt-3.5-turbo` for 90% of queries (~$0.002 per request)
- Use `gpt-4-turbo` only for complex queries (~$0.03 per request)
- Use `text-embedding-3-small` for embeddings (~$0.00002 per 1K tokens)

## 4. Vercel (Frontend Hosting)

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository
4. Configure:
   - Framework Preset: `Next.js`
   - Root Directory: `apps/web`
   - Environment Variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

**Free tier limits:**
- 100GB bandwidth/month
- Unlimited deployments
- Perfect for MVP

## 5. Railway / Fly.io (Backend Hosting)

### Option A: Railway (Easier)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. New Project → Deploy from GitHub repo
4. Select your repo
5. Add service:
   - For API: Select `apps/api` directory
   - For KB Service: Select `services/kb` directory
6. Add environment variables (see `.env.example` files)
7. Deploy

**Free tier:** $5 credit/month (enough for MVP)

### Option B: Fly.io (More generous free tier)

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Sign up: `fly auth signup`
3. Launch app: `fly launch` (in `apps/api` directory)
4. Add secrets: `fly secrets set KEY=value`

**Free tier:** 3 shared VMs, 160GB outbound data/month

## 6. Upstash Redis (Cache)

1. Go to [upstash.com](https://upstash.com)
2. Sign up
3. Create Redis database:
   - Name: `resonance-cache`
   - Type: `Regional`
   - Region: Choose closest
4. Copy:
   - REST URL → `UPSTASH_REDIS_REST_URL`
   - REST Token → `UPSTASH_REDIS_REST_TOKEN`

**Free tier:** 10,000 commands/day (plenty for MVP)

## 7. Resend (Email)

1. Go to [resend.com](https://resend.com)
2. Sign up
3. Verify domain (or use test mode)
4. Copy API key → `RESEND_API_KEY`

**Free tier:** 100 emails/day, 3,000/month

## Environment Variables Summary

Create `.env` files in each service:

### `apps/web/.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### `apps/api/.env`
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJxxx...
PORT=3001
LOG_LEVEL=info
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

### `services/kb/.env`
```
OPENAI_API_KEY=sk-xxx...
PINECONE_API_KEY=xxx
PINECONE_ENVIRONMENT=us-east-1
PORT=8000
```

## Cost Estimate (MVP Phase)

| Service | Free Tier | Monthly Cost |
|---------|-----------|--------------|
| Supabase | 500MB DB, 50K MAU | $0 |
| Pinecone | 100K vectors | $0 |
| Vercel | 100GB bandwidth | $0 |
| Railway | $5 credit | $0-5 |
| Upstash | 10K commands/day | $0 |
| Resend | 3K emails/month | $0 |
| OpenAI | Pay-as-you-go | $50-100 |
| **Total** | | **$50-105/month** |

This fits within your $2K/month budget with room to scale.

## Next Steps

1. Set up all services (30-60 minutes)
2. Run database migrations
3. Test each service individually
4. Deploy to staging
5. Test end-to-end flow
