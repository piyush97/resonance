# Resonance Testing Guide

## Test Summary

| Service | Tests | Status |
|---------|-------|--------|
| API (Node.js) | 44 | ✅ All Passing |
| KB (Python) | 12 | ✅ All Passing |
| **Total** | **56** | **✅ All Passing** |

## Running Tests

### All Tests (Node.js)
```bash
npm run test
```

### Watch Mode
```bash
npm run test:watch
```

### With Coverage
```bash
npm run test:coverage
```

### API Tests Only
```bash
npm run test:api
```

### Widget Tests Only
```bash
npm run test:widget
```

### Python KB Service Tests
```bash
cd services/kb
source venv/bin/activate
python -m pytest tests/ -v
```

### Python Tests with Coverage
```bash
cd services/kb
source venv/bin/activate
python -m pytest tests/ --cov=services --cov-report=html
```

## Test Categories

### Unit Tests (No Running Services Required)
- Schema validation (Zod)
- Type checking
- Utility functions
- Component exports

### Integration Tests (Requires Running Services)
- API health checks
- Endpoint responses
- WebSocket connections

Integration tests gracefully skip when services aren't running.

## Test Files

### API Service (`apps/api/src/__tests__/`)
- `unit.test.ts` - Schema validation, utilities
- `health.test.ts` - Health endpoint integration
- `conversations.test.ts` - Conversation API integration
- `kb-service.test.ts` - KB service integration

### Widget (`packages/widget/src/__tests__/`)
- `ChatWidget.test.tsx` - Component types and exports

### KB Service (`services/kb/tests/`)
- `test_health.py` - Health endpoints
- `test_ingestion.py` - Document processing
- `test_retrieval.py` - Search and RAG

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run test
      
  test-python:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: |
          cd services/kb
          pip install -r requirements.txt
          python -m pytest tests/ -v
```

## Writing New Tests

### TypeScript/Vitest
```typescript
import { describe, it, expect } from 'vitest'

describe('Feature', () => {
  it('should do something', () => {
    expect(true).toBe(true)
  })
})
```

### Python/Pytest
```python
import pytest

class TestFeature:
    def test_something(self):
        assert True
    
    @pytest.mark.asyncio
    async def test_async_something(self):
        result = await some_async_function()
        assert result is not None
```
