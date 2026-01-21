# Hybrid LLM Setup - Local & OpenAI

Resonance now supports both local LLMs (for development) and OpenAI (for production) with automatic switching based on environment configuration.

## How It Works

The system automatically detects which LLM provider to use based on the `LLM_PROVIDER` environment variable:

- **`LLM_PROVIDER=local`** → Uses Ollama on your machine (free, fast with GPU)
- **`LLM_PROVIDER=openai`** → Uses OpenAI API (paid, but reliable for production)

## Architecture

```
User Message
    ↓
API Service (Node.js)
    ↓
KB Service (Python)
    ↓
┌─────────────────┬─────────────────┐
│  RAG Pipeline   │   LLM Provider   │
├─────────────────┼─────────────────┤
│ 1. Search KB    │  Local (Ollama)  │
│ 2. Get context  │  OR              │
│ 3. Generate     │  OpenAI API      │
└─────────────────┴─────────────────┘
    ↓
Response with sources
```

## Quick Start

### Local Development (Recommended)

1. **Install Ollama:**
   ```bash
   # macOS
   brew install ollama
   
   # Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **Start Ollama:**
   ```bash
   ollama serve
   ```

3. **Pull a model:**
   ```bash
   ollama pull llama3  # or mistral, phi3
   ```

4. **Configure `services/kb/.env`:**
   ```env
   LLM_PROVIDER=local
   OLLAMA_BASE_URL=http://localhost:11434/v1
   OLLAMA_MODEL=llama3
   PINECONE_API_KEY=your-key
   ```

5. **Start services:**
   ```bash
   # Terminal 1: KB Service
   cd services/kb
   source venv/bin/activate
   uvicorn main:app --reload
   
   # Terminal 2: API Service
   cd apps/api
   npm run dev
   ```

### Production Deployment

1. **Configure `services/kb/.env`:**
   ```env
   LLM_PROVIDER=openai
   OPENAI_API_KEY=sk-your-key
   OPENAI_MODEL=gpt-3.5-turbo
   PINECONE_API_KEY=your-key
   ```

2. **Deploy** - The system automatically uses OpenAI!

## API Endpoints

### Chat with RAG

```bash
POST /api/knowledge-base/chat

{
  "query": "What is your return policy?",
  "assistant_id": "assistant-123",
  "conversation_history": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi! How can I help?"}
  ],
  "system_prompt": "You are a helpful support agent."  # Optional
}
```

**Response:**
```json
{
  "response": "Our return policy allows returns within 30 days...",
  "sources": [
    {"source": "return-policy.pdf", "score": 0.95}
  ]
}
```

## Environment Variables

### KB Service (`services/kb/.env`)

**Local Mode:**
```env
LLM_PROVIDER=local
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3
```

**OpenAI Mode:**
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-xxx...
OPENAI_MODEL=gpt-3.5-turbo
```

**Common (Both modes):**
```env
PINECONE_API_KEY=xxx
PINECONE_ENVIRONMENT=us-east-1
PORT=8000
```

### API Service (`apps/api/.env`)

```env
KB_SERVICE_URL=http://localhost:8000  # Local
# or
KB_SERVICE_URL=https://kb.resonance.ai  # Production
```

## Benefits

### Local LLM (Development)
- ✅ **Free**: $0 cost
- ✅ **Fast**: GPU acceleration
- ✅ **Private**: Data stays on your machine
- ✅ **Offline**: Works without internet
- ✅ **No API keys**: Simpler setup

### OpenAI (Production)
- ✅ **Reliable**: Enterprise-grade uptime
- ✅ **Scalable**: Handles high load
- ✅ **Quality**: Best-in-class models
- ✅ **Managed**: No infrastructure to maintain

## Switching Between Modes

Just change `LLM_PROVIDER` in `.env` and restart the service:

```bash
# Switch to local
echo "LLM_PROVIDER=local" >> services/kb/.env

# Switch to OpenAI
echo "LLM_PROVIDER=openai" >> services/kb/.env

# Restart service
cd services/kb
uvicorn main:app --reload
```

No code changes needed! 🎉

## Troubleshooting

### Local LLM not responding

1. **Check Ollama is running:**
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. **Check model is pulled:**
   ```bash
   ollama list
   ```

3. **Test model directly:**
   ```bash
   ollama run llama3 "test"
   ```

### OpenAI errors

1. **Check API key is set:**
   ```bash
   echo $OPENAI_API_KEY
   ```

2. **Check usage limits** in OpenAI dashboard

3. **Verify model name** is correct (`gpt-3.5-turbo`, `gpt-4`, etc.)

## Model Recommendations

### Local (Ollama)

| Model | Size | GPU | Speed | Quality |
|-------|------|-----|-------|---------|
| `phi3` | 3.8GB | 4GB+ | ⚡⚡⚡ | ⭐⭐⭐ |
| `mistral` | 4.1GB | 6GB+ | ⚡⚡ | ⭐⭐⭐⭐ |
| `llama3` | 4.7GB | 8GB+ | ⚡⚡ | ⭐⭐⭐⭐ |
| `llama3:8b` | 8GB | 16GB+ | ⚡ | ⭐⭐⭐⭐⭐ |

### OpenAI

| Model | Cost/Request | Quality | Use Case |
|-------|--------------|---------|----------|
| `gpt-3.5-turbo` | ~$0.002 | ⭐⭐⭐⭐ | 90% of queries |
| `gpt-4-turbo` | ~$0.03 | ⭐⭐⭐⭐⭐ | Complex queries |

## Next Steps

1. **Set up Ollama** (see `docs/local-llm-setup.md`)
2. **Configure `.env`** files
3. **Test locally** with Ollama
4. **Deploy** with OpenAI when ready

The system handles everything automatically! 🚀
