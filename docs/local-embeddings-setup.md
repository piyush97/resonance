# Local Embeddings Setup - 100% Free AI Stack

## Overview

You can now run **completely free** with no API costs:
- **Embeddings**: sentence-transformers (local, uses your GPU)
- **LLM**: Ollama (local, uses your GPU)
- **Total cost**: $0/month

## Configuration

### Option 1: 100% Local (Free)

**`services/kb/.env`:**
```env
# Embeddings: Local (FREE)
EMBEDDING_PROVIDER=local
LOCAL_EMBEDDING_MODEL=all-MiniLM-L6-v2

# LLM: Local (FREE)
LLM_PROVIDER=local
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.2:latest

# Pinecone (vector storage only)
PINECONE_API_KEY=your-pinecone-key-here
PINECONE_ENVIRONMENT=us-east-1

PORT=8000
ENVIRONMENT=development
```

### Option 2: Hybrid (Cheap)

Use OpenAI for embeddings (~$1/week) and local Ollama for chat (free):

```env
# Embeddings: OpenAI (CHEAP - ~$1/week)
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here

# LLM: Local (FREE)
LLM_PROVIDER=local
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.2:latest

# Pinecone
PINECONE_API_KEY=your-pinecone-key-here
PINECONE_ENVIRONMENT=us-east-1

PORT=8000
```

## Local Embedding Models

### Recommended: all-MiniLM-L6-v2
- **Dimensions**: 384
- **Speed**: Very fast
- **Quality**: Good for most use cases
- **Size**: ~90MB
- **Best for**: Development, testing, production with good quality

### Alternative: all-mpnet-base-v2
- **Dimensions**: 768
- **Speed**: Slower
- **Quality**: Better
- **Size**: ~420MB
- **Best for**: When you need higher quality

## Important: Pinecone Index Dimensions

**If using local embeddings**, you need to create a Pinecone index with the correct dimensions:

### For all-MiniLM-L6-v2 (384 dims):
```python
from pinecone import Pinecone, ServerlessSpec, CloudProvider, AwsRegion, Metric

pc = Pinecone(api_key="your-key")
pc.create_index(
    name="assistant-default",
    dimension=384,  # Match local model
    metric=Metric.COSINE,
    spec=ServerlessSpec(
        cloud=CloudProvider.AWS,
        region=AwsRegion.US_EAST_1
    )
)
```

### For OpenAI embeddings (1536 dims):
```python
pc.create_index(
    name="assistant-default",
    dimension=1536,  # OpenAI text-embedding-3-small
    metric=Metric.COSINE,
    spec=ServerlessSpec(
        cloud=CloudProvider.AWS,
        region=AwsRegion.US_EAST_1
    )
)
```

**Note**: You currently have an index with 1536 dimensions. If you want to use local embeddings, you need to either:
1. Delete the current index and create a new one with 384 dimensions
2. Use OpenAI embeddings (EMBEDDING_PROVIDER=openai)

## Testing Local Embeddings

### 1. Test sentence-transformers directly:

```python
from sentence_transformers import SentenceTransformer

# Load model (downloads on first use)
model = SentenceTransformer('all-MiniLM-L6-v2')

# Generate embeddings
texts = ["Hello world", "AI is awesome"]
embeddings = model.encode(texts)

print(f"Shape: {embeddings.shape}")  # (2, 384)
print(f"First embedding: {embeddings[0][:5]}")
```

### 2. Test the full pipeline:

```bash
cd services/kb
source venv/bin/activate

# Set to use local embeddings
export EMBEDDING_PROVIDER=local

# Start service
python main.py
```

### 3. Upload a test document:

```bash
curl -X POST http://localhost:8000/api/knowledge-base/upload \
  -F "file=@test.pdf" \
  -F "assistant_id=test"
```

## Performance Comparison

| Aspect | Local (all-MiniLM-L6-v2) | OpenAI (text-embedding-3-small) |
|--------|--------------------------|----------------------------------|
| **Cost** | $0 | ~$0.00002 per 1K tokens (~$1/week) |
| **Speed** | Very fast (GPU) | Fast (API call) |
| **Quality** | Good | Excellent |
| **Dimensions** | 384 | 1536 |
| **Privacy** | 100% local | Sent to OpenAI |
| **Offline** | ✅ Works offline | ❌ Needs internet |

## GPU Acceleration

sentence-transformers automatically uses your GPU if available:

```python
import torch
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None'}")
```

Your system should use GPU automatically for faster embeddings.

## Cost Breakdown

### 100% Local Setup:
- **Embeddings**: $0 (sentence-transformers)
- **LLM**: $0 (Ollama)
- **Vector DB**: $0 (Pinecone free tier)
- **Total**: $0/month

### Hybrid Setup:
- **Embeddings**: ~$1-5/month (OpenAI)
- **LLM**: $0 (Ollama)
- **Vector DB**: $0 (Pinecone free tier)
- **Total**: ~$1-5/month

## Troubleshooting

### Model download fails:
```bash
# Manually download model
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
```

### Dimension mismatch error:
- Check your Pinecone index dimension
- Ensure it matches your embedding model (384 for local, 1536 for OpenAI)

### Slow embeddings:
- Check if GPU is being used: `torch.cuda.is_available()`
- Try a smaller model if needed

## Next Steps

1. Choose your setup (100% local or hybrid)
2. Update `.env` file
3. If using local: Create new Pinecone index with 384 dimensions
4. Restart KB service
5. Test with a document upload

---

**Recommendation for Week 1**: Use 100% local setup. It's free, fast, and good enough for validation. Switch to hybrid later if you need better quality.
