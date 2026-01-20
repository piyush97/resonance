import Fastify from 'fastify'
import websocket from '@fastify/websocket'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { createClient } from '@supabase/supabase-js'
import { conversationRoutes } from './routes/conversations.js'
import { logger } from './lib/logger.js'

const fastify = Fastify({
  logger: logger,
})

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''
const PORT = parseInt(process.env.PORT || '3001', 10)

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Register plugins
await fastify.register(cors, {
  origin: true,
})

await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
})

await fastify.register(websocket)

// Register routes
await fastify.register(conversationRoutes, { prefix: '/api/v1' })

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
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
