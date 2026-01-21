# Resonance Testing Guide

## Test Summary

| Service | Framework | Tests | Status |
|---------|-----------|-------|--------|
| API (Node.js) | Vitest | 77 | ✅ Passing |
| KB (Python) | Pytest | 40 | ✅ Passing |
| **Total** | | **117** | ✅ **All Passing** |

## Running Tests

### All Tests (Node.js)

```bash
# From project root
npm test

# With coverage
npm run test:coverage
```

### Python Tests (KB Service)

```bash
cd services/kb
source venv/bin/activate
pytest tests/ -v
```

## Test Categories

### Unit Tests

Test individual functions and schemas without external dependencies.

**API (`apps/api/src/__tests__/unit.test.ts`)**
- Schema validation (Conversation, Assistant)
- Utility functions (ID generation, URL formatting)
- Message type validation

**KB (`services/kb/tests/test_ingestion.py`, `test_llm.py`)**
- Document chunking
- Text extraction
- LLM configuration
- Temperature handling

### Integration Tests

Test API endpoints and service interactions.

**API (`apps/api/src/__tests__/`)**
- `health.test.ts` - Health endpoint, CORS
- `conversations.test.ts` - Conversation CRUD, validation
- `kb-service.test.ts` - KB service integration

**KB (`services/kb/tests/`)**
- `test_health.py` - Health endpoints
- `test_retrieval.py` - Search functionality
- `test_e2e.py` - Full endpoint testing

### E2E Tests

Test complete user flows across services.

**API (`apps/api/src/__tests__/e2e.test.ts`)**
- Conversation lifecycle
- Assistant management
- RAG chat flow
- Error handling
- Rate limiting

**KB (`services/kb/tests/test_e2e.py`)**
- Search endpoint
- Chat endpoint
- Upload endpoint
- CORS configuration

### Component Tests

Test React components and widget logic.

**Widget (`packages/widget/src/__tests__/ChatWidget.test.tsx`)**
- Props interface validation
- Configuration types
- Message structure
- Position classes
- Widget initialization

**Dashboard (`apps/web/src/__tests__/dashboard.test.tsx`)**
- Stats calculations
- Form validation
- Analytics calculations
- Widget configuration

## Test Coverage

To generate coverage reports:

```bash
# Node.js coverage
npm run test:coverage

# Python coverage
cd services/kb
pytest tests/ --cov=services --cov-report=html
```

## Writing New Tests

### Node.js (Vitest)

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('FeatureName', () => {
  beforeAll(async () => {
    // Setup
  })

  afterAll(async () => {
    // Cleanup
  })

  it('should do something', async () => {
    const result = await someFunction()
    expect(result).toBeDefined()
  })
})
```

### Python (Pytest)

```python
import pytest
from unittest.mock import AsyncMock, patch

class TestFeatureName:
    @pytest.mark.asyncio
    async def test_should_do_something(self, client):
        response = await client.get("/endpoint")
        assert response.status_code == 200
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Scheduled daily runs

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
```

## Troubleshooting

### Tests Skipping

If tests are skipping, ensure services are running:

```bash
# Start KB service
cd services/kb && source venv/bin/activate && python main.py

# Start API
cd apps/api && npm run dev
```

### Environment Variables

Tests may require these environment variables:

```bash
export API_URL=http://localhost:3001
export KB_SERVICE_URL=http://localhost:8000
export SKIP_E2E_TESTS=false
```

### Mock Failures

If mocks aren't working, check import paths match the actual module structure.
