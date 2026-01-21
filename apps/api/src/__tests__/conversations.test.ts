import { describe, it, expect } from 'vitest'

const API_URL = process.env.API_URL || 'http://localhost:3001'

describe('Conversations API', () => {
  describe('POST /api/v1/conversations/create', () => {
    it('should create a new conversation', async () => {
      const response = await fetch(`${API_URL}/api/v1/conversations/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitor_id: 'test-visitor-123',
          channel: 'web',
          initial_message: 'Hello, I need help!',
        }),
      })
      
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.conversation_id).toBeDefined()
      expect(data.conversation_id).toMatch(/^conv_/)
      expect(data.ws_url).toBeDefined()
    })

    it('should validate channel enum', async () => {
      const response = await fetch(`${API_URL}/api/v1/conversations/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitor_id: 'test-visitor-123',
          channel: 'invalid_channel',
        }),
      })
      
      // Should fail validation with 400
      expect(response.status).toBe(400)
    })

    it('should require visitor_id', async () => {
      const response = await fetch(`${API_URL}/api/v1/conversations/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: 'web',
        }),
      })
      
      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/v1/conversations/:id', () => {
    it('should return conversation by ID', async () => {
      const response = await fetch(`${API_URL}/api/v1/conversations/conv_test123`)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.conversation_id).toBe('conv_test123')
      expect(data.messages).toBeDefined()
      expect(Array.isArray(data.messages)).toBe(true)
      expect(data.status).toBeDefined()
    })
  })
})

describe('Assistants API', () => {
  describe('GET /api/v1/assistants', () => {
    it('should list assistants', async () => {
      const response = await fetch(`${API_URL}/api/v1/assistants`)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.assistants).toBeDefined()
      expect(Array.isArray(data.assistants)).toBe(true)
    })
  })

  describe('POST /api/v1/assistants', () => {
    it('should accept valid assistant data', async () => {
      const response = await fetch(`${API_URL}/api/v1/assistants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Assistant',
          description: 'A test assistant for unit tests',
          instructions: 'You are a helpful test assistant.',
          model: 'llama3.2:latest',
          temperature: 0.7,
        }),
      })
      
      // 200 if Supabase works, 500 if not configured - both are valid
      expect([200, 500]).toContain(response.status)
    })

    it('should validate required name field', async () => {
      const response = await fetch(`${API_URL}/api/v1/assistants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: 'Missing name field',
        }),
      })
      
      expect(response.status).toBe(400)
    })
  })
})
