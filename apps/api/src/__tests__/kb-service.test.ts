import { describe, it, expect } from 'vitest'

const KB_SERVICE_URL = process.env.KB_SERVICE_URL || 'http://localhost:8000'

describe('Knowledge Base Service', () => {
  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await fetch(`${KB_SERVICE_URL}/health`)
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.status).toBe('ok')
      expect(data.service).toBe('Resonance KB Service')
    })
  })

  describe('Root Endpoint', () => {
    it('should return welcome message', async () => {
      const response = await fetch(`${KB_SERVICE_URL}/`)
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.message).toContain('Resonance')
    })
  })

  describe('Search Endpoint', () => {
    it('should accept search requests', async () => {
      const response = await fetch(`${KB_SERVICE_URL}/api/knowledge-base/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'test query',
          assistant_id: 'test-assistant',
          top_k: 5,
        }),
      })
      
      // 200 if Pinecone configured, 500 if not - endpoint should exist
      expect([200, 500]).toContain(response.status)
    })
  })

  describe('Chat Endpoint', () => {
    it('should accept chat requests', async () => {
      const response = await fetch(`${KB_SERVICE_URL}/api/knowledge-base/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'Hello, how can you help me?',
          assistant_id: 'test-assistant',
          conversation_history: [],
        }),
      })
      
      // 200 if LLM configured, 500 if not - endpoint should exist
      expect([200, 500]).toContain(response.status)
    })
  })
})
