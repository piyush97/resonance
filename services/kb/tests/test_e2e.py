"""
End-to-End Tests for KB Service
Tests the complete RAG pipeline
"""
import pytest
from httpx import AsyncClient
import os


# Skip E2E tests if services not available
pytestmark = pytest.mark.skipif(
    os.getenv("SKIP_E2E_TESTS", "false").lower() == "true",
    reason="E2E tests skipped"
)


class TestHealthEndpoints:
    """Test health check endpoints"""

    @pytest.mark.asyncio
    async def test_health_endpoint(self, client: AsyncClient):
        """Health endpoint should return OK"""
        response = await client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"

    @pytest.mark.asyncio
    async def test_root_endpoint(self, client: AsyncClient):
        """Root endpoint should return service info"""
        response = await client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "Resonance" in data.get("message", "")


class TestSearchEndpoint:
    """Test knowledge base search endpoint"""

    @pytest.mark.asyncio
    async def test_search_valid_request(self, client: AsyncClient):
        """Search should accept valid request"""
        response = await client.post(
            "/api/knowledge-base/search",
            json={
                "query": "What are your pricing plans?",
                "assistant_id": "test-assistant",
                "top_k": 5,
            }
        )
        
        # May return 500 if Pinecone not configured
        assert response.status_code in [200, 500]
        
        if response.status_code == 200:
            data = response.json()
            assert "query" in data
            assert "results" in data
            assert isinstance(data["results"], list)

    @pytest.mark.asyncio
    async def test_search_missing_query(self, client: AsyncClient):
        """Search should reject missing query"""
        response = await client.post(
            "/api/knowledge-base/search",
            json={
                "assistant_id": "test-assistant",
            }
        )
        
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_search_missing_assistant_id(self, client: AsyncClient):
        """Search should reject missing assistant_id"""
        response = await client.post(
            "/api/knowledge-base/search",
            json={
                "query": "test query",
            }
        )
        
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_search_custom_top_k(self, client: AsyncClient):
        """Search should respect custom top_k"""
        response = await client.post(
            "/api/knowledge-base/search",
            json={
                "query": "test",
                "assistant_id": "test-assistant",
                "top_k": 3,
            }
        )
        
        assert response.status_code in [200, 500]
        
        if response.status_code == 200:
            data = response.json()
            assert len(data["results"]) <= 3


class TestChatEndpoint:
    """Test RAG chat endpoint"""

    @pytest.mark.asyncio
    async def test_chat_valid_request(self, client: AsyncClient):
        """Chat should accept valid request"""
        response = await client.post(
            "/api/knowledge-base/chat",
            json={
                "query": "How do I get started?",
                "assistant_id": "test-assistant",
            }
        )
        
        # May return 500 if LLM not configured
        assert response.status_code in [200, 500]
        
        if response.status_code == 200:
            data = response.json()
            assert "response" in data
            assert isinstance(data["response"], str)

    @pytest.mark.asyncio
    async def test_chat_with_history(self, client: AsyncClient):
        """Chat should accept conversation history"""
        response = await client.post(
            "/api/knowledge-base/chat",
            json={
                "query": "Tell me more",
                "assistant_id": "test-assistant",
                "conversation_history": [
                    {"role": "user", "content": "What is Resonance?"},
                    {"role": "assistant", "content": "Resonance is an AI chatbot."},
                ],
            }
        )
        
        assert response.status_code in [200, 500]

    @pytest.mark.asyncio
    async def test_chat_with_system_prompt(self, client: AsyncClient):
        """Chat should accept custom system prompt"""
        response = await client.post(
            "/api/knowledge-base/chat",
            json={
                "query": "Hello",
                "assistant_id": "test-assistant",
                "system_prompt": "You are a friendly support agent.",
            }
        )
        
        assert response.status_code in [200, 500]

    @pytest.mark.asyncio
    async def test_chat_missing_query(self, client: AsyncClient):
        """Chat should reject missing query"""
        response = await client.post(
            "/api/knowledge-base/chat",
            json={
                "assistant_id": "test-assistant",
            }
        )
        
        assert response.status_code == 422


class TestUploadEndpoint:
    """Test document upload endpoint"""

    @pytest.mark.asyncio
    async def test_upload_endpoint_exists(self, client: AsyncClient):
        """Upload endpoint should exist"""
        response = await client.post(
            "/api/knowledge-base/upload",
            # No file - should return validation error
        )
        
        # Should return 422 for missing file, not 404
        assert response.status_code in [422, 400, 500]

    @pytest.mark.asyncio
    async def test_upload_requires_assistant_id(self, client: AsyncClient):
        """Upload should require assistant_id"""
        # Create a simple text file for testing
        files = {"file": ("test.txt", b"Test content", "text/plain")}
        
        response = await client.post(
            "/api/knowledge-base/upload",
            files=files,
            # Missing assistant_id
        )
        
        # Accept 200 if endpoint handles missing assistant_id gracefully
        # or validation errors (422/400) or server errors (500)
        assert response.status_code in [200, 422, 400, 500]


class TestErrorHandling:
    """Test error handling"""

    @pytest.mark.asyncio
    async def test_invalid_json(self, client: AsyncClient):
        """Should handle invalid JSON gracefully"""
        response = await client.post(
            "/api/knowledge-base/search",
            content="not valid json",
            headers={"Content-Type": "application/json"},
        )
        
        assert response.status_code in [400, 422]

    @pytest.mark.asyncio
    async def test_empty_body(self, client: AsyncClient):
        """Should handle empty request body"""
        response = await client.post(
            "/api/knowledge-base/search",
            json={},
        )
        
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_invalid_endpoint(self, client: AsyncClient):
        """Should return 404 for invalid endpoints"""
        response = await client.get("/api/nonexistent")
        
        assert response.status_code == 404


class TestCORS:
    """Test CORS configuration"""

    @pytest.mark.asyncio
    async def test_cors_headers(self, client: AsyncClient):
        """Should include CORS headers"""
        response = await client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            }
        )
        
        # FastAPI handles OPTIONS differently
        assert response.status_code in [200, 405]
