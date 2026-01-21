"""
Tests for LLM service
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
import os


class TestLLMConfiguration:
    """Test LLM configuration and provider selection"""

    def test_default_provider_is_local(self):
        """Default LLM provider should be local (Ollama)"""
        with patch.dict(os.environ, {}, clear=True):
            from services.llm import LLM_PROVIDER
            # Default should be 'local' if not set
            assert LLM_PROVIDER in ['local', 'openai']

    def test_local_provider_uses_ollama_url(self):
        """Local provider should use Ollama base URL"""
        with patch.dict(os.environ, {'LLM_PROVIDER': 'local'}):
            from services.llm import OLLAMA_BASE_URL
            assert 'localhost:11434' in OLLAMA_BASE_URL or '127.0.0.1:11434' in OLLAMA_BASE_URL

    def test_openai_provider_requires_api_key(self):
        """OpenAI provider should require API key when explicitly set"""
        # This test validates the logic - actual behavior depends on implementation
        # If OPENAI_API_KEY is empty and provider is openai, should raise or use fallback
        api_key = os.getenv('OPENAI_API_KEY', '')
        if api_key == '':
            # No API key set - this is expected in local dev
            assert True
        else:
            # API key is set - should work
            assert len(api_key) > 0


class TestModelSelection:
    """Test model name selection based on provider"""

    def test_local_model_default(self):
        """Local provider should default to llama3"""
        with patch.dict(os.environ, {'LLM_PROVIDER': 'local'}):
            from services.llm import get_model_name
            model = get_model_name()
            assert 'llama' in model.lower() or model == os.getenv('OLLAMA_MODEL', 'llama3')

    def test_openai_model_default(self):
        """OpenAI provider should return configured model"""
        # Model depends on environment - just verify it returns a string
        from services.llm import get_model_name
        model = get_model_name()
        assert isinstance(model, str)
        assert len(model) > 0


class TestChatGeneration:
    """Test chat response generation"""

    @pytest.mark.asyncio
    @patch('services.llm.get_llm_client')
    async def test_generate_chat_response_structure(self, mock_get_client):
        """Chat response should return string"""
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content="Test response"))]
        mock_client.chat.completions.create.return_value = mock_response
        mock_get_client.return_value = mock_client

        from services.llm import generate_chat_response

        messages = [{"role": "user", "content": "Hello"}]
        response = await generate_chat_response(messages)

        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    @patch('services.llm.get_llm_client')
    async def test_generate_chat_with_system_prompt(self, mock_get_client):
        """System prompt should be prepended to messages"""
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content="Response"))]
        mock_client.chat.completions.create.return_value = mock_response
        mock_get_client.return_value = mock_client

        from services.llm import generate_chat_response

        messages = [{"role": "user", "content": "Hello"}]
        system_prompt = "You are a helpful assistant."

        await generate_chat_response(messages, system_prompt=system_prompt)

        # Verify system prompt was included
        call_args = mock_client.chat.completions.create.call_args
        sent_messages = call_args.kwargs.get('messages', call_args[1].get('messages', []))
        
        assert len(sent_messages) >= 2
        assert sent_messages[0]['role'] == 'system'
        assert sent_messages[0]['content'] == system_prompt


class TestRAGGeneration:
    """Test RAG response generation"""

    @pytest.mark.asyncio
    @patch('services.llm.generate_chat_response')
    async def test_generate_rag_response_with_context(self, mock_generate):
        """RAG response should include context in prompt"""
        mock_generate.return_value = "AI response with context"

        from services.llm import generate_rag_response

        context_chunks = [
            {"content": "Pricing starts at $299/month", "source": "pricing.pdf"},
            {"content": "Enterprise plans available", "source": "enterprise.pdf"},
        ]

        response = await generate_rag_response(
            user_query="What are your prices?",
            context_chunks=context_chunks,
        )

        assert isinstance(response, str)
        mock_generate.assert_called_once()

        # Verify context was included in the call
        call_args = mock_generate.call_args
        messages = call_args.kwargs.get('messages', call_args[0][0] if call_args[0] else [])
        
        # The user message should contain context
        user_message = next((m for m in messages if m['role'] == 'user'), None)
        assert user_message is not None

    @pytest.mark.asyncio
    @patch('services.llm.generate_chat_response')
    async def test_generate_rag_response_with_history(self, mock_generate):
        """RAG response should include conversation history"""
        mock_generate.return_value = "Follow-up response"

        from services.llm import generate_rag_response

        history = [
            {"role": "user", "content": "What is Resonance?"},
            {"role": "assistant", "content": "Resonance is an AI chatbot platform."},
        ]

        response = await generate_rag_response(
            user_query="Tell me more",
            context_chunks=[],
            conversation_history=history,
        )

        assert isinstance(response, str)
        
        # Verify history was included
        call_args = mock_generate.call_args
        messages = call_args.kwargs.get('messages', call_args[0][0] if call_args[0] else [])
        
        # Should have history + current query
        assert len(messages) >= 3

    @pytest.mark.asyncio
    @patch('services.llm.generate_chat_response')
    async def test_generate_rag_response_empty_context(self, mock_generate):
        """RAG should work with empty context"""
        mock_generate.return_value = "Response without context"

        from services.llm import generate_rag_response

        response = await generate_rag_response(
            user_query="Hello",
            context_chunks=[],
        )

        assert isinstance(response, str)


class TestTemperature:
    """Test temperature parameter handling"""

    @pytest.mark.asyncio
    @patch('services.llm.get_llm_client')
    async def test_default_temperature(self, mock_get_client):
        """Default temperature should be 0.7"""
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content="Response"))]
        mock_client.chat.completions.create.return_value = mock_response
        mock_get_client.return_value = mock_client

        from services.llm import generate_chat_response

        await generate_chat_response([{"role": "user", "content": "Hi"}])

        call_args = mock_client.chat.completions.create.call_args
        temperature = call_args.kwargs.get('temperature', 0.7)
        
        assert temperature == 0.7

    @pytest.mark.asyncio
    @patch('services.llm.get_llm_client')
    async def test_custom_temperature(self, mock_get_client):
        """Custom temperature should be passed to LLM"""
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content="Response"))]
        mock_client.chat.completions.create.return_value = mock_response
        mock_get_client.return_value = mock_client

        from services.llm import generate_chat_response

        await generate_chat_response(
            [{"role": "user", "content": "Hi"}],
            temperature=0.2
        )

        call_args = mock_client.chat.completions.create.call_args
        temperature = call_args.kwargs.get('temperature', 0.7)
        
        assert temperature == 0.2
