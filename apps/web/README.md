# Resonance Web App

Next.js dashboard and landing page for Resonance.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run dev server:
```bash
npm run dev
```

## Structure

- `/src/app` - Next.js App Router pages
- `/src/components` - Reusable React components
- `/src/lib` - Utilities, Supabase client
