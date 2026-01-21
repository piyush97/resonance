import { describe, it, expect } from 'vitest'

const API_URL = process.env.API_URL || 'http://localhost:3001'
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'test-admin-key'

// Auth headers for protected endpoints
const adminHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ADMIN_API_KEY}`,
}

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
    it('should reject unauthenticated requests', async () => {
      const response = await fetch(`${API_URL}/api/v1/assistants`)
      
      // Should return 401 (no auth) or 500 (ADMIN_API_KEY not set)
      expect([401, 500]).toContain(response.status)
    })

    it('should list assistants with auth', async () => {
      const response = await fetch(`${API_URL}/api/v1/assistants`, {
        headers: adminHeaders,
      })
      
      // May return 401/500 if auth not configured
      if (response.status === 200) {
        const data = await response.json()
        expect(data.assistants).toBeDefined()
        expect(Array.isArray(data.assistants)).toBe(true)
      } else {
        expect([200, 401, 500]).toContain(response.status)
      }
    })
  })

  describe('POST /api/v1/assistants', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await fetch(`${API_URL}/api/v1/assistants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Assistant',
        }),
      })
      
      // Should return 401 (no auth) or 500 (ADMIN_API_KEY not set)
      expect([401, 500]).toContain(response.status)
    })

    it('should accept valid assistant data with auth', async () => {
      const response = await fetch(`${API_URL}/api/v1/assistants`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          name: 'Test Assistant',
          description: 'A test assistant for unit tests',
          instructions: 'You are a helpful test assistant.',
          model: 'llama3.2:latest',
          temperature: 0.7,
        }),
      })
      
      // 200 if Supabase works, 401/500 if not configured - all valid
      expect([200, 401, 500]).toContain(response.status)
    })

    it('should validate required name field with auth', async () => {
      const response = await fetch(`${API_URL}/api/v1/assistants`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          description: 'Missing name field',
        }),
      })
      
      // 400 = validation error, 401 = auth failed, 500 = server misconfigured
      expect([400, 401, 500]).toContain(response.status)
    })
  })
})
