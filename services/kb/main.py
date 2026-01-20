"""
Knowledge Base Service - RAG Pipeline
Handles document ingestion, embedding, and retrieval
"""
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import uvicorn

from .services.ingestion import ingest_document
from .services.retrieval import search_knowledge_base

load_dotenv()

app = FastAPI(title="Resonance KB Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SearchRequest(BaseModel):
    query: str
    assistant_id: str
    top_k: int = 5


@app.get("/health")
async def health():
    return {"status": "ok", "service": "knowledge-base"}


@app.post("/api/knowledge-base/upload")
async def upload_document(
    file: UploadFile = File(...),
    assistant_id: str = None,
):
    """
    Upload and process a document (PDF, text, etc.)
    Returns document ID and status
    """
    try:
        # Read file content
        content = await file.read()
        
        # Process document
        result = await ingest_document(
            content=content,
            filename=file.filename,
            assistant_id=assistant_id or "default",
            content_type=file.content_type,
        )
        
        return {
            "document_id": result["document_id"],
            "status": "processed",
            "chunks": result["chunks"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/knowledge-base/search")
async def search_documents(request: SearchRequest):
    """
    Search knowledge base using semantic search
    Returns relevant document chunks with scores
    """
    try:
        results = await search_knowledge_base(
            query=request.query,
            assistant_id=request.assistant_id,
            top_k=request.top_k,
        )
        
        return {
            "query": request.query,
            "results": results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=True,
    )
