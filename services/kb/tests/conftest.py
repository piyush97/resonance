"""Pytest configuration and fixtures."""
import pytest
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set test environment variables
os.environ.setdefault("EMBEDDING_PROVIDER", "openai")
os.environ.setdefault("LLM_PROVIDER", "ollama")
os.environ.setdefault("PINECONE_INDEX_NAME", "test-index")


@pytest.fixture
def sample_document():
    """Sample document for testing."""
    return {
        "content": b"This is a sample document for testing the ingestion pipeline.",
        "filename": "sample.txt",
        "content_type": "text/plain",
        "assistant_id": "test-assistant",
    }


@pytest.fixture
def sample_query():
    """Sample query for testing search."""
    return {
        "query": "What is the sample document about?",
        "assistant_id": "test-assistant",
        "top_k": 5,
    }


@pytest.fixture
def mock_pinecone_match():
    """Mock Pinecone match result."""
    from unittest.mock import MagicMock
    
    match = MagicMock()
    match.id = "chunk-1"
    match.score = 0.95
    match.metadata = {
        "text": "Sample chunk content",
        "filename": "sample.txt",
        "document_id": "doc-123",
        "chunk_index": 0,
        "assistant_id": "test-assistant",
    }
    return match


@pytest.fixture
def mock_embedding():
    """Mock embedding vector."""
    return [0.1] * 1536  # OpenAI text-embedding-3-small dimension
