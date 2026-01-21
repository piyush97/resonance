import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { chatWithRAG } from '../lib/kb-service.js'

const createConversationSchema = z.object({
  visitor_id: z.string(),
  channel: z.enum(['web', 'slack', 'whatsapp', 'email']),
  initial_message: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

export async function conversationRoutes(fastify: FastifyInstance) {
  // Create new conversation
  fastify.post('/conversations/create', async (request: FastifyRequest, reply: FastifyReply) => {
    const result = createConversationSchema.safeParse(request.body)
    
    if (!result.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: result.error.issues,
      })
    }
    
    const body = result.data
    
    // TODO: Create conversation in database
    // TODO: Initialize WebSocket connection
    
    return {
      conversation_id: `conv_${Date.now()}`,
      ws_url: `wss://api.resonance.ai/ws/${Date.now()}`,
    }
  })

  // Get conversation history
  fastify.get('/conversations/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    
    // TODO: Fetch from database
    
    return {
      conversation_id: id,
      messages: [],
      status: 'active',
    }
  })

  // WebSocket handler for real-time messaging
  fastify.register(async function (fastify) {
    fastify.get('/conversations/:id/ws', { websocket: true }, (socket, req) => {
      const { id } = req.params as { id: string }
      
      socket.on('message', async (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString())
          
          if (data.type === 'message') {
            try {
              // Get AI response from KB service (RAG pipeline)
              const chatResponse = await chatWithRAG({
                query: data.content,
                assistant_id: data.assistant_id || 'default',
                conversation_history: data.history || [],
              })
              
              socket.send(JSON.stringify({
                type: 'response',
                content: chatResponse.response,
                sources: chatResponse.sources,
              }))
            } catch (error) {
              console.error('Chat error:', error)
              socket.send(JSON.stringify({
                type: 'error',
                message: 'Failed to generate response',
              }))
            }
          }
        } catch (error) {
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Failed to process message',
          }))
        }
      })
      
      socket.on('close', () => {
        fastify.log.info(`WebSocket closed for conversation ${id}`)
      })
      
      socket.on('error', (error: Error) => {
        fastify.log.error({ err: error }, `WebSocket error for conversation ${id}`)
      })
    })
  })
}
