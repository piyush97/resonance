"""
Retrieval pipeline for RAG:
1. Generate query embedding
2. Search Pinecone vector database
3. Return top-k relevant chunks with metadata
"""
import os
from typing import List, Dict
from openai import OpenAI
from pinecone import Pinecone

# Initialize clients
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
pinecone_client = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))


async def search_knowledge_base(
    query: str,
    assistant_id: str,
    top_k: int = 5,
) -> List[Dict]:
    """
    Search knowledge base using semantic similarity
    Returns list of relevant document chunks with scores
    """
    # Step 1: Generate query embedding
    query_embedding = await generate_query_embedding(query)
    
    # Step 2: Search Pinecone
    index_name = f"assistant-{assistant_id}"
    index = pinecone_client.Index(index_name)
    
    results = index.query(
        vector=query_embedding,
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


async def generate_query_embedding(query: str) -> List[float]:
    """Generate embedding for search query"""
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=query,
    )
    
    return response.data[0].embedding
