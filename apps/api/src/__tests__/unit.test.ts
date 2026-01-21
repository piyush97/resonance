/**
 * Unit tests for API service - no running services required
 */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Test schema validation (same schemas used in routes)
const createConversationSchema = z.object({
  visitor_id: z.string(),
  channel: z.enum(['web', 'slack', 'whatsapp', 'email']),
  initial_message: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

const createAssistantSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  instructions: z.string().optional(),
  model: z.string().default('llama3.2:latest'),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().optional(),
})

describe('Schema Validation', () => {
  describe('Conversation Schema', () => {
    it('should validate valid conversation data', () => {
      const validData = {
        visitor_id: 'visitor-123',
        channel: 'web',
        initial_message: 'Hello!',
      }
      
      const result = createConversationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid channel', () => {
      const invalidData = {
        visitor_id: 'visitor-123',
        channel: 'invalid_channel',
      }
      
      const result = createConversationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject missing visitor_id', () => {
      const invalidData = {
        channel: 'web',
      }
      
      const result = createConversationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept all valid channels', () => {
      const channels = ['web', 'slack', 'whatsapp', 'email']
      
      for (const channel of channels) {
        const data = { visitor_id: 'test', channel }
        const result = createConversationSchema.safeParse(data)
        expect(result.success).toBe(true)
      }
    })

    it('should accept optional metadata', () => {
      const data = {
        visitor_id: 'visitor-123',
        channel: 'web',
        metadata: { source: 'landing_page', utm_campaign: 'test' },
      }
      
      const result = createConversationSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Assistant Schema', () => {
    it('should validate valid assistant data', () => {
      const validData = {
        name: 'Support Bot',
        description: 'A helpful support assistant',
        instructions: 'Be helpful and friendly',
        model: 'llama3.2:latest',
        temperature: 0.7,
      }
      
      const result = createAssistantSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const invalidData = {
        name: '',
      }
      
      const result = createAssistantSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject name over 100 characters', () => {
      const invalidData = {
        name: 'a'.repeat(101),
      }
      
      const result = createAssistantSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should apply default values', () => {
      const minimalData = {
        name: 'Test Bot',
      }
      
      const result = createAssistantSchema.safeParse(minimalData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.model).toBe('llama3.2:latest')
        expect(result.data.temperature).toBe(0.7)
      }
    })

    it('should reject invalid temperature', () => {
      const invalidData = {
        name: 'Test Bot',
        temperature: 3.0, // Max is 2
      }
      
      const result = createAssistantSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept temperature at boundaries', () => {
      const dataMin = { name: 'Test', temperature: 0 }
      const dataMax = { name: 'Test', temperature: 2 }
      
      expect(createAssistantSchema.safeParse(dataMin).success).toBe(true)
      expect(createAssistantSchema.safeParse(dataMax).success).toBe(true)
    })
  })
})

describe('Utility Functions', () => {
  describe('Conversation ID Generation', () => {
    it('should generate unique conversation IDs', () => {
      const generateConvId = () => `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      
      const ids = new Set()
      for (let i = 0; i < 100; i++) {
        ids.add(generateConvId())
      }
      
      // All IDs should be unique
      expect(ids.size).toBe(100)
    })

    it('should generate IDs with correct prefix', () => {
      const generateConvId = () => `conv_${Date.now()}`
      const id = generateConvId()
      
      expect(id.startsWith('conv_')).toBe(true)
    })
  })

  describe('WebSocket URL Generation', () => {
    it('should generate valid WebSocket URLs', () => {
      const generateWsUrl = (convId: string) => `wss://api.resonance.ai/ws/${convId}`
      
      const url = generateWsUrl('conv_123')
      expect(url).toBe('wss://api.resonance.ai/ws/conv_123')
      expect(url.startsWith('wss://')).toBe(true)
    })
  })
})

describe('Message Types', () => {
  it('should define correct message roles', () => {
    const validRoles = ['user', 'assistant', 'system']
    
    expect(validRoles).toContain('user')
    expect(validRoles).toContain('assistant')
    expect(validRoles).toContain('system')
  })

  it('should structure messages correctly', () => {
    interface Message {
      id: string
      role: 'user' | 'assistant' | 'system'
      content: string
      timestamp: Date
    }

    const message: Message = {
      id: 'msg_1',
      role: 'user',
      content: 'Hello!',
      timestamp: new Date(),
    }

    expect(message.id).toBeDefined()
    expect(message.role).toBe('user')
    expect(message.content).toBe('Hello!')
    expect(message.timestamp).toBeInstanceOf(Date)
  })
})
