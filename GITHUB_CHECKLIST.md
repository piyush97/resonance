# GitHub Push Checklist

## ✅ What to Push

### Source Code
- ✅ All `.ts`, `.tsx`, `.py`, `.js`, `.jsx` files
- ✅ `package.json`, `requirements.txt`
- ✅ `tsconfig.json`, `vite.config.ts`
- ✅ `next.config.js`, `tailwind.config.js`
- ✅ `turbo.json` (monorepo config)

### Configuration Templates
- ✅ `.env.example` files (NOT `.env`!)
- ✅ `README.md` files
- ✅ Documentation in `docs/`

### Project Files
- ✅ `.gitignore`
- ✅ `LICENSE` (if you create one)
- ✅ Project documentation (`.md` files)

## ❌ What NOT to Push (Already in .gitignore)

### Environment Files (CRITICAL!)
- ❌ `.env` files (contain secrets!)
- ❌ `.env.local`, `.env.development.local`
- ❌ Any file with API keys or passwords

### Dependencies
- ❌ `node_modules/` (too large, reinstall with `npm install`)
- ❌ `venv/` (Python virtual env, recreate with `python -m venv venv`)

### Build Artifacts
- ❌ `.next/`, `out/`, `build/`, `dist/`
- ❌ `__pycache__/`, `*.pyc`
- ❌ `.turbo/` (Turborepo cache)

### IDE Files
- ❌ `.vscode/`, `.idea/`
- ❌ `*.swp`, `*.swo` (Vim)

### Logs
- ❌ `*.log` files
- ❌ `npm-debug.log*`

### OS Files
- ❌ `.DS_Store` (macOS)
- ❌ `Thumbs.db` (Windows)

### Large Files
- ❌ AI models (`.pt`, `.pth`, `.onnx`)
- ❌ Database files (`.db`, `.sqlite`)

## 🔒 Security Check

Before pushing, verify these are in `.gitignore`:

```bash
# Check for secrets
grep -r "PINECONE_API_KEY" . --exclude-dir=node_modules --exclude-dir=venv --exclude="*.md"
grep -r "OPENAI_API_KEY" . --exclude-dir=node_modules --exclude-dir=venv --exclude="*.md"
grep -r "SUPABASE_SERVICE_KEY" . --exclude-dir=node_modules --exclude-dir=venv --exclude="*.md"
```

If any `.env` files show up, they should be in `.gitignore`!

## 📝 Create .env.example Files

Make sure you have `.env.example` templates:

### services/kb/.env.example
```env
# Embeddings
EMBEDDING_PROVIDER=pinecone
PINECONE_INDEX_NAME=your-index-name
PINECONE_EMBEDDING_MODEL=llama-text-embed-v2

# LLM
LLM_PROVIDER=local
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.2:latest

# Pinecone
PINECONE_API_KEY=your-pinecone-api-key-here
PINECONE_ENVIRONMENT=us-east-1

# Server
PORT=8000
ENVIRONMENT=development
```

### apps/api/.env.example
```env
# Server
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here

# KB Service
KB_SERVICE_URL=http://localhost:8000

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
```

### apps/web/.env.example
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Supabase (for auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🚀 Push to GitHub

### First Time Setup

```bash
# Initialize git (if not already)
cd /home/piyushmehta/Projects/Personal/Project
git init

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/resonance.git

# Add all files
git add .

# Check what will be committed (verify no secrets!)
git status

# Commit
git commit -m "Initial commit: Resonance AI chatbot MVP

- KB service with Pinecone + Ollama
- API service with WebSocket
- Next.js landing page
- React chat widget
- 100% free AI stack ($0/month)
- All services working locally"

# Push
git push -u origin main
```

### Regular Updates

```bash
# Add changes
git add .

# Commit with descriptive message
git commit -m "feat: add dashboard UI for assistant management"

# Push
git push
```

## 📊 Repository Setup

### README.md Structure

Your main `README.md` should have:
- Project description
- Features list
- Tech stack
- Quick start guide
- Installation instructions
- License
- Contributing guidelines

### Add a LICENSE

Recommended: MIT License (most permissive for open source)

```bash
# Create LICENSE file
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2026 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
```

## 🎯 What to Share Publicly

### Safe to Share:
- ✅ All source code
- ✅ Architecture diagrams
- ✅ Documentation
- ✅ Setup instructions
- ✅ Demo videos
- ✅ Screenshots

### Keep Private:
- ❌ API keys
- ❌ Database credentials
- ❌ Customer data
- ❌ Private business metrics (until you want to share)

## 📢 After Pushing

1. **Update GitHub repo**:
   - Add description
   - Add topics/tags: `ai`, `chatbot`, `saas`, `b2b`, `rag`, `ollama`, `pinecone`
   - Add website URL (when deployed)

2. **Share on social media**:
   - "Just open-sourced Resonance on GitHub!"
   - Include repo link
   - Highlight: 100% free AI stack

3. **Add to profile**:
   - Pin repo on GitHub profile
   - Add to LinkedIn projects
   - Add to Indie Hackers profile

---

**Ready to push?** Run the security check first, then push to GitHub!
