"""
Document ingestion pipeline:
1. Extract text from PDF/document
2. Chunk text into smaller pieces
3. Generate embeddings (local or OpenAI)
4. Store in Pinecone vector database
"""
import os
from typing import Dict, List
import PyPDF2
from io import BytesIO
from pinecone import Pinecone, ServerlessSpec, CloudProvider, AwsRegion, Metric, VectorType
import hashlib
import uuid

# Lazy-load clients
_pinecone_client = None
_openai_client = None
_local_embedding_model = None

# Configuration
EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "pinecone")  # "pinecone", "local", or "openai"
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "sterling-willow")
PINECONE_EMBEDDING_MODEL = os.getenv("PINECONE_EMBEDDING_MODEL", "llama-text-embed-v2")
LOCAL_EMBEDDING_MODEL = os.getenv("LOCAL_EMBEDDING_MODEL", "all-MiniLM-L6-v2")  # 384 dims

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
            raise ValueError("OPENAI_API_KEY is required when EMBEDDING_PROVIDER=openai")
        from openai import OpenAI
        _openai_client = OpenAI(api_key=api_key)
    return _openai_client

def get_local_embedding_model():
    """Lazy-load sentence-transformers model"""
    global _local_embedding_model
    if _local_embedding_model is None:
        from sentence_transformers import SentenceTransformer
        model_name = os.getenv("LOCAL_EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        _local_embedding_model = SentenceTransformer(model_name)
    return _local_embedding_model

def get_embedding_dimension():
    """Get embedding dimension based on provider"""
    if EMBEDDING_PROVIDER == "pinecone":
        # Pinecone integrated embeddings
        model_dims = {
            "llama-text-embed-v2": 384,
            "multilingual-e5-large": 1024,
        }
        return model_dims.get(PINECONE_EMBEDDING_MODEL, 384)
    elif EMBEDDING_PROVIDER == "local":
        model_name = os.getenv("LOCAL_EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        dimensions = {
            "all-MiniLM-L6-v2": 384,
            "all-mpnet-base-v2": 768,
            "all-MiniLM-L12-v2": 384,
        }
        return dimensions.get(model_name, 384)
    else:
        return 1536  # OpenAI text-embedding-3-small


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
    
    # Step 3: Prepare data based on embedding provider
    chunk_texts = [chunk["text"] for chunk in chunks]
    
    if EMBEDDING_PROVIDER == "pinecone":
        # Pinecone integrated embeddings - just prepare text, no embedding generation needed
        embedding_list = None  # Will use text directly
    elif EMBEDDING_PROVIDER == "local":
        # Use local sentence-transformers model (free, runs on your GPU/CPU)
        model = get_local_embedding_model()
        embeddings = model.encode(chunk_texts, convert_to_numpy=True, show_progress_bar=False)
        # Convert to list format compatible with OpenAI response structure
        embedding_list = [{"embedding": emb.tolist()} for emb in embeddings]
    else:
        # Use OpenAI API (following OpenAI cookbook pattern)
        # Reference: https://cookbook.openai.com/examples/vector_databases/pinecone/using_pinecone_for_embeddings_search
        openai = get_openai_client()
        embeddings_response = openai.embeddings.create(
            model="text-embedding-3-small",
            input=chunk_texts
        )
        embedding_list = embeddings_response.data
    
    # Step 4: Store in Pinecone
    pc = get_pinecone_client()
    document_id = str(uuid.uuid4())
    index_name = PINECONE_INDEX_NAME  # Use configured index name
    
    # Get index (no need to create, it already exists)
    index = pc.Index(index_name)
    
    if EMBEDDING_PROVIDER == "pinecone":
        # Pinecone integrated embeddings - use upsert_records()
        records = []
        for i, chunk in enumerate(chunks):
            record_id = f"{document_id}-chunk-{i}"
            records.append({
                "_id": record_id,
                "text": chunk["text"],  # Pinecone will embed this automatically
                "document_id": document_id,
                "filename": filename,
                "chunk_index": i,
                "assistant_id": assistant_id,
            })
        
        # Upsert with text (Pinecone handles embedding using llama-text-embed-v2)
        index.upsert_records(
            namespace=assistant_id,  # Use assistant_id as namespace
            records=records
        )
    else:
        # Standard approach: upsert pre-computed vectors
        vectors = []
        for i, (chunk, embedding_data) in enumerate(zip(chunks, embedding_list)):
            record_id = f"{document_id}-chunk-{i}"
            # Handle both dict format (OpenAI) and direct embedding (local)
            embedding_vector = embedding_data.get("embedding") if isinstance(embedding_data, dict) else embedding_data
            vectors.append((
                record_id,
                embedding_vector,  # Vector values (local or OpenAI)
                {
                    "document_id": document_id,
                    "filename": filename,
                    "chunk_index": i,
                    "text": chunk["text"],
                    "assistant_id": assistant_id,
                }
            ))
        
        # Upsert vectors
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


# Note: Embeddings are generated directly in ingest_document() using OpenAI API
# Following the pattern from OpenAI cookbook:
# https://cookbook.openai.com/examples/vector_databases/pinecone/using_pinecone_for_embeddings_search


def ensure_index_exists(index_name: str):
    """Create Pinecone index if it doesn't exist"""
    pc = get_pinecone_client()
    existing_indexes = [idx.name for idx in pc.list_indexes()]
    
    if index_name not in existing_indexes:
        dimension = get_embedding_dimension()
        pc.create_index(
            name=index_name,
            dimension=dimension,  # Dynamic based on embedding provider
            metric=Metric.COSINE,
            spec=ServerlessSpec(
                cloud=CloudProvider.AWS,
                region=AwsRegion.US_EAST_1,
            ),
            vector_type=VectorType.DENSE,
        )
