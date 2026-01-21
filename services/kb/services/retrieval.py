"""
Retrieval pipeline for RAG:
1. Generate query embedding (Pinecone integrated, local, or OpenAI)
2. Search Pinecone vector database
3. Return top-k relevant chunks with metadata
"""
import os
from typing import List, Dict
from openai import OpenAI
from pinecone import Pinecone

# Configuration
EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "pinecone")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "sterling-willow")

# Lazy-load clients
_pinecone_client = None
_openai_client = None
_local_embedding_model = None

def get_pinecone_client():
    global _pinecone_client
    if _pinecone_client is None:
        api_key = os.getenv("PINECONE_API_KEY")
        if not api_key:
            raise ValueError("PINECONE_API_KEY environment variable is required")
        _pinecone_client = Pinecone(api_key=api_key)
    return _pinecone_client

def get_openai_client():
    global _openai_client
    if _openai_client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY is required for embeddings")
        _openai_client = OpenAI(api_key=api_key)
    return _openai_client


async def search_knowledge_base(
    query: str,
    assistant_id: str,
    top_k: int = 5,
) -> List[Dict]:
    """
    Search knowledge base using semantic similarity
    Returns list of relevant document chunks with scores
    """
    # Search Pinecone
    pc = get_pinecone_client()
    index_name = PINECONE_INDEX_NAME  # Use configured index name
    index = pc.Index(index_name)
    
    if EMBEDDING_PROVIDER == "pinecone":
        # Pinecone integrated embeddings - use search_records()
        from pinecone import SearchQuery
        response = index.search_records(
            namespace=assistant_id,  # Query within assistant's namespace
            query=SearchQuery(
                inputs={"text": query},  # Text query - Pinecone embeds it automatically
                top_k=top_k
            )
        )
        # Convert response format to match standard query results
        class Match:
            def __init__(self, hit):
                self.id = hit['_id']
                self.score = hit['_score']
                self.metadata = hit.get('fields', {})
        
        class Results:
            def __init__(self, hits):
                self.matches = [Match(hit) for hit in hits]
        
        results = Results(response.result['hits'])
    else:
        # Generate query embedding (local or OpenAI)
        if EMBEDDING_PROVIDER == "local":
            # Use local sentence-transformers model (free, fast)
            model = get_local_embedding_model()
            query_vector = model.encode(query, convert_to_numpy=True).tolist()
        else:
            # Use OpenAI API (following OpenAI cookbook pattern)
            # Reference: https://cookbook.openai.com/examples/vector_databases/pinecone/using_pinecone_for_embeddings_search
            openai = get_openai_client()
            embedding_response = openai.embeddings.create(
                model="text-embedding-3-small",
                input=query
            )
            query_vector = embedding_response.data[0].embedding
        
        # Query with pre-computed vector
        results = index.query(
            vector=query_vector,
            top_k=top_k,
            include_metadata=True,
            filter={
                "assistant_id": assistant_id,
            },
        )
    
    # Step 3: Format results
    formatted_results = []
    for match in results.matches:
        formatted_results.append({
            "content": match.metadata.get("text", ""),
            "source": match.metadata.get("filename", "unknown"),
            "score": match.score,
            "document_id": match.metadata.get("document_id"),
            "chunk_index": match.metadata.get("chunk_index"),
        })
    
    return formatted_results


# Note: Pinecone handles embedding generation automatically
# when using integrated OpenAI embeddings, so we don't need
# a separate generate_query_embedding function
