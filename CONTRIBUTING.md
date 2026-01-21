# Contributing to Resonance

Thanks for your interest in contributing to Resonance! This document provides guidelines and instructions for contributing.

## 🚀 Quick Start

```bash
# Fork and clone the repo
git clone https://github.com/YOUR_USERNAME/resonance.git
cd resonance

# Install dependencies
npm install

# Set up Python environment for KB service
cd services/kb
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
cd ../..

# Start development servers
npm run dev
```

## 📁 Project Structure

```
resonance/
├── apps/
│   ├── web/              # Next.js dashboard (TypeScript)
│   └── api/              # Fastify API service (TypeScript)
├── services/
│   └── kb/               # FastAPI knowledge base (Python)
├── packages/
│   └── widget/           # React chat widget (TypeScript)
├── docs/                 # Documentation
└── scripts/              # Setup and utility scripts
```

## 🔧 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Your Changes

- Follow the existing code style
- Add tests for new functionality
- Update documentation if needed

### 3. Run Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- apps/api
npm test -- packages/widget

# Run Python tests
cd services/kb
pytest
```

### 4. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
git commit -m "feat: add Slack integration"

# Bug fixes
git commit -m "fix: resolve WebSocket reconnection issue"

# Documentation
git commit -m "docs: update API reference"

# Tests
git commit -m "test: add conversation flow tests"

# Refactoring
git commit -m "refactor: simplify RAG pipeline"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 📝 Code Style

### TypeScript (apps/api, apps/web, packages/widget)

- Use TypeScript strict mode
- Prefer `const` over `let`
- Use async/await over callbacks
- Add JSDoc comments for public APIs

```typescript
/**
 * Creates a new conversation
 * @param visitorId - Unique visitor identifier
 * @param channel - Communication channel (web, slack, etc.)
 * @returns Conversation object with ID and WebSocket URL
 */
export async function createConversation(
  visitorId: string,
  channel: Channel
): Promise<Conversation> {
  // Implementation
}
```

### Python (services/kb)

- Follow PEP 8
- Use type hints
- Add docstrings for functions

```python
async def search_knowledge_base(
    query: str,
    assistant_id: str,
    top_k: int = 5
) -> List[Dict]:
    """
    Search the knowledge base for relevant documents.
    
    Args:
        query: Search query text
        assistant_id: ID of the assistant's knowledge base
        top_k: Number of results to return
        
    Returns:
        List of matching documents with scores
    """
    # Implementation
```

### React Components

- Use functional components with hooks
- Prefer named exports
- Keep components focused and small

```tsx
export function ChatMessage({ message, isUser }: ChatMessageProps) {
  return (
    <div className={isUser ? 'message-user' : 'message-assistant'}>
      {message.content}
    </div>
  )
}
```

## 🧪 Testing Guidelines

### What to Test

- **Unit tests**: Individual functions and components
- **Integration tests**: API endpoints, database operations
- **E2E tests**: Critical user flows

### Test File Naming

```
src/
├── lib/
│   └── kb-service.ts
└── __tests__/
    └── kb-service.test.ts
```

### Example Test

```typescript
import { describe, it, expect } from 'vitest'

describe('KnowledgeBaseService', () => {
  describe('search', () => {
    it('should return relevant results for valid query', async () => {
      const results = await searchKnowledgeBase('pricing', 'test-assistant')
      
      expect(results).toHaveLength(5)
      expect(results[0]).toHaveProperty('content')
      expect(results[0]).toHaveProperty('score')
    })

    it('should return empty array for no matches', async () => {
      const results = await searchKnowledgeBase('xyznonexistent', 'test-assistant')
      
      expect(results).toHaveLength(0)
    })
  })
})
```

## 📚 Documentation

- Update README.md for user-facing changes
- Add JSDoc/docstrings for new APIs
- Update docs/ for architectural changes

## 🐛 Bug Reports

Please include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: How to trigger the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, Node version, Python version

## 💡 Feature Requests

Please include:

1. **Problem**: What problem does this solve?
2. **Solution**: Proposed solution
3. **Alternatives**: Other approaches considered
4. **Use Case**: Who benefits from this?

## 🔒 Security

If you discover a security vulnerability, please email security@resonance.ai instead of creating a public issue.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Every contribution helps make Resonance better. We appreciate your time and effort!

---

Questions? Open an issue or reach out on Twitter [@PiyushMehtas](https://twitter.com/PiyushMehtas)
