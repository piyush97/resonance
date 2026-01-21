# Dependency Update Fixes - January 21, 2026

## Issues Fixed

### 1. Tailwind CSS v4 Breaking Changes
**Error**: `tailwindcss directly as a PostCSS plugin` error

**Fix**: 
- Installed `@tailwindcss/postcss` package
- Updated `postcss.config.js` to use `@tailwindcss/postcss` instead of `tailwindcss`
- Converted `globals.css` to use `@import "tailwindcss"` and `@theme` block
- Deleted `tailwind.config.js` (v4 uses CSS-based config)

### 2. Zod v4 Breaking Changes
**Error**: `Expected 2-3 arguments, but got 1` for `z.record()`

**Fix**:
- Changed `z.record(z.any())` to `z.record(z.string(), z.any())`
- Zod v4 requires both key and value types for `z.record()`

### 3. React 19 JSX Transform
**Error**: `'React' is declared but its value is never read`

**Fix**:
- Removed unused `React` imports (React 19 doesn't need them)
- Added `void` statements for intentionally unused props (apiUrl, assistantId)

### 4. Turbo v2.7.5 Config Changes
**Error**: `Found 'pipeline' field instead of 'tasks'`

**Fix**:
- Renamed `pipeline` to `tasks` in `turbo.json`

### 5. Package Manager Field
**Error**: `Missing packageManager field in package.json`

**Fix**:
- Added `"packageManager": "npm@11.7.0"` to root `package.json`

## Current Stack (All Latest)

| Package | Version | Notes |
|---------|---------|-------|
| Next.js | 16.1.4 | Published 1 day ago |
| React | 19.2.3 | Latest stable |
| Vite | 7.3.1 | Latest |
| Tailwind CSS | 4.1.18 | v4 with new CSS config |
| Zod | 4.3.5 | Breaking API changes |
| Fastify | 5.7.1 | Latest |
| TypeScript | 5.9.3 | Latest |
| Turbo | 2.7.5 | Latest |

## Services Status

All services running successfully:
- ✅ Web Dashboard: http://localhost:3000
- ✅ API Service: http://localhost:3001
- ✅ Widget Dev: http://localhost:5173
- ⚠️ KB Service: Needs separate start (Python)

## Commands

```bash
# Start all services
npm run dev

# Start KB service separately
cd services/kb && source venv/bin/activate && python main.py
```
