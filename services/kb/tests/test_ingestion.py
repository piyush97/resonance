"""Tests for document ingestion."""
import pytest
from unittest.mock import patch, MagicMock
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestDocumentChunking:
    """Test document chunking functionality."""

    def test_chunk_text_basic(self):
        """Should chunk text into smaller pieces."""
        from services.ingestion import chunk_text
        
        text = "This is a test. " * 100  # Long text
        chunks = chunk_text(text, chunk_size=50, overlap=0.2)
        
        assert len(chunks) > 1
        # Each chunk is a dict with 'text' key
        assert all(isinstance(chunk, dict) for chunk in chunks)
        assert all('text' in chunk for chunk in chunks)

    def test_chunk_text_preserves_content(self):
        """Chunking should preserve all content."""
        from services.ingestion import chunk_text
        
        text = "Hello world. This is a test document."
        chunks = chunk_text(text, chunk_size=10, overlap=0.2)
        
        # All words should be in at least one chunk
        words = text.split()
        for word in words:
            assert any(word in chunk['text'] for chunk in chunks)

    def test_chunk_text_empty_input(self):
        """Should handle empty input gracefully."""
        from services.ingestion import chunk_text
        
        chunks = chunk_text("", chunk_size=100, overlap=0.2)
        assert len(chunks) <= 1  # Either empty or single empty chunk


class TestTextExtraction:
    """Test text extraction from documents."""

    def test_extract_text_from_txt(self):
        """Should extract text from plain text content."""
        from services.ingestion import extract_text
        
        content = b"Hello, this is plain text content."
        text = extract_text(content, "text/plain")
        
        assert "Hello" in text
        assert "plain text" in text

    def test_extract_text_handles_encoding(self):
        """Should handle different text encodings."""
        from services.ingestion import extract_text
        
        content = "Hello, world! 你好世界".encode('utf-8')
        text = extract_text(content, "text/plain")
        
        assert "Hello" in text


class TestIngestionPipeline:
    """Test the full ingestion pipeline."""

    @pytest.mark.asyncio
    @patch('services.ingestion.get_pinecone_client')
    @patch('services.ingestion.get_openai_client')
    @patch('services.ingestion.EMBEDDING_PROVIDER', 'openai')
    async def test_ingest_document_structure(self, mock_openai, mock_pinecone):
        """Ingestion should return correct structure."""
        from services.ingestion import ingest_document
        
        # Mock Pinecone
        mock_index = MagicMock()
        mock_pinecone.return_value.Index.return_value = mock_index
        
        # Mock OpenAI embeddings
        mock_embedding = MagicMock()
        mock_embedding.data = [MagicMock(embedding=[0.1] * 1536)]
        mock_openai.return_value.embeddings.create.return_value = mock_embedding
        
        result = await ingest_document(
            content=b"Test document content for ingestion testing.",
            filename="test.txt",
            assistant_id="test-assistant",
            content_type="text/plain"
        )
        
        assert "document_id" in result
        assert "chunks" in result
        assert "status" in result
        assert result["status"] == "processed"
