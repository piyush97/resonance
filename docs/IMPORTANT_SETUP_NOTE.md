# IMPORTANT: OpenAI API Key Required for Embeddings

## Current Situation

Your Pinecone index (`assistant-default`) is configured as a standard vector index (1536 dimensions), not an integrated embeddings index. This means:

- **Embeddings**: Need OpenAI API key (for text-embedding-3-small)
- **Chat/LLM**: Can use local Ollama (free, uses your GPU)

## Why We Need OpenAI for Embeddings

Pinecone's integrated embeddings feature only works with specific Pinecone-hosted models (like `multilingual-e5-large`). Since you created an index with OpenAI's `text-embedding-3-small` dimensions (1536), we need to:

1. Generate embeddings using OpenAI's API
2. Store the vectors in Pinecone

## Cost Impact

**Embeddings cost (OpenAI):**
- Model: `text-embedding-3-small`
- Cost: ~$0.00002 per 1,000 tokens
- Example: 100 documents (500 words each) = ~$0.20

**This is very cheap!** Even with 10,000 documents, it's only ~$20.

## Setup Options

### Option 1: Get OpenAI API Key (Recommended for MVP)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up / Log in
3. Go to API Keys → Create new secret key
4. Add to `services/kb/.env`:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   ```
5. Set usage limit: $10-20/month (prevents surprise bills)

**Benefits:**
- Works immediately
- Very low cost (~$0.20 for 100 documents)
- Production-ready embeddings
- Keep using local Ollama for chat (free)

### Option 2: Use Pinecone's Free Embedding Models

Recreate your Pinecone index with a Pinecone-hosted model:

1. Delete current index: `assistant-default`
2. Create new index with:
   - Model: `multilingual-e5-large` (Pinecone hosted)
   - Dimensions: 1024 (not 1536)
   - This is completely free!
3. Update code to use Pinecone inference API

**Trade-offs:**
- Free embeddings
- Slightly lower quality than OpenAI
- Need to update dimension in code (1024 instead of 1536)

## Recommendation

**For Week 1 (Validation Phase):**
- Get OpenAI API key ($10-20 budget)
- Use OpenAI for embeddings (very cheap)
- Use local Ollama for chat (free)
- **Total cost: ~$10-20 for entire validation phase**

**For Production:**
- Keep using OpenAI for embeddings (~$50-100/month at scale)
- Switch to OpenAI for chat when deploying
- Or optimize later with Pinecone's free models

## Current Configuration

Your `.env` should have:

```env
# LLM (for chat) - Local is free!
LLM_PROVIDER=local
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.2:latest

# Embeddings - Need OpenAI key
OPENAI_API_KEY=sk-your-key-here

# Pinecone - You already have this
PINECONE_API_KEY=pcsk_your_pinecone_api_key_here
PINECONE_ENVIRONMENT=us-east-1

PORT=8000
```

## What This Means

- **Embeddings**: $10-20/month (OpenAI) - REQUIRED
- **Chat**: $0/month (local Ollama) - FREE
- **Total Week 1 cost**: ~$10-20

This is still within your tight budget (<$2K/month)!

## Next Steps

1. Get OpenAI API key (5 minutes)
2. Add to `.env` file
3. Restart KB service
4. Run tests - everything will work!

The validation phase will cost you less than a pizza. 🍕
