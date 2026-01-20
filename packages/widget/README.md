# Resonance Widget

Embeddable React chat widget for customer websites.

## Usage

### Option 1: Script Tag (Recommended)

```html
<script
  src="https://cdn.resonance.ai/widget.js"
  data-assistant-id="your-assistant-id"
  data-api-url="https://api.resonance.ai"
  data-primary-color="#0ea5e9"
  data-position="bottom-right"
></script>
```

### Option 2: NPM Package

```bash
npm install @resonance/widget
```

```tsx
import { initResonance } from '@resonance/widget'

initResonance({
  assistantId: 'your-assistant-id',
  apiUrl: 'https://api.resonance.ai',
  primaryColor: '#0ea5e9',
  position: 'bottom-right',
})
```

## Build

```bash
npm run build
```

Outputs to `dist/` directory.
