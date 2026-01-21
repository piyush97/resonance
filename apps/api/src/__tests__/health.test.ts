import { describe, it, expect } from 'vitest'

const API_URL = process.env.API_URL || 'http://localhost:3001'

describe('API Health Check', () => {
  it('should return healthy status', async () => {
    const response = await fetch(`${API_URL}/health`)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.status).toBe('ok')
    expect(data.services).toBeDefined()
    expect(data.services.api).toBe('ok')
    expect(data.timestamp).toBeDefined()
  })

  it('should have correct response structure', async () => {
    const response = await fetch(`${API_URL}/health`)
    const data = await response.json()
    
    expect(data).toHaveProperty('status')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('services')
    expect(data.services).toHaveProperty('api')
    expect(data.services).toHaveProperty('kb')
    expect(data.services).toHaveProperty('database')
  })
})

describe('API CORS', () => {
  it('should allow requests from localhost:3000', async () => {
    const response = await fetch(`${API_URL}/health`, {
      headers: {
        'Origin': 'http://localhost:3000',
      },
    })
    
    expect(response.status).toBe(200)
  })
})
