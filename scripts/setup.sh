#!/bin/bash

# Resonance Setup Script
# This script helps set up the development environment

set -e

echo "🎯 Resonance Development Setup"
echo "==============================="

# Check prerequisites
echo ""
echo "📋 Checking prerequisites..."

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js 20+"
    exit 1
fi

# Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✅ Python: $PYTHON_VERSION"
else
    echo "❌ Python not found. Please install Python 3.12+"
    exit 1
fi

# npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm not found"
    exit 1
fi

# Ollama (optional)
if command -v ollama &> /dev/null; then
    echo "✅ Ollama: installed"
else
    echo "⚠️  Ollama not found. Install for local AI: https://ollama.ai"
fi

# Install Node.js dependencies
echo ""
echo "📦 Installing Node.js dependencies..."
npm install

# Set up Python virtual environment
echo ""
echo "🐍 Setting up Python environment..."
cd services/kb
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
cd ../..

# Create .env files if they don't exist
echo ""
echo "🔧 Setting up environment files..."

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created .env (please update with your values)"
else
    echo "ℹ️  .env already exists"
fi

if [ ! -f "apps/api/.env" ]; then
    cat > apps/api/.env << EOF
PORT=3001
NODE_ENV=development
KB_SERVICE_URL=http://localhost:8000
ADMIN_API_KEY=dev-admin-key-change-in-production
KB_SERVICE_API_KEY=dev-kb-key-change-in-production
ALLOWED_ORIGINS=http://localhost:3000
EOF
    echo "✅ Created apps/api/.env"
else
    echo "ℹ️  apps/api/.env already exists"
fi

if [ ! -f "services/kb/.env" ]; then
    cat > services/kb/.env << EOF
PORT=8000
ENVIRONMENT=development
LLM_PROVIDER=local
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.2:latest
EMBEDDING_PROVIDER=local
LOCAL_EMBEDDING_MODEL=all-MiniLM-L6-v2
KB_SERVICE_API_KEY=dev-kb-key-change-in-production
ALLOWED_ORIGINS=http://localhost:3000
EOF
    echo "✅ Created services/kb/.env"
else
    echo "ℹ️  services/kb/.env already exists"
fi

# Pull Ollama model if available
if command -v ollama &> /dev/null; then
    echo ""
    echo "🤖 Checking Ollama models..."
    if ! ollama list | grep -q "llama3.2"; then
        echo "Pulling llama3.2 model (this may take a while)..."
        ollama pull llama3.2:latest
    else
        echo "✅ llama3.2 model already available"
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env files with your Supabase and Pinecone credentials"
echo "2. Run the database schema: docs/supabase-schema.sql"
echo "3. Start services:"
echo "   - KB Service: cd services/kb && source venv/bin/activate && python main.py"
echo "   - API Service: cd apps/api && npm run dev"
echo "   - Web Dashboard: cd apps/web && npm run dev"
echo ""
echo "Or use Docker Compose: docker-compose up"
