# 🚀 All Services Running - Resonance

## ✅ Services Status

All three services are running successfully:

| Service | Port | Status | URL |
|---------|------|--------|-----|
| **KB Service** | 8000 | ✅ Running | http://localhost:8000 |
| **API Service** | 3001 | ✅ Running | http://localhost:3001 |
| **Web Dashboard** | 3000 | ✅ Running | http://localhost:3000 |
| **Widget Dev** | 5173 | ✅ Running | http://localhost:5173 |

## Health Check

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-20T23:12:43.949Z",
  "services": {
    "api": "ok",
    "kb": "ok",
    "database": "configured"
  }
}
```

## Architecture

```
┌─────────────────┐
│  Chat Widget    │  Port 5173 (dev)
│  (React)        │
└────────┬────────┘
         │ WebSocket
         ▼
┌─────────────────┐
│  API Service    │  Port 3001
│  (Node.js)      │  - WebSocket server
│                 │  - REST API
└────────┬────────┘  - Conversation management
         │ HTTP
         ▼
┌─────────────────┐
│  KB Service     │  Port 8000
│  (Python)       │  - Document upload
│                 │  - RAG pipeline
│                 │  - Local Ollama LLM
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Pinecone (sterling-willow)     │
│  - Integrated embeddings        │
│  - llama-text-embed-v2 (384d)   │
│  - Cosine similarity            │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Ollama         │  Port 11434
│  llama3.2       │  - Local LLM
│  (2.0 GB)       │  - GPU accelerated
└─────────────────┘
```

## API Endpoints

### KB Service (Port 8000)

```bash
# Health
GET /health

# Upload document
POST /api/knowledge-base/upload
  -F "file=@document.pdf"
  -F "assistant_id=demo"

# Search
POST /api/knowledge-base/search
  {"query": "...", "assistant_id": "demo"}

# Chat
POST /api/knowledge-base/chat
  {"query": "...", "assistant_id": "demo"}
```

### API Service (Port 3001)

```bash
# Health
GET /health

# Create conversation
POST /api/v1/conversations/create
  {"visitor_id": "...", "channel": "web"}

# WebSocket chat
WS /api/v1/conversations/:id/ws

# Assistants
GET    /api/v1/assistants
POST   /api/v1/assistants
GET    /api/v1/assistants/:id
PATCH  /api/v1/assistants/:id
DELETE /api/v1/assistants/:id
```

## Running Services

### Start All Services

```bash
# From project root
npm run dev
```

This starts:
- KB service (Python)
- API service (Node.js)
- Web dashboard (Next.js)
- Widget dev server (Vite)

### Start Individual Services

```bash
# KB Service only
cd services/kb
source venv/bin/activate
python main.py

# API Service only
cd apps/api
npm run dev

# Web Dashboard only
cd apps/web
npm run dev

# Widget only
cd packages/widget
npm run dev
```

## Testing

### Test KB Service

```bash
cd services/kb
source venv/bin/activate
python test_full_pipeline.py
```

### Test API Service

```bash
# Health check
curl http://localhost:3001/health

# Create assistant
curl -X POST http://localhost:3001/api/v1/assistants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Assistant",
    "description": "Test assistant"
  }'
```

### Test WebSocket

```bash
# Install wscat if needed: npm install -g wscat
wscat -c ws://localhost:3001/api/v1/conversations/test-123/ws

# Send message
{"type": "message", "content": "Hello", "assistant_id": "demo"}
```

## Configuration

### KB Service (`.env`)
```env
EMBEDDING_PROVIDER=pinecone
PINECONE_INDEX_NAME=sterling-willow
LLM_PROVIDER=local
OLLAMA_MODEL=llama3.2:latest
PINECONE_API_KEY=pcsk_...
```

### API Service (`.env`)
```env
PORT=3001
KB_SERVICE_URL=http://localhost:8000
ALLOWED_ORIGINS=*
```

### Web Dashboard (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Cost: Still $0/month!

- Embeddings: FREE (Pinecone integrated, starter plan)
- LLM: FREE (local Ollama)
- Vector DB: FREE (Pinecone free tier)
- Infrastructure: FREE (running locally)

## Next Steps

1. ✅ KB Service working
2. ✅ API Service working
3. ⏭️ Build web dashboard UI
4. ⏭️ Integrate widget with API
5. ⏭️ End-to-end test
6. ⏭️ Deploy to staging
7. ⏭️ Create demo materials
8. ⏭️ Start validation

## Troubleshooting

### Service not starting?
```bash
# Check if ports are in use
lsof -i :3000
lsof -i :3001
lsof -i :8000

# Kill and restart
pkill -f "python main.py"
pkill -f "tsx watch"
npm run dev
```

### WebSocket not connecting?
- Check CORS settings
- Verify API service is running
- Check browser console for errors

---

**Status**: 🎉 All services running!

**Next**: Build dashboard UI and integrate everything
