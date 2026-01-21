"""
Test script for KB service
Tests document upload, search, and chat with local LLM
"""
import requests
import json
import os
from pathlib import Path

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"✓ Health check: {response.json()}")
    return response.status_code == 200

def create_test_document():
    """Create a simple test PDF-like text file"""
    test_content = """
# Resonance - AI Customer Service Platform

Resonance is an AI-powered customer service chatbot platform designed for B2B SaaS companies.

## Key Features

1. **24-Hour Setup**: Deploy an AI support agent in less than 24 hours
2. **70% Resolution Rate**: Automatically handles 70% of customer inquiries
3. **60% Cost Reduction**: Save 60%+ on customer support costs
4. **Easy Integration**: Works with Slack, Zendesk, WhatsApp, and email

## Pricing

- Starter: $299/month (5,000 conversations)
- Pro: $999/month (50,000 conversations)
- Enterprise: Custom pricing

## How It Works

1. Upload your knowledge base (PDFs, help docs, FAQs)
2. Customize your chatbot's appearance and tone
3. Install the chat widget on your website
4. Monitor analytics and improve over time

## Support

For questions, contact support@resonance.ai
"""
    return test_content.encode('utf-8')

def test_upload():
    """Test document upload"""
    print("\nTesting document upload...")
    
    # Create test content
    content = create_test_document()
    
    # Upload
    files = {'file': ('resonance-info.txt', content, 'text/plain')}
    data = {'assistant_id': 'test'}
    
    response = requests.post(
        f"{BASE_URL}/api/knowledge-base/upload",
        files=files,
        data=data
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Upload successful: {result}")
        return True
    else:
        print(f"✗ Upload failed: {response.text}")
        return False

def test_search():
    """Test knowledge base search"""
    print("\nTesting knowledge base search...")
    
    payload = {
        "query": "What is Resonance?",
        "assistant_id": "test",
        "top_k": 3
    }
    
    response = requests.post(
        f"{BASE_URL}/api/knowledge-base/search",
        json=payload
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Search successful: Found {len(result.get('results', []))} results")
        for i, res in enumerate(result.get('results', [])[:2]):
            print(f"  Result {i+1}: {res.get('content', '')[:100]}...")
        return True
    else:
        print(f"✗ Search failed: {response.text}")
        return False

def test_chat():
    """Test chat with RAG"""
    print("\nTesting chat with local LLM (Ollama)...")
    
    payload = {
        "query": "What is Resonance and how much does it cost?",
        "assistant_id": "test"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/knowledge-base/chat",
        json=payload
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Chat successful!")
        print(f"  Response: {result.get('response', '')[:200]}...")
        print(f"  Sources: {len(result.get('sources', []))} documents")
        return True
    else:
        print(f"✗ Chat failed: {response.text}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Resonance KB Service Test Suite")
    print("=" * 60)
    
    # Check if service is running
    try:
        if not test_health():
            print("\n✗ Service is not running. Start it with:")
            print("  cd services/kb && source venv/bin/activate && python main.py")
            exit(1)
    except requests.exceptions.ConnectionError:
        print("\n✗ Cannot connect to service. Make sure it's running:")
        print("  cd services/kb && source venv/bin/activate && python main.py")
        exit(1)
    
    # Run tests
    results = []
    results.append(("Upload", test_upload()))
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
        print("\n🎉 All tests passed! Your KB service is working correctly.")
        print("\nNext steps:")
        print("1. Test with a real PDF document")
        print("2. Start the API service (apps/api)")
        print("3. Test the chat widget")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
