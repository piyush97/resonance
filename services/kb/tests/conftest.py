"""
Pytest configuration and fixtures for KB service tests
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app


@pytest_asyncio.fixture(scope="function")
async def client():
    """
    Async HTTP client for testing FastAPI endpoints
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def sample_document():
    """Sample document for testing"""
    return {
        "content": b"This is a test document about pricing. Our starter plan is $299/month.",
        "filename": "test_pricing.txt",
        "content_type": "text/plain",
    }


@pytest.fixture
def sample_chunks():
    """Sample document chunks for testing"""
    return [
        {
            "text": "Pricing starts at $299/month for the Starter plan.",
            "start": 0,
            "end": 50,
        },
        {
            "text": "Pro plan is $999/month with advanced features.",
            "start": 51,
            "end": 95,
        },
        {
            "text": "Enterprise plans have custom pricing.",
            "start": 96,
            "end": 135,
        },
    ]


@pytest.fixture
def sample_search_results():
    """Sample search results for testing"""
    return [
        {
            "content": "Pricing starts at $299/month",
            "source": "pricing.pdf",
            "score": 0.92,
            "document_id": "doc_123",
            "chunk_index": 0,
        },
        {
            "content": "Enterprise plans available",
            "source": "enterprise.pdf",
            "score": 0.85,
            "document_id": "doc_456",
            "chunk_index": 2,
        },
    ]


@pytest.fixture
def sample_conversation_history():
    """Sample conversation history for testing"""
    return [
        {"role": "user", "content": "What is Resonance?"},
        {"role": "assistant", "content": "Resonance is an AI customer service chatbot platform."},
        {"role": "user", "content": "How much does it cost?"},
        {"role": "assistant", "content": "Pricing starts at $299/month for the Starter plan."},
    ]


@pytest.fixture
def mock_pinecone_response():
    """Mock Pinecone query response"""
    class MockMatch:
        def __init__(self, id, score, metadata):
            self.id = id
            self.score = score
            self.metadata = metadata

    class MockResponse:
        def __init__(self):
            self.matches = [
                MockMatch(
                    id="doc_123-chunk-0",
                    score=0.92,
                    metadata={
                        "text": "Pricing information here",
                        "filename": "pricing.pdf",
                        "document_id": "doc_123",
                        "chunk_index": 0,
                        "assistant_id": "test-assistant",
                    }
                ),
                MockMatch(
                    id="doc_456-chunk-1",
                    score=0.85,
                    metadata={
                        "text": "More pricing details",
                        "filename": "pricing.pdf",
                        "document_id": "doc_456",
                        "chunk_index": 1,
                        "assistant_id": "test-assistant",
                    }
                ),
            ]

    return MockResponse()


@pytest.fixture
def mock_openai_embedding_response():
    """Mock OpenAI embedding response"""
    class MockEmbedding:
        def __init__(self):
            self.embedding = [0.1] * 1536  # OpenAI embedding dimension

    class MockResponse:
        def __init__(self):
            self.data = [MockEmbedding()]

    return MockResponse()


@pytest.fixture
def mock_llm_response():
    """Mock LLM chat completion response"""
    class MockMessage:
        def __init__(self):
            self.content = "This is a helpful AI response based on the context provided."

    class MockChoice:
        def __init__(self):
            self.message = MockMessage()

    class MockResponse:
        def __init__(self):
            self.choices = [MockChoice()]

    return MockResponse()
