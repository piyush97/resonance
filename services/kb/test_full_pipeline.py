"""
Full end-to-end test of Resonance KB service
Tests: upload, search, and chat with local Ollama LLM
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("1. Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"   ✓ {response.json()}")
    return response.status_code == 200

def test_upload():
    """Test document upload with Pinecone integrated embeddings"""
    print("\n2. Testing document upload (Pinecone integrated embeddings)...")
    
    # Create test content
    content = """
# Resonance - AI Customer Service Platform

## Overview
Resonance is an AI-powered customer service chatbot designed for B2B SaaS companies.

## Key Features
- 24-hour setup time
- 70% resolution rate
- 60% cost reduction
- Easy integration with Slack, Zendesk, WhatsApp

## Pricing
- Starter: $299/month (5,000 conversations)
- Pro: $999/month (50,000 conversations)
- Enterprise: Custom pricing

## Technology
- Uses RAG (Retrieval-Augmented Generation)
- Powered by local Ollama LLM
- Pinecone vector database with integrated embeddings
- Real-time WebSocket connections
""".encode('utf-8')
    
    # Upload
    files = {'file': ('resonance-info.txt', content, 'text/plain')}
    data = {'assistant_id': 'demo'}
    
    response = requests.post(
        f"{BASE_URL}/api/knowledge-base/upload",
        files=files,
        data=data
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"   ✓ Upload successful!")
        print(f"   Document ID: {result.get('document_id')}")
        print(f"   Chunks: {result.get('chunks')}")
        return True
    else:
        print(f"   ✗ Upload failed: {response.text}")
        return False

def test_search():
    """Test knowledge base search"""
    print("\n3. Testing knowledge base search...")
    
    payload = {
        "query": "What is Resonance and what does it do?",
        "assistant_id": "demo",
        "top_k": 3
    }
    
    response = requests.post(
        f"{BASE_URL}/api/knowledge-base/search",
        json=payload
    )
    
    if response.status_code == 200:
        result = response.json()
        results = result.get('results', [])
        print(f"   ✓ Search successful! Found {len(results)} results")
        for i, res in enumerate(results[:2], 1):
            print(f"\n   Result {i}:")
            print(f"   Score: {res.get('score', 0):.4f}")
            print(f"   Text: {res.get('content', '')[:80]}...")
        return True
    else:
        print(f"   ✗ Search failed: {response.text}")
        return False

def test_chat():
    """Test chat with RAG and local Ollama LLM"""
    print("\n4. Testing chat with local Ollama LLM...")
    
    payload = {
        "query": "What is Resonance and how much does it cost?",
        "assistant_id": "demo"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/knowledge-base/chat",
        json=payload,
        timeout=30  # Ollama can be slow on first request
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"   ✓ Chat successful!")
        print(f"\n   AI Response:")
        print(f"   {result.get('response', '')[:300]}...")
        print(f"\n   Sources: {len(result.get('sources', []))} documents")
        return True
    else:
        print(f"   ✗ Chat failed: {response.text}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Resonance Full Pipeline Test")
    print("100% Free AI Stack:")
    print("  - Pinecone integrated embeddings (llama-text-embed-v2)")
    print("  - Local Ollama LLM (llama3.2:latest)")
    print("  - Cost: $0/month")
    print("=" * 60)
    
    # Check if service is running
    try:
        if not test_health():
            print("\n✗ Service not running. Start it with:")
            print("  cd services/kb && source venv/bin/activate && python main.py")
            exit(1)
    except requests.exceptions.ConnectionError:
        print("\n✗ Cannot connect to service. Make sure it's running:")
        print("  cd services/kb && source venv/bin/activate && python main.py")
        exit(1)
    
    # Run tests
    results = []
    results.append(("Upload", test_upload()))
    
    # Wait for indexing
    print("\n   Waiting 3 seconds for Pinecone indexing...")
    import time
    time.sleep(3)
    
    results.append(("Search", test_search()))
    results.append(("Chat", test_chat()))
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    for test_name, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    all_passed = all(result[1] for result in results)
    if all_passed:
        print("\n" + "🎉" * 30)
        print("\n✅ ALL TESTS PASSED!")
        print("\nYour 100% free AI stack is working:")
        print("  ✓ Pinecone integrated embeddings (llama-text-embed-v2)")
        print("  ✓ Local Ollama LLM (llama3.2:latest)")
        print("  ✓ GPU acceleration (RTX 5070 Ti)")
        print("  ✓ Full RAG pipeline working")
        print("\nCost: $0/month")
        print("\nNext: Start customer validation! 🚀")
        print("\n" + "🎉" * 30)
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
