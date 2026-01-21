# Pinecone + OpenAI Embeddings Pattern

## How It Works (Following OpenAI Cookbook)

Our implementation follows the exact pattern from the [OpenAI Cookbook](https://cookbook.openai.com/examples/vector_databases/pinecone/using_pinecone_for_embeddings_search):

### 1. Generate Embeddings with OpenAI

```python
# For documents (ingestion)
embeddings_response = openai.embeddings.create(
    model="text-embedding-3-small",
    input=chunk_texts  # List of text chunks
)

# For queries (retrieval)
query_embedding = openai.embeddings.create(
    model="text-embedding-3-small",
    input=query  # Single query string
)
```

### 2. Store Vectors in Pinecone

```python
# Format: tuples of (id, embedding_vector, metadata)
vectors = [
    (record_id, embedding_data.embedding, metadata_dict),
    ...
]

index.upsert(vectors=vectors)
```

### 3. Search Pinecone with Embeddings

```python
results = index.query(
    vector=query_vector,  # Embedding from OpenAI
    top_k=5,
    include_metadata=True,
    filter={"assistant_id": assistant_id}
)
```

## Why This Pattern?

**OpenAI generates embeddings** → **Pinecone stores and searches them**

- **OpenAI**: Best-in-class embedding quality (`text-embedding-3-small`)
- **Pinecone**: Fast, scalable vector search
- **Cost**: Very cheap (~$0.00002 per 1K tokens)

## Our Implementation

### Ingestion (`services/kb/services/ingestion.py`)

```python
# Step 1: Extract text from PDF
text = extract_text_from_pdf(content)

# Step 2: Chunk text
chunks = chunk_text(text, chunk_size=512, overlap=0.2)

# Step 3: Generate embeddings (OpenAI)
embeddings_response = openai.embeddings.create(
    model="text-embedding-3-small",
    input=[chunk["text"] for chunk in chunks]
)

# Step 4: Store in Pinecone
vectors = [
    (id, embedding_data.embedding, metadata)
    for chunk, embedding_data in zip(chunks, embeddings_response.data)
]
index.upsert(vectors=vectors)
```

### Retrieval (`services/kb/services/retrieval.py`)

```python
# Step 1: Generate query embedding (OpenAI)
query_embedding = openai.embeddings.create(
    model="text-embedding-3-small",
    input=query
)

# Step 2: Search Pinecone
results = index.query(
    vector=query_embedding.data[0].embedding,
    top_k=5,
    include_metadata=True
)
```

## Cost Breakdown

**Embeddings (OpenAI):**
- Model: `text-embedding-3-small`
- Cost: $0.00002 per 1,000 tokens
- Example: 100 documents (500 words each) = ~$0.20

**Storage (Pinecone):**
- Free tier: 100K vectors
- Perfect for MVP

**Total Week 1 cost: ~$1-5**

## Key Points

1. **OpenAI generates embeddings** (not Pinecone)
2. **Pinecone stores and searches** the vectors
3. **This is the standard pattern** (as shown in OpenAI cookbook)
4. **Very cost-effective** for validation phase

## References

- [OpenAI Cookbook: Using Pinecone for Embeddings Search](https://cookbook.openai.com/examples/vector_databases/pinecone/using_pinecone_for_embeddings_search)
- Our implementation matches this pattern exactly
