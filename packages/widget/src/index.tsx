import { createRoot } from 'react-dom/client'
import { ChatWidget } from './ChatWidget'
import './styles.css'

interface ResonanceConfig {
  apiUrl?: string
  assistantId: string
  primaryColor?: string
  position?: 'bottom-right' | 'bottom-left'
  welcomeMessage?: string
  title?: string
  subtitle?: string
}

// Initialize widget
export function initResonance(config: ResonanceConfig) {
  const widgetContainer = document.createElement('div')
  widgetContainer.id = 'resonance-widget-container'
  document.body.appendChild(widgetContainer)

  const root = createRoot(widgetContainer)
  root.render(<ChatWidget {...config} />)
}

// Auto-initialize if data attributes are present
if (typeof window !== 'undefined') {
  const script = document.currentScript as HTMLScriptElement
  if (script) {
    const assistantId = script.getAttribute('data-assistant-id')
    const apiUrl = script.getAttribute('data-api-url') || 'http://localhost:3001'
    const primaryColor = script.getAttribute('data-primary-color') || '#0ea5e9'
    const position = (script.getAttribute('data-position') || 'bottom-right') as 'bottom-right' | 'bottom-left'

    if (assistantId) {
      initResonance({
        assistantId,
        apiUrl,
        primaryColor,
        position,
      })
    }
  }
}

export { ChatWidget } from './ChatWidget'
