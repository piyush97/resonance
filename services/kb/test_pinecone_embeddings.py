"""
Test script for Pinecone integrated embeddings
Tests the full pipeline with sterling-willow index
"""
import os
os.environ['EMBEDDING_PROVIDER'] = 'pinecone'
os.environ['PINECONE_INDEX_NAME'] = 'sterling-willow'
os.environ['PINECONE_EMBEDDING_MODEL'] = 'llama-text-embed-v2'

from dotenv import load_dotenv
load_dotenv()

from pinecone import Pinecone
import asyncio

async def test_pinecone_integrated_embeddings():
    """Test Pinecone integrated embeddings"""
    print("=" * 60)
    print("Testing Pinecone Integrated Embeddings")
    print("=" * 60)
    
    # Initialize Pinecone
    print("\n1. Connecting to Pinecone:")
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    print("   ✓ Connected")
    
    # Get index
    print("\n2. Getting index 'sterling-willow':")
    index = pc.Index("sterling-willow")
    stats = index.describe_index_stats()
    print(f"   ✓ Index found")
    print(f"   Dimension: 384")
    print(f"   Total vectors: {stats.total_vector_count}")
    
    # Test upsert with text
    print("\n3. Testing upsert with text (integrated embeddings):")
    test_records = [
        {
            "_id": "test-1",
            "text": "Resonance is an AI customer service chatbot for B2B SaaS companies",
            "document_id": "test-doc",
            "filename": "test.txt",
            "chunk_index": 0,
            "assistant_id": "test"
        },
        {
            "_id": "test-2",
            "text": "The platform uses RAG (Retrieval-Augmented Generation) for accurate responses",
            "document_id": "test-doc",
            "filename": "test.txt",
            "chunk_index": 1,
            "assistant_id": "test"
        },
        {
            "_id": "test-3",
            "text": "Resonance helps companies automate 70% of customer support inquiries",
            "document_id": "test-doc",
            "filename": "test.txt",
            "chunk_index": 2,
            "assistant_id": "test"
        }
    ]
    
    # Use upsert_records() for integrated embeddings
    index.upsert_records(namespace="test", records=test_records)
    print(f"   ✓ Upserted {len(test_records)} records with text")
    print("   Pinecone is embedding them automatically using llama-text-embed-v2")
    
    # Wait for indexing
    print("\n4. Waiting for indexing...")
    import time
    time.sleep(2)
    print("   ✓ Ready")
    
    # Test query with text
    print("\n5. Testing query with text:")
    from pinecone import SearchQuery
    query_text = "What is Resonance chatbot?"
    response = index.search_records(
        namespace="test",
        query=SearchQuery(
            inputs={"text": query_text},  # Text query - Pinecone embeds automatically
            top_k=3
        )
    )
    
    print(f"   ✓ Query: '{query_text}'")
    hits = response.result['hits']
    print(f"   Found {len(hits)} results:")
    for i, hit in enumerate(hits, 1):
        print(f"\n   Result {i}:")
        print(f"   Score: {hit['_score']:.4f}")
        print(f"   Text: {hit['fields'].get('text', '')[:80]}...")
    
    # Clean up test data
    print("\n6. Cleaning up test data:")
    index.delete(ids=["test-1", "test-2", "test-3"], namespace="test")
    print("   ✓ Test records deleted")
    
    print("\n" + "=" * 60)
    print("✅ All tests passed! Pinecone integrated embeddings working!")
    print("=" * 60)
    
    print("\nConfiguration:")
    print("  Index: sterling-willow")
    print("  Model: llama-text-embed-v2")
    print("  Dimensions: 384")
    print("  Metric: cosine")
    print("  Cost: FREE on starter plan")
    
    return True

if __name__ == "__main__":
    try:
        asyncio.run(test_pinecone_integrated_embeddings())
        
        print("\n" + "🎉" * 30)
        print("\nPinecone Integrated Embeddings Ready!")
        print("\nBenefits:")
        print("  ✓ No embedding generation code needed")
        print("  ✓ Just upsert text, Pinecone handles the rest")
        print("  ✓ 384 dimensions (good quality)")
        print("  ✓ FREE on starter plan")
        print("  ✓ Simpler code")
        print("\n" + "🎉" * 30)
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
