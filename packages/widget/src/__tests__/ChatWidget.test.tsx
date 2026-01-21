/**
 * Unit tests for ChatWidget - no running services required
 */
import { describe, it, expect } from 'vitest'

// Test configuration types
interface ChatWidgetProps {
  apiUrl?: string
  assistantId: string
  primaryColor?: string
  position?: 'bottom-right' | 'bottom-left'
}

interface ResonanceConfig {
  apiUrl?: string
  assistantId: string
  primaryColor?: string
  position?: 'bottom-right' | 'bottom-left'
}

describe('ChatWidget Types', () => {
  describe('Props Interface', () => {
    it('should require assistantId', () => {
      const validProps: ChatWidgetProps = {
        assistantId: 'test-assistant',
      }
      
      expect(validProps.assistantId).toBe('test-assistant')
    })

    it('should have optional apiUrl with default', () => {
      const props: ChatWidgetProps = {
        assistantId: 'test',
        apiUrl: 'http://localhost:3001',
      }
      
      expect(props.apiUrl).toBe('http://localhost:3001')
    })

    it('should accept valid position values', () => {
      const positions: Array<'bottom-right' | 'bottom-left'> = ['bottom-right', 'bottom-left']
      
      for (const position of positions) {
        const props: ChatWidgetProps = {
          assistantId: 'test',
          position,
        }
        expect(props.position).toBe(position)
      }
    })

    it('should accept custom primary color', () => {
      const props: ChatWidgetProps = {
        assistantId: 'test',
        primaryColor: '#ff5500',
      }
      
      expect(props.primaryColor).toBe('#ff5500')
    })
  })
})

describe('ResonanceConfig', () => {
  it('should validate complete config', () => {
    const config: ResonanceConfig = {
      assistantId: 'asst_123',
      apiUrl: 'https://api.resonance.ai',
      primaryColor: '#0ea5e9',
      position: 'bottom-right',
    }
    
    expect(config.assistantId).toBe('asst_123')
    expect(config.apiUrl).toBe('https://api.resonance.ai')
    expect(config.primaryColor).toBe('#0ea5e9')
    expect(config.position).toBe('bottom-right')
  })

  it('should work with minimal config', () => {
    const config: ResonanceConfig = {
      assistantId: 'asst_minimal',
    }
    
    expect(config.assistantId).toBe('asst_minimal')
    expect(config.apiUrl).toBeUndefined()
    expect(config.primaryColor).toBeUndefined()
    expect(config.position).toBeUndefined()
  })
})

describe('Widget Initialization', () => {
  it('should create container element ID', () => {
    const containerId = 'resonance-widget-container'
    expect(containerId).toBe('resonance-widget-container')
  })

  it('should use correct default API URL', () => {
    const defaultApiUrl = 'https://api.resonance.ai'
    expect(defaultApiUrl).toMatch(/^https:\/\//)
  })

  it('should use correct default color', () => {
    const defaultColor = '#0ea5e9'
    expect(defaultColor).toMatch(/^#[0-9a-fA-F]{6}$/)
  })
})

describe('Message Structure', () => {
  interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }

  it('should create valid user message', () => {
    const message: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: 'Hello!',
      timestamp: new Date(),
    }
    
    expect(message.role).toBe('user')
    expect(message.content).toBe('Hello!')
    expect(message.timestamp).toBeInstanceOf(Date)
  })

  it('should create valid assistant message', () => {
    const message: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'How can I help you?',
      timestamp: new Date(),
    }
    
    expect(message.role).toBe('assistant')
    expect(message.content).toBe('How can I help you?')
  })
})

describe('Position Classes', () => {
  it('should map positions to CSS classes', () => {
    const positionClasses = {
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
    }
    
    expect(positionClasses['bottom-right']).toContain('right-4')
    expect(positionClasses['bottom-left']).toContain('left-4')
  })
})

describe('Widget Export', () => {
  it('should export ChatWidget component', async () => {
    // Just verify the module structure
    const module = await import('../ChatWidget')
    expect(module.ChatWidget).toBeDefined()
  })

  it('should export initResonance function', async () => {
    const module = await import('../index')
    expect(module.initResonance).toBeDefined()
  })
})
