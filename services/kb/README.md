# Resonance Knowledge Base Service

Python FastAPI service for document ingestion and RAG retrieval.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` (copy from `.env.example`):
```
# LLM Configuration
LLM_PROVIDER=local  # or "openai" for production
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3

# Pinecone (for embeddings)
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=us-east-1

# OpenAI (only if LLM_PROVIDER=openai)
OPENAI_API_KEY=your_openai_key

PORT=8000
```

See `docs/local-llm-setup.md` for detailed setup instructions.

4. Run dev server:
```bash
uvicorn main:app --reload --port 8000
```

## API Endpoints

- `POST /api/knowledge-base/upload` - Upload and process document
- `POST /api/knowledge-base/search` - Search knowledge base (returns relevant chunks)
- `POST /api/knowledge-base/chat` - Generate RAG-based chat response (uses local or OpenAI LLM)

## RAG Pipeline

1. **Ingestion**: PDF → Text extraction → Chunking → Embeddings (via Pinecone) → Pinecone storage
2. **Retrieval**: Query → Embedding → Vector search → Top-k chunks
3. **Generation**: Context + Query → LLM (local Ollama or OpenAI) → Response

## LLM Configuration

The service supports both local LLMs (via Ollama) and OpenAI:

- **Local (Development)**: Set `LLM_PROVIDER=local` and ensure Ollama is running
- **OpenAI (Production)**: Set `LLM_PROVIDER=openai` and provide `OPENAI_API_KEY`

See `docs/local-llm-setup.md` for complete setup guide.
