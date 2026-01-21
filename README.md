# Resonance

**Enterprise-ready AI chatbot platform for B2B SaaS**

[![Build in Public](https://img.shields.io/badge/Build%20in%20Public-🚀-blue)](https://twitter.com/PiyushMehtas)
[![Tests](https://img.shields.io/badge/Tests-44%20passing-brightgreen)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Local AI](https://img.shields.io/badge/Local%20AI-$0%2Fmonth-orange)]()

> Deploy an AI support agent in 24 hours. Handle 70% of customer inquiries automatically. Save 60-80% on support costs.

## ✨ Features

- **🤖 AI Assistants** - Create and manage multiple AI support agents
- **📚 Knowledge Base** - RAG pipeline with semantic search
- **💬 Chat Widget** - Embeddable, customizable, real-time
- **📊 Analytics** - Track resolution rates, cost savings, ROI
- **🔌 Integrations** - Slack, Zendesk, HubSpot, Salesforce ready
- **🏠 Local AI** - Run Ollama on your GPU for $0/month

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/piyush97/resonance.git
cd resonance

# Install dependencies
npm install

# Start all services
npm run dev
```

**Services:**
- Dashboard: http://localhost:3000
- API: http://localhost:3001
- KB Service: http://localhost:8000

## 📁 Project Structure

```
resonance/
├── apps/
│   ├── web/              # Next.js 16 dashboard
│   └── api/              # Fastify API + WebSocket
├── services/
│   └── kb/               # FastAPI RAG pipeline
├── packages/
│   └── widget/           # React chat widget
├── docs/                 # Documentation
└── scripts/              # Setup scripts
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16.1.4, React 19.2.3, Tailwind CSS 4.1.18 |
| API | Fastify 5.7.1, WebSocket |
| KB Service | FastAPI 0.128.0, Python 3.14 |
| Database | Supabase (PostgreSQL) |
| Vector DB | Pinecone |
| LLM | Ollama (local) / OpenAI (cloud) |
| Embeddings | sentence-transformers / Pinecone integrated |
| Build | Turborepo, npm workspaces |
| Testing | Vitest 4.0.17, Pytest |

## 🧪 Testing

```bash
# Run all tests (44 passing)
npm test

# Run with coverage
npm run test:coverage
```

## 📦 Widget Installation

Add to any website:

```html
<script 
  src="https://cdn.resonance.ai/widget.js"
  data-assistant-id="YOUR_ASSISTANT_ID"
  data-primary-color="#0ea5e9"
></script>
```

Or use as React component:

```tsx
import { ChatWidget } from '@resonance/widget'

<ChatWidget 
  assistantId="your-assistant-id"
  primaryColor="#0ea5e9"
/>
```

## 🔧 Environment Variables

```bash
# API Service
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
KB_SERVICE_URL=http://localhost:8000

# KB Service
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=your-index
LLM_PROVIDER=local  # or "openai"
OLLAMA_MODEL=llama3.2:latest

# Web Dashboard
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📈 Business Value

| Metric | Target |
|--------|--------|
| AI Resolution Rate | 70%+ |
| Response Time | <2 seconds |
| Cost Savings | 60-80% |
| Setup Time | 24 hours |

## 🗺️ Roadmap

- [x] Core RAG pipeline
- [x] WebSocket real-time chat
- [x] Dashboard with analytics
- [x] Embeddable widget
- [x] Local AI support (Ollama)
- [ ] Multi-tenant auth
- [ ] Stripe billing
- [ ] Slack integration
- [ ] Email channel

## 🤝 Contributing

PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT © [Piyush Mehta](https://github.com/piyush97)

---

**Built in public** 🚀 Follow the journey: [@PiyushMehtas](https://twitter.com/PiyushMehtas)
