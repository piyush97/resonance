-- Resonance Database Schema
-- Run this in Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CUSTOMERS (Workspaces)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255),
    subscription_tier VARCHAR(50) DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'pro', 'enterprise')),
    monthly_conversation_limit INT DEFAULT 5000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ASSISTANTS (AI chatbots per workspace)
CREATE TABLE assistants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT DEFAULT 'You are a helpful customer service assistant.',
    model VARCHAR(100) DEFAULT 'llama3.2:latest',
    temperature FLOAT DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
    max_tokens INT,
    system_prompt TEXT,
    tone VARCHAR(50) DEFAULT 'friendly' CHECK (tone IN ('friendly', 'professional', 'casual')),
    escalation_threshold FLOAT DEFAULT 0.6 CHECK (escalation_threshold >= 0 AND escalation_threshold <= 1),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'training', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_assistants_customer_id ON assistants(customer_id);

-- CONVERSATIONS
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assistant_id UUID REFERENCES assistants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    channel VARCHAR(50) DEFAULT 'web' CHECK (channel IN ('web', 'slack', 'whatsapp', 'email')),
    visitor_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'escalated')),
    satisfaction_score INT CHECK (satisfaction_score >= 0 AND satisfaction_score <= 5),
    resolution_time_seconds INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversations_assistant_created ON conversations(assistant_id, created_at DESC);
CREATE INDEX idx_conversations_customer_status ON conversations(customer_id, status);

-- MESSAGES
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('user', 'assistant', 'human_agent')),
    sender_id VARCHAR(255),
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'card')),
    tokens_used INT,
    latency_ms INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);

-- ESCALATIONS
CREATE TABLE escalations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    reason VARCHAR(50) CHECK (reason IN ('low_confidence', 'user_request', 'no_match')),
    escalated_to VARCHAR(255),
    resolved_by VARCHAR(255),
    resolution_time_seconds INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- KNOWLEDGE BASE DOCUMENTS
CREATE TABLE kb_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assistant_id UUID REFERENCES assistants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    source_type VARCHAR(50) CHECK (source_type IN ('pdf', 'notion', 'url', 'manual')),
    pinecone_doc_id VARCHAR(255),
    token_count INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kb_documents_assistant ON kb_documents(assistant_id);

-- INTEGRATIONS
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    integration_type VARCHAR(50) NOT NULL CHECK (integration_type IN ('slack', 'zendesk', 'hubspot', 'stripe')),
    api_key_encrypted VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sync_at TIMESTAMP WITH TIME ZONE
);

-- ANALYTICS EVENTS (for tracking)
CREATE TABLE analytics_events (
    id BIGSERIAL PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_customer_created ON analytics_events(customer_id, created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
-- (These will be configured based on your auth setup)
-- Example:
-- CREATE POLICY "Users can view own customers" ON customers
--   FOR SELECT USING (auth.uid() = id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assistants_updated_at BEFORE UPDATE ON assistants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kb_documents_updated_at BEFORE UPDATE ON kb_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
