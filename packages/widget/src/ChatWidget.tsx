import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Array<{ source: string; score: number }>
}

interface ChatWidgetProps {
  apiUrl?: string
  assistantId: string
  primaryColor?: string
  position?: 'bottom-right' | 'bottom-left'
  welcomeMessage?: string
  title?: string
  subtitle?: string
}

export function ChatWidget({
  apiUrl = 'http://localhost:3001',
  assistantId,
  primaryColor = '#0ea5e9',
  position = 'bottom-right',
  welcomeMessage = 'Hi! How can I help you today?',
  title = 'Chat with us',
  subtitle = "We're here to help",
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Initialize conversation when widget opens
  const initConversation = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/conversations/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_id: `visitor_${Date.now()}`,
          channel: 'web',
          metadata: { assistant_id: assistantId },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setConversationId(data.conversation_id)
        setIsConnected(true)
        
        // Connect WebSocket for real-time messaging
        connectWebSocket(data.conversation_id)
      }
    } catch (error) {
      console.error('Failed to initialize conversation:', error)
      setIsConnected(false)
    }
  }, [apiUrl, assistantId])

  // WebSocket connection for real-time chat
  const connectWebSocket = useCallback((convId: string) => {
    const wsUrl = apiUrl.replace('http', 'ws')
    const ws = new WebSocket(`${wsUrl}/api/v1/conversations/${convId}/ws`)

    ws.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'response') {
          const assistantMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.content,
            timestamp: new Date(),
            sources: data.sources,
          }
          setMessages((prev) => [...prev, assistantMessage])
          setIsLoading(false)
        } else if (data.type === 'error') {
          const errorMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.message || 'Sorry, I encountered an error. Please try again.',
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errorMessage])
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsConnected(false)
    }

    wsRef.current = ws
  }, [apiUrl])

  // Initialize when widget opens
  useEffect(() => {
    if (isOpen && !conversationId) {
      initConversation()
    }
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, conversationId, initConversation])

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message via WebSocket or fallback to REST
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const messageContent = inputValue
    setInputValue('')
    setIsLoading(true)

    // Try WebSocket first
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        content: messageContent,
        assistant_id: assistantId,
        history: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }))
    } else {
      // Fallback to REST API
      try {
        const response = await fetch(`${apiUrl}/api/v1/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: messageContent,
            assistant_id: assistantId,
            conversation_id: conversationId,
            history: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const assistantMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.response || data.content,
            timestamp: new Date(),
            sources: data.sources,
          }
          setMessages((prev) => [...prev, assistantMessage])
        } else {
          throw new Error('API request failed')
        }
      } catch (error) {
        console.error('Chat error:', error)
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    }
  }

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  }

  return (
    <div className={`resonance-widget ${positionClasses[position]}`}>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="resonance-button"
          style={{ backgroundColor: primaryColor }}
          aria-label="Open chat"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="resonance-window">
          {/* Header */}
          <div className="resonance-header" style={{ backgroundColor: primaryColor }}>
            <div>
              <h3 className="resonance-title">{title}</h3>
              <p className="resonance-subtitle">
                {isConnected ? subtitle : 'Connecting...'}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="resonance-close"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="resonance-messages">
            {messages.length === 0 && (
              <div className="resonance-empty">
                <p>{welcomeMessage}</p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`resonance-message ${
                  message.role === 'user' ? 'resonance-message-user' : 'resonance-message-assistant'
                }`}
              >
                <div className="resonance-message-content">{message.content}</div>
                {message.sources && message.sources.length > 0 && (
                  <div className="resonance-sources">
                    <span className="resonance-sources-label">Sources:</span>
                    {message.sources.slice(0, 3).map((source, idx) => (
                      <span key={idx} className="resonance-source-tag">
                        {source.source}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="resonance-message resonance-message-assistant">
                <div className="resonance-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="resonance-input-container">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="resonance-input"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="resonance-send"
              style={{ backgroundColor: primaryColor }}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>

          {/* Powered by */}
          <div className="resonance-powered-by">
            Powered by <a href="https://resonance.ai" target="_blank" rel="noopener noreferrer">Resonance</a>
          </div>
        </div>
      )}
    </div>
  )
}
