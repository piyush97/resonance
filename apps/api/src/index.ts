import 'dotenv/config'
import Fastify from 'fastify'
import websocket from '@fastify/websocket'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { createClient } from '@supabase/supabase-js'
import { conversationRoutes } from './routes/conversations.js'
import { assistantRoutes } from './routes/assistants.js'
import { logger } from './lib/logger.js'

const fastify = Fastify({
  logger: process.env.NODE_ENV === 'development' ? {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  } : true,
})

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''
const KB_SERVICE_URL = process.env.KB_SERVICE_URL || 'http://localhost:8000'
const PORT = parseInt(process.env.PORT || '3001', 10)
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Register plugins
await fastify.register(cors, {
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      cb(null, true)
      return
    }
    
    // Check if origin is allowed
    if (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*')) {
      cb(null, true)
      return
    }
    
    cb(new Error('Not allowed by CORS'), false)
  },
  credentials: true,
})

await fastify.register(rateLimit, {
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
})

await fastify.register(websocket)

// Make supabase and KB service URL available to routes
fastify.decorate('supabase', supabase)
fastify.decorate('kbServiceUrl', KB_SERVICE_URL)

// Register routes
await fastify.register(conversationRoutes, { prefix: '/api/v1' })
await fastify.register(assistantRoutes, { prefix: '/api/v1' })

// Health check
fastify.get('/health', async () => {
  // Check KB service health
  let kbStatus = 'unknown'
  try {
    const response = await fetch(`${KB_SERVICE_URL}/health`)
    if (response.ok) {
      kbStatus = 'ok'
    }
  } catch (error) {
    kbStatus = 'error'
  }
  
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      api: 'ok',
      kb: kbStatus,
      database: SUPABASE_URL ? 'configured' : 'not_configured',
    },
  }
})

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' })
    logger.info(`🚀 API server running on port ${PORT}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
