/**
 * Knowledge Base Service Client
 * Handles communication with the Python KB service
 */

const KB_SERVICE_URL = process.env.KB_SERVICE_URL || 'http://localhost:8000'
const KB_SERVICE_API_KEY = process.env.KB_SERVICE_API_KEY || ''

export interface ChatResponse {
  response: string
  sources: Array<{
    source: string
    score: number
  }>
}

export interface ChatRequest {
  query: string
  assistant_id: string
  conversation_history?: Array<{
    role: string
    content: string
  }>
  system_prompt?: string
}

export async function chatWithRAG(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${KB_SERVICE_URL}/api/knowledge-base/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(KB_SERVICE_API_KEY ? { Authorization: `Bearer ${KB_SERVICE_API_KEY}` } : {}),
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    // Avoid bubbling up upstream error bodies (may include internal details).
    throw new Error(`KB Service error (${response.status})`)
  }

  return (await response.json()) as ChatResponse
}
