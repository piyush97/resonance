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

3. Create `.env`:
```
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=us-east-1
PORT=8000
```

4. Run dev server:
```bash
uvicorn main:app --reload --port 8000
```

## API Endpoints

- `POST /api/knowledge-base/upload` - Upload and process document
- `POST /api/knowledge-base/search` - Search knowledge base

## RAG Pipeline

1. **Ingestion**: PDF → Text extraction → Chunking → Embeddings → Pinecone
2. **Retrieval**: Query → Embedding → Vector search → Top-k chunks
