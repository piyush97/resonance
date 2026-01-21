import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const createAssistantSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  instructions: z.string().optional(),
  model: z.string().default('llama3.2:latest'),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().optional(),
})

const updateAssistantSchema = createAssistantSchema.partial()

export async function assistantRoutes(fastify: FastifyInstance) {
  // Create assistant
  fastify.post('/assistants', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createAssistantSchema.parse(request.body)
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
      reply.code(500).send({ error: error.message })
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
      reply.code(500).send({ error: error.message })
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
    const body = updateAssistantSchema.parse(request.body)
    const supabase = (fastify as any).supabase
    
    const { data, error } = await supabase
      .from('assistants')
      .update(body)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      reply.code(500).send({ error: error.message })
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
      reply.code(500).send({ error: error.message })
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
