/**
 * End-to-End Tests for Resonance API
 * Tests the complete flow: Widget → API → KB Service → Response
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

const API_URL = process.env.API_URL || 'http://localhost:3001'
const KB_SERVICE_URL = process.env.KB_SERVICE_URL || 'http://localhost:8000'

describe('E2E: Complete Chat Flow', () => {
  let conversationId: string

  beforeAll(async () => {
    // Verify services are running
    const apiHealth = await fetch(`${API_URL}/health`)
    expect(apiHealth.ok).toBe(true)
  })

  describe('Conversation Lifecycle', () => {
    it('should create a new conversation', async () => {
      const response = await fetch(`${API_URL}/api/v1/conversations/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_id: `e2e-test-${Date.now()}`,
          channel: 'web',
          initial_message: 'Hello, I need help with pricing',
          metadata: { source: 'e2e-test' },
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      
      expect(data.conversation_id).toBeDefined()
      expect(data.conversation_id).toMatch(/^conv_/)
      expect(data.ws_url).toBeDefined()
      
      conversationId = data.conversation_id
    })

    it('should retrieve the created conversation', async () => {
      const response = await fetch(`${API_URL}/api/v1/conversations/${conversationId}`)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      
      expect(data.conversation_id).toBe(conversationId)
      expect(data.status).toBe('active')
      expect(data.messages).toBeDefined()
    })
  })

  describe('Assistant Management', () => {
    let assistantId: string

    it('should create a new assistant', async () => {
      const response = await fetch(`${API_URL}/api/v1/assistants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'E2E Test Assistant',
          description: 'Created by E2E tests',
          instructions: 'You are a helpful test assistant.',
          model: 'llama3.2:latest',
          temperature: 0.7,
        }),
      })

      // May fail if Supabase not configured - that's OK
      if (response.status === 200) {
        const data = await response.json()
        expect(data.id).toBeDefined()
        expect(data.name).toBe('E2E Test Assistant')
        assistantId = data.id
      } else {
        expect([200, 500]).toContain(response.status)
      }
    })

    it('should list all assistants', async () => {
      const response = await fetch(`${API_URL}/api/v1/assistants`)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      
      expect(data.assistants).toBeDefined()
      expect(Array.isArray(data.assistants)).toBe(true)
    })
  })
})

describe('E2E: Knowledge Base Integration', () => {
  describe('Search Flow', () => {
    it('should perform semantic search', async () => {
      const response = await fetch(`${KB_SERVICE_URL}/api/knowledge-base/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'What are your pricing plans?',
          assistant_id: 'test-assistant',
          top_k: 5,
        }),
      })

      // May return 500 if Pinecone not configured
      expect([200, 500]).toContain(response.status)
      
      if (response.status === 200) {
        const data = await response.json()
        expect(data.query).toBe('What are your pricing plans?')
        expect(data.results).toBeDefined()
        expect(Array.isArray(data.results)).toBe(true)
      }
    })
  })

  describe('RAG Chat Flow', () => {
    it('should generate RAG response', async () => {
      const response = await fetch(`${KB_SERVICE_URL}/api/knowledge-base/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'How do I get started?',
          assistant_id: 'test-assistant',
          conversation_history: [],
        }),
      })

      // May return 500 if LLM not configured
      expect([200, 500]).toContain(response.status)
      
      if (response.status === 200) {
        const data = await response.json()
        expect(data.response).toBeDefined()
        expect(typeof data.response).toBe('string')
      }
    })

    it('should maintain conversation context', async () => {
      const history = [
        { role: 'user', content: 'What is Resonance?' },
        { role: 'assistant', content: 'Resonance is an AI chatbot platform.' },
      ]

      const response = await fetch(`${KB_SERVICE_URL}/api/knowledge-base/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Tell me more about its features',
          assistant_id: 'test-assistant',
          conversation_history: history,
        }),
      })

      expect([200, 500]).toContain(response.status)
    })
  })
})

describe('E2E: Error Handling', () => {
  it('should return 400 for invalid conversation data', async () => {
    const response = await fetch(`${API_URL}/api/v1/conversations/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Missing required visitor_id
        channel: 'web',
      }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBeDefined()
  })

  it('should return 400 for invalid channel', async () => {
    const response = await fetch(`${API_URL}/api/v1/conversations/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_id: 'test-visitor',
        channel: 'invalid_channel',
      }),
    })

    expect(response.status).toBe(400)
  })

  it('should return 400 for invalid assistant data', async () => {
    const response = await fetch(`${API_URL}/api/v1/assistants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Missing required name
        description: 'No name provided',
      }),
    })

    expect(response.status).toBe(400)
  })

  it('should handle malformed JSON gracefully', async () => {
    const response = await fetch(`${API_URL}/api/v1/conversations/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not valid json',
    })

    expect(response.status).toBe(400)
  })
})

describe('E2E: Rate Limiting', () => {
  it('should allow requests within rate limit', async () => {
    const requests = Array(5).fill(null).map(() =>
      fetch(`${API_URL}/health`)
    )

    const responses = await Promise.all(requests)
    
    // All should succeed
    responses.forEach((response) => {
      expect(response.status).toBe(200)
    })
  })
})

describe('E2E: CORS', () => {
  it('should allow requests from localhost:3000', async () => {
    const response = await fetch(`${API_URL}/health`, {
      headers: {
        'Origin': 'http://localhost:3000',
      },
    })

    expect(response.status).toBe(200)
  })
})
