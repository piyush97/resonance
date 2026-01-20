# Resonance API

Node.js conversation service using Fastify.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
PORT=3001
LOG_LEVEL=info
```

3. Run dev server:
```bash
npm run dev
```

## API Endpoints

- `POST /api/v1/conversations/create` - Create new conversation
- `GET /api/v1/conversations/:id` - Get conversation history
- `WS /api/v1/conversations/:id/ws` - WebSocket for real-time chat
