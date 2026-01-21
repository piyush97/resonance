# Local LLM Setup Guide

Resonance supports both local LLMs (via Ollama) and OpenAI API. This guide shows you how to set up local LLMs for development.

## Why Local LLM?

- **Cost**: $0 (vs ~$0.002 per request with OpenAI)
- **Privacy**: All data stays on your machine
- **Speed**: Fast with a powerful GPU
- **Offline**: Works without internet

## Setup Ollama

### 1. Install Ollama

**macOS:**
```bash
# Download from ollama.ai or:
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download installer from [ollama.ai](https://ollama.ai)

### 2. Start Ollama

```bash
ollama serve
```

This starts the Ollama server on `http://localhost:11434`

### 3. Pull a Model

Choose based on your GPU:

**For 8GB+ GPU (Recommended):**
```bash
ollama pull llama3        # 4.7GB - Best balance
ollama pull mistral       # 4.1GB - Fast and good
ollama pull phi3          # 3.8GB - Very fast
```

**For 16GB+ GPU:**
```bash
ollama pull llama3:8b     # 8GB - Better quality
ollama pull mistral:7b    # 7GB - Excellent quality
```

**For CPU only (slower):**
```bash
ollama pull phi3          # Smallest, works on CPU
```

### 4. Test Ollama

```bash
ollama run llama3 "Hello, how are you?"
```

If this works, Ollama is ready!

## Configure Resonance

### 1. Update `services/kb/.env`

```env
# Use local LLM
LLM_PROVIDER=local

# Ollama settings
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3

# Pinecone (still needed for embeddings)
PINECONE_API_KEY=your-key-here
PINECONE_ENVIRONMENT=us-east-1
```

### 2. Start KB Service

```bash
cd services/kb
source venv/bin/activate
uvicorn main:app --reload
```

### 3. Test It

```bash
curl -X POST http://localhost:8000/api/knowledge-base/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is Resonance?",
    "assistant_id": "test"
  }'
```

You should get a response from your local LLM!

## Switching to OpenAI (For Deployment)

When deploying to production, update `services/kb/.env`:

```env
# Use OpenAI
LLM_PROVIDER=openai

# OpenAI settings
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-3.5-turbo

# Keep Pinecone
PINECONE_API_KEY=your-key-here
PINECONE_ENVIRONMENT=us-east-1
```

The code automatically switches based on `LLM_PROVIDER`!

## Model Recommendations

### For Development (Local)

| Model | Size | Speed | Quality | GPU Required |
|-------|------|-------|---------|--------------|
| `phi3` | 3.8GB | ⚡⚡⚡ | ⭐⭐⭐ | 4GB+ |
| `mistral` | 4.1GB | ⚡⚡ | ⭐⭐⭐⭐ | 6GB+ |
| `llama3` | 4.7GB | ⚡⚡ | ⭐⭐⭐⭐ | 8GB+ |
| `llama3:8b` | 8GB | ⚡ | ⭐⭐⭐⭐⭐ | 16GB+ |

### For Production (OpenAI)

- **Cost-effective**: `gpt-3.5-turbo` (~$0.002 per request)
- **Best quality**: `gpt-4-turbo` (~$0.03 per request)
- **Recommended**: Use `gpt-3.5-turbo` for 90%, `gpt-4-turbo` for complex queries

## Troubleshooting

### "Connection refused" error

**Problem**: Ollama server not running

**Solution**:
```bash
ollama serve
```

### "Model not found" error

**Problem**: Model not pulled

**Solution**:
```bash
ollama pull llama3  # or your chosen model
```

### Slow responses

**Problem**: Model too large for your GPU, or using CPU

**Solutions**:
1. Use smaller model: `ollama pull phi3`
2. Check GPU usage: `nvidia-smi` (if NVIDIA GPU)
3. Use CPU-optimized model

### Out of memory

**Problem**: Model too large for available RAM/VRAM

**Solution**: Use smaller model or reduce batch size

## Performance Tips

1. **Use GPU**: Ollama automatically uses GPU if available
2. **Choose right model**: Balance quality vs speed for your hardware
3. **Keep Ollama running**: Don't restart between requests
4. **Monitor resources**: Watch GPU/RAM usage

## Environment Variables Summary

**Local Development:**
```env
LLM_PROVIDER=local
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3
```

**Production (OpenAI):**
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-xxx...
OPENAI_MODEL=gpt-3.5-turbo
```

The system automatically detects and uses the right provider! 🚀
