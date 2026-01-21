"""
LLM Service - Supports both local (Ollama) and OpenAI
Automatically switches based on environment configuration
"""
import os
from typing import List, Dict, Optional, AsyncIterator
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Configuration
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "local")  # "local" or "openai"
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")  # or mistral, phi3, etc.


def get_llm_client() -> OpenAI:
    """
    Get LLM client based on configuration
    Returns OpenAI-compatible client (works with both Ollama and OpenAI)
    """
    if LLM_PROVIDER == "local":
        # Ollama uses OpenAI-compatible API
        return OpenAI(
            base_url=OLLAMA_BASE_URL,
            api_key="ollama",  # Not needed, but required by library
        )
    else:
        # OpenAI
        if not OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is required when LLM_PROVIDER=openai")
        return OpenAI(api_key=OPENAI_API_KEY)


def get_model_name() -> str:
    """Get the model name based on provider"""
    if LLM_PROVIDER == "local":
        return OLLAMA_MODEL
    else:
        return OPENAI_MODEL


async def generate_chat_response(
    messages: List[Dict[str, str]],
    system_prompt: Optional[str] = None,
    temperature: float = 0.7,
    stream: bool = False,
) -> str:
    """
    Generate chat response using configured LLM provider
    
    Args:
        messages: List of message dicts with 'role' and 'content'
        system_prompt: Optional system prompt
        temperature: Sampling temperature (0-1)
        stream: Whether to stream response (not implemented yet)
    
    Returns:
        Generated response text
    """
    client = get_llm_client()
    model = get_model_name()
    
    # Prepare messages
    chat_messages = []
    if system_prompt:
        chat_messages.append({
            "role": "system",
            "content": system_prompt,
        })
    chat_messages.extend(messages)
    
    # Generate response
    response = client.chat.completions.create(
        model=model,
        messages=chat_messages,
        temperature=temperature,
        stream=stream,
    )
    
    if stream:
        # Handle streaming (for future implementation)
        full_response = ""
        for chunk in response:
            if chunk.choices[0].delta.content:
                full_response += chunk.choices[0].delta.content
        return full_response
    else:
        return response.choices[0].message.content


async def generate_rag_response(
    user_query: str,
    context_chunks: List[Dict[str, str]],
    conversation_history: Optional[List[Dict[str, str]]] = None,
    system_prompt: Optional[str] = None,
) -> str:
    """
    Generate RAG response with context from knowledge base
    
    Args:
        user_query: User's question
        context_chunks: List of relevant document chunks with 'content' and 'source'
        conversation_history: Previous messages in conversation
        system_prompt: Custom system prompt (optional)
    
    Returns:
        Generated response with context
    """
    # Build system prompt
    if not system_prompt:
        system_prompt = """You are a helpful AI assistant for customer support. 
Answer questions based on the provided context from the knowledge base.
If the answer is not in the context, say so politely.
Be concise, helpful, and professional."""

    # Format context
    context_text = "\n\n".join([
        f"[Source: {chunk.get('source', 'unknown')}]\n{chunk.get('content', '')}"
        for chunk in context_chunks
    ])
    
    # Build messages
    messages = []
    
    # Add conversation history
    if conversation_history:
        messages.extend(conversation_history)
    
    # Add current query with context
    user_message = f"""Context from knowledge base:
{context_text}

User question: {user_query}

Please answer the user's question based on the context above."""
    
    messages.append({
        "role": "user",
        "content": user_message,
    })
    
    # Generate response
    response = await generate_chat_response(
        messages=messages,
        system_prompt=system_prompt,
        temperature=0.7,
    )
    
    return response
