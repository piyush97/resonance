import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { timingSafeEqual } from 'node:crypto'

const createAssistantSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  instructions: z.string().optional(),
  model: z.string().default('llama3.2:latest'),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().optional(),
})

const updateAssistantSchema = createAssistantSchema.partial()

function extractBearerToken(authorizationHeader: unknown): string | null {
  if (typeof authorizationHeader !== 'string') return null
  const [scheme, token] = authorizationHeader.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null
  return token.trim() || null
}

function timingSafeEqualsString(a: string, b: string): boolean {
  // timingSafeEqual throws if buffer lengths differ
  const aBuf = Buffer.from(a, 'utf8')
  const bBuf = Buffer.from(b, 'utf8')
  if (aBuf.length !== bBuf.length) return false
  return timingSafeEqual(aBuf, bBuf)
}

export async function assistantRoutes(fastify: FastifyInstance) {
  // SECURITY: These routes use a Supabase service-role key (RLS bypass) via fastify.supabase.
  // Treat them as admin-only and require an API key.
  fastify.addHook('preHandler', async (request, reply) => {
    const configuredKey = process.env.ADMIN_API_KEY

    if (!configuredKey) {
      request.log.error('ADMIN_API_KEY is not set; refusing assistant routes')
      return reply.code(500).send({ error: 'Server misconfigured' })
    }

    const bearer = extractBearerToken(request.headers.authorization)
    const headerKey = typeof request.headers['x-api-key'] === 'string' ? request.headers['x-api-key'] : null
    const provided = bearer || headerKey

    if (!provided || !timingSafeEqualsString(provided, configuredKey)) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }
  })

  // Create assistant
  fastify.post('/assistants', async (request: FastifyRequest, reply: FastifyReply) => {
    const result = createAssistantSchema.safeParse(request.body)
    
    if (!result.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: result.error.issues,
      })
    }
    
    const body = result.data
    const supabase = (fastify as any).supabase
    
    const { data, error } = await supabase
      .from('assistants')
      .insert({
        name: body.name,
        description: body.description,
        instructions: body.instructions || 'You are a helpful customer service assistant.',
        model: body.model,
        temperature: body.temperature,
        max_tokens: body.max_tokens,
        status: 'active',
      })
      .select()
      .single()
    
    if (error) {
      request.log.error({ err: error }, 'Failed to create assistant')
      reply.code(500).send({ error: 'Internal server error' })
      return
    }
    
    return data
  })

  // List assistants
  fastify.get('/assistants', async (request: FastifyRequest, reply: FastifyReply) => {
    const supabase = (fastify as any).supabase
    
    const { data, error } = await supabase
      .from('assistants')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      request.log.error({ err: error }, 'Failed to list assistants')
      reply.code(500).send({ error: 'Internal server error' })
      return
    }
    
    return { assistants: data }
  })

  // Get assistant by ID
  fastify.get('/assistants/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const supabase = (fastify as any).supabase
    
    const { data, error } = await supabase
      .from('assistants')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      reply.code(404).send({ error: 'Assistant not found' })
      return
    }
    
    return data
  })

  // Update assistant
  fastify.patch('/assistants/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const result = updateAssistantSchema.safeParse(request.body)
    
    if (!result.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: result.error.issues,
      })
    }
    
    const body = result.data
    const supabase = (fastify as any).supabase
    
    const { data, error } = await supabase
      .from('assistants')
      .update(body)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      request.log.error({ err: error }, 'Failed to update assistant')
      reply.code(500).send({ error: 'Internal server error' })
      return
    }
    
    return data
  })

  // Delete assistant
  fastify.delete('/assistants/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const supabase = (fastify as any).supabase
    
    const { error } = await supabase
      .from('assistants')
      .delete()
      .eq('id', id)
    
    if (error) {
      request.log.error({ err: error }, 'Failed to delete assistant')
      reply.code(500).send({ error: 'Internal server error' })
      return
    }
    
    return { success: true }
  })

  // Upload document to assistant's knowledge base
  fastify.post('/assistants/:id/documents', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const kbServiceUrl = (fastify as any).kbServiceUrl
    
    // Forward to KB service
    // TODO: Handle multipart file upload and forward to KB service
    
    return {
      message: 'Document upload endpoint - implementation pending',
      assistant_id: id,
    }
  })
}
