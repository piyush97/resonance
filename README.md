# Resonance - AI Customer Service Chatbot SaaS

AI-powered customer service chatbot platform for B2B SaaS companies.

## Project Structure

```
.
├── apps/
│   ├── web/          # Next.js dashboard + landing page
│   └── api/          # Node.js conversation service
├── services/
│   └── kb/           # Python FastAPI knowledge base service
├── packages/
│   └── widget/       # React chat widget (embeddable)
└── docs/             # Documentation
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS
- **Backend**: Node.js (Fastify), Python (FastAPI)
- **Database**: Supabase (PostgreSQL)
- **Vector DB**: Pinecone
- **Cache**: Upstash Redis
- **LLM**: OpenAI API (GPT-3.5/4)
- **Hosting**: Vercel (frontend), Railway (backend)

## Getting Started

See individual README files in each app/service directory.

## Phase

**Current**: VALIDATION (Week 1-2)
**Goal**: 20 validation calls, confirm $500/mo willingness to pay
