"""
Document ingestion pipeline:
1. Extract text from PDF/document
2. Chunk text into smaller pieces
3. Generate embeddings
4. Store in Pinecone vector database
"""
import os
from typing import Dict, List
import PyPDF2
from io import BytesIO
from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec
import hashlib
import uuid

# Initialize clients
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
pinecone_client = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))


async def ingest_document(
    content: bytes,
    filename: str,
    assistant_id: str,
    content_type: str = "application/pdf",
) -> Dict:
    """
    Process a document: extract, chunk, embed, store
    """
    # Step 1: Extract text
    text = extract_text(content, content_type)
    
    # Step 2: Chunk text (512 tokens per chunk, 20% overlap)
    chunks = chunk_text(text, chunk_size=512, overlap=0.2)
    
    # Step 3: Generate embeddings
    embeddings = await generate_embeddings([chunk["text"] for chunk in chunks])
    
    # Step 4: Store in Pinecone
    document_id = str(uuid.uuid4())
    index_name = f"assistant-{assistant_id}"
    
    # Ensure index exists
    ensure_index_exists(index_name)
    
    # Prepare vectors for upsert
    vectors = []
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        vector_id = f"{document_id}-chunk-{i}"
        vectors.append({
            "id": vector_id,
            "values": embedding,
            "metadata": {
                "document_id": document_id,
                "filename": filename,
                "chunk_index": i,
                "text": chunk["text"],
                "assistant_id": assistant_id,
            },
        })
    
    # Upsert to Pinecone
    index = pinecone_client.Index(index_name)
    index.upsert(vectors=vectors)
    
    return {
        "document_id": document_id,
        "chunks": len(chunks),
        "status": "processed",
    }


def extract_text(content: bytes, content_type: str) -> str:
    """Extract text from document based on content type"""
    if content_type == "application/pdf":
        return extract_text_from_pdf(content)
    elif content_type.startswith("text/"):
        return content.decode("utf-8")
    else:
        raise ValueError(f"Unsupported content type: {content_type}")


def extract_text_from_pdf(content: bytes) -> str:
    """Extract text from PDF file"""
    pdf_file = BytesIO(content)
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    
    return text


def chunk_text(text: str, chunk_size: int = 512, overlap: float = 0.2) -> List[Dict]:
    """
    Split text into chunks with overlap
    chunk_size: approximate tokens per chunk
    overlap: percentage of overlap between chunks
    """
    # Simple token approximation: ~4 chars per token
    chars_per_chunk = chunk_size * 4
    overlap_chars = int(chars_per_chunk * overlap)
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chars_per_chunk
        chunk_text = text[start:end]
        
        # Try to break at sentence boundary
        if end < len(text):
            last_period = chunk_text.rfind(".")
            last_newline = chunk_text.rfind("\n")
            break_point = max(last_period, last_newline)
            
            if break_point > chars_per_chunk * 0.5:  # Only break if reasonable
                chunk_text = chunk_text[:break_point + 1]
                end = start + break_point + 1
        
        chunks.append({
            "text": chunk_text.strip(),
            "start": start,
            "end": end,
        })
        
        start = end - overlap_chars
    
    return chunks


async def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate embeddings using OpenAI"""
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",  # Cheaper than large
        input=texts,
    )
    
    return [item.embedding for item in response.data]


def ensure_index_exists(index_name: str):
    """Create Pinecone index if it doesn't exist"""
    existing_indexes = [idx.name for idx in pinecone_client.list_indexes()]
    
    if index_name not in existing_indexes:
        pinecone_client.create_index(
            name=index_name,
            dimension=1536,  # text-embedding-3-small dimension
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1",
            ),
        )
