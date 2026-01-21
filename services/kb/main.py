"""
Knowledge Base Service - RAG Pipeline
Handles document ingestion, embedding, and retrieval
"""
import os
import logging
import re
import secrets
from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import uvicorn
from typing import List, Dict, Optional

from services.ingestion import ingest_document
from services.retrieval import search_knowledge_base
from services.llm import generate_rag_response

load_dotenv()

app = FastAPI(title="Resonance KB Service", version="0.1.0")

logger = logging.getLogger("resonance.kb")

KB_SERVICE_API_KEY = os.getenv("KB_SERVICE_API_KEY", "")
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", "10485760"))  # 10 MiB default

def _parse_allowed_origins() -> List[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "")
    origins = [o.strip() for o in raw.split(",") if o.strip()]
    # This service is intended to be called server-to-server; keep the default narrow.
    return origins or ["http://localhost:3000"]

def require_kb_auth(authorization: Optional[str] = Header(default=None)) -> None:
    """
    SECURITY: KB endpoints are powerful (upload/search/chat) and must not be publicly callable.
    Require a shared secret token from the API service.
    """
    if not KB_SERVICE_API_KEY:
        logger.error("KB_SERVICE_API_KEY is not set; refusing KB endpoints")
        raise HTTPException(status_code=500, detail="Server misconfigured")

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    token = authorization.split(" ", 1)[1].strip()
    if not token or not secrets.compare_digest(token, KB_SERVICE_API_KEY):
        raise HTTPException(status_code=401, detail="Unauthorized")

def normalize_assistant_id(value: Optional[str]) -> str:
    assistant_id = value or "default"
    # Keep namespaces predictable and prevent abuse (very long / weird values).
    if not re.fullmatch(r"[A-Za-z0-9_-]{1,64}", assistant_id):
        raise HTTPException(status_code=400, detail="Invalid assistant_id")
    return assistant_id

app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=4000)
    assistant_id: str = Field(..., min_length=1, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")
    top_k: int = Field(5, ge=1, le=20)


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=4000)
    assistant_id: str = Field(..., min_length=1, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")
    conversation_history: Optional[List[Dict[str, str]]] = Field(default=None, max_length=50)
    system_prompt: Optional[str] = Field(default=None, max_length=4000)


@app.get("/")
async def root():
    return {"message": "Welcome to Resonance KB Service", "version": "0.1.0"}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "Resonance KB Service", "version": "0.1.0"}


@app.post("/api/knowledge-base/upload", dependencies=[Depends(require_kb_auth)])
async def upload_document(
    file: UploadFile = File(...),
    assistant_id: str = None,
):
    """
    Upload and process a document (PDF, text, etc.)
    Returns document ID and status
    """
    try:
        resolved_assistant_id = normalize_assistant_id(assistant_id)

        if file.content_type not in ("application/pdf", "text/plain"):
            raise HTTPException(status_code=415, detail="Unsupported content type")

        # Read file content with a hard cap to reduce DoS risk
        content = await file.read(MAX_UPLOAD_BYTES + 1)
        if len(content) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="File too large")
        
        # Process document
        result = await ingest_document(
            content=content,
            filename=file.filename,
            assistant_id=resolved_assistant_id,
            content_type=file.content_type,
        )
        
        return {
            "document_id": result["document_id"],
            "status": "processed",
            "chunks": result["chunks"],
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Upload failed")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/knowledge-base/search", dependencies=[Depends(require_kb_auth)])
async def search_documents(request: SearchRequest):
    """
    Search knowledge base using semantic search
    Returns relevant document chunks with scores
    """
    try:
        resolved_assistant_id = normalize_assistant_id(request.assistant_id)
        results = await search_knowledge_base(
            query=request.query,
            assistant_id=resolved_assistant_id,
            top_k=request.top_k,
        )
        
        return {
            "query": request.query,
            "results": results,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Search failed")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/knowledge-base/chat", dependencies=[Depends(require_kb_auth)])
async def chat_with_rag(request: ChatRequest):
    """
    Generate RAG-based chat response
    1. Search knowledge base for relevant context
    2. Generate response using LLM (local or OpenAI)
    """
    try:
        resolved_assistant_id = normalize_assistant_id(request.assistant_id)
        # Cap history size defensively (even if client submits more).
        history = (request.conversation_history or [])[:20]
        # Step 1: Search knowledge base
        context_chunks = await search_knowledge_base(
            query=request.query,
            assistant_id=resolved_assistant_id,
            top_k=5,
        )
        
        # Step 2: Generate response with context
        response = await generate_rag_response(
            user_query=request.query,
            context_chunks=context_chunks,
            conversation_history=history,
            system_prompt=request.system_prompt,
        )
        
        return {
            "response": response,
            "sources": [
                {
                    "source": chunk.get("source", "unknown"),
                    "score": chunk.get("score", 0),
                }
                for chunk in context_chunks
            ],
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Chat failed")
        raise HTTPException(status_code=500, detail="Internal server error")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=True,
    )
