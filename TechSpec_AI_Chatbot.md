# TECHNICAL SPECIFICATION DOCUMENT
## AI-Powered Customer Service Chatbot Platform
### Version 1.0 | January 2026

---

## TABLE OF CONTENTS
1. Architecture Overview
2. Tech Stack Details
3. Database Schema
4. API Specification
5. Integration Architecture
6. Deployment & DevOps
7. Security & Compliance
8. Scalability Plan

---

## 1. ARCHITECTURE OVERVIEW

### 1.1 High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CUSTOMER LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Website Chat Widget │ Slack Bot │ WhatsApp │ Email Bridge  │
│         (React)      │ (Bolt)    │ (Twilio) │  (SendGrid)    │
└──────────────┬────────────────────────────────────────────────┘
               │
        ┌──────▼──────────────────────────────────┐
        │    API GATEWAY & LOAD BALANCER          │
        │  (Kong / AWS ALB + rate limiting)       │
        └──────┬───────────────────────────────────┘
               │
    ┌──────────┴──────────┬────────────────┐
    │                     │                 │
┌───▼────────────┐  ┌────▼──────────┐ ┌───▼──────────┐
│ CONVERSATION   │  │  KNOWLEDGE    │ │   ADMIN      │
│ SERVICE        │  │  BASE SERVICE │ │   DASHBOARD  │
│ (Node.js)      │  │  (Python)     │ │   (React)    │
│ WebSocket      │  │  LangChain    │ │   Next.js    │
│ Real-time      │  │  RAG Engine   │ │   Auth       │
└───┬────────────┘  └────┬──────────┘ └───┬──────────┘
    │                    │                  │
    └────────────────────┼──────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐   ┌──────▼──────┐  ┌────▼────┐
    │PostgreSQL│   │Vector Store │  │ Redis   │
    │Customers,│   │(Pinecone/   │  │Cache &  │
    │Chats,    │   │Weaviate)    │  │Sessions │
    │Analytics │   │Knowledge    │  │         │
    └──────────┘   └─────────────┘  └─────────┘

┌─────────────────────────────────────────────────┐
│        EXTERNAL SERVICES (API)                   │
├─────────────────────────────────────────────────┤
│ OpenAI/Claude  │ Integrations  │  Monitoring    │
│ (LLM)          │ (CRM, Email)  │  (DataDog)     │
└─────────────────────────────────────────────────┘
```

### 1.2 Data Flow: Conversation Processing

```
1. USER MESSAGE RECEIVED
   Customer types → WebSocket → Conversation Service

2. PREPROCESSING
   Input sanitization → Language detection → Tokenization

3. CONTEXT RETRIEVAL (RAG)
   Query embedding → Vector search (Pinecone)
   → Retrieve top 5 documents → Context assembly

4. LLM INFERENCE
   Prompt assembly:
   [System prompt] + [Context] + [Conversation history]
   → OpenAI API call → Stream response back

5. POST-PROCESSING
   Response validation → Sentiment check → Confidence scoring
   → Action detection (escalate? → trigger?)

6. RESPONSE DELIVERY
   Stream to chat widget → Save to database → Update analytics

7. ESCALATION (if needed)
   → Create Zendesk ticket → Notify support team → Context transfer
```

---

## 2. TECH STACK DETAILS

### 2.1 Frontend (Customer-Facing)

**Chat Widget (React 18 + TypeScript)**
```javascript
Technology Stack:
- React 18 for component architecture
- TypeScript for type safety
- WebSocket (Socket.io) for real-time messaging
- Zustand for state management
- TailwindCSS + shadcn/ui for styling
- Iframe sandboxed deployment

Key Features:
- Lightweight: <50KB gzipped
- Works on any website
- Markdown rendering support
- File upload capability
- Typing indicators + message status
- Accessibility: WCAG 2.1 AA compliant

Build & Deploy:
- Vite for bundling
- Deployed as CDN-served JS file
- Dynamic configuration via data-attributes
```

**Admin Dashboard (Next.js 14 + React)**
```javascript
Tech Stack:
- Next.js 14 (App Router)
- React 18 + TypeScript
- TailwindCSS + Shadcn UI components
- Recharts for analytics visualization
- React Query for data fetching
- Next-auth for authentication

Pages:
- /dashboard: Overview (ARR, conversations, satisfaction)
- /conversations: Chat history + analytics
- /kb-management: Upload/manage documents
- /settings: Branding, integrations, team
- /billing: Subscription management
- /analytics: Custom reports

Authentication:
- Next-auth with email/OAuth
- RBAC: Admin, Manager, Viewer roles
- SSO ready for enterprise
```

### 2.2 Backend Services

**Conversation Service (Node.js + TypeScript)**
```javascript
Framework: Express.js + NestJS for scalability

Responsibilities:
1. Real-time WebSocket connections (Socket.io)
2. Message routing (multiple channels)
3. Session management
4. Escalation workflows
5. Integration with LLM API

Key Endpoints:
POST   /api/conversations/new
POST   /api/conversations/:id/message
GET    /api/conversations/:id
POST   /api/conversations/:id/escalate
GET    /api/conversations/:id/history

Tech Stack:
- Express.js (lightweight alternative: Fastify)
- Socket.io for WebSocket + fallback
- Bull for job queue (message processing)
- Pino for structured logging
- Docker containerization

Performance Targets:
- Message latency: <500ms P99
- Concurrent connections: 10,000+
- Throughput: 1,000 msg/sec per instance
```

**Knowledge Base Service (Python 3.11 + FastAPI)**
```python
Responsibilities:
1. Document ingestion & parsing
2. RAG (Retrieval-Augmented Generation) pipeline
3. Embedding generation & storage
4. Semantic search

Tech Stack:
- FastAPI for REST API
- LangChain for LLM orchestration
- OpenAI Embeddings (or open-source alternatives)
- Pinecone/Weaviate for vector storage
- PyPDF2 + python-docx for document parsing
- Celery for async tasks (background processing)
- Pydantic for validation

Key Endpoints:
POST   /api/knowledge-base/upload
POST   /api/knowledge-base/parse
POST   /api/knowledge-base/embed
GET    /api/knowledge-base/search
DELETE /api/knowledge-base/document/:id

Pipeline:
1. File upload → Storage (S3)
2. Extract text (parallel processing)
3. Chunk text (512 tokens per chunk, 20% overlap)
4. Generate embeddings (batch: 100 at a time)
5. Store in vector DB with metadata
6. Index for semantic search

Performance Targets:
- Embedding generation: <1s per document
- Vector search: <50ms P99
- Memory: <2GB per instance
```

### 2.3 Data Layer

**PostgreSQL (Primary Database)**
```sql
Tables:
- customers (workspaces)
- conversations
- messages
- escalations
- integrations
- analytics_events
- audit_logs

Connection Pool:
- PgBouncer for connection pooling
- Max connections: 100 per app instance
- Replica for read-heavy analytics queries

Backup Strategy:
- Daily automated backups to S3
- Point-in-time recovery: 30 days
- Replication to standby instance
```

**Vector Database: Pinecone OR Weaviate**

**Option A: Pinecone (Managed)**
```
Pros:
- Fully managed (no ops)
- 99.95% SLA
- Hybrid search (vector + keyword)
- Cost: ~$70-200/month for startup scale

Cons:
- Vendor lock-in
- No self-hosting option
- Slightly higher latency (100-200ms)

Use Case: Recommended for MVP phase
```

**Option B: Weaviate (Self-hosted)**
```
Pros:
- Open-source (no vendor lock-in)
- Self-hosted (compliance friendly)
- Lower cost at scale
- Advanced features (BM25 hybrid search)

Cons:
- Requires ops/maintenance
- More complex setup
- Need to manage infrastructure

Use Case: Enterprise deployments
```

**Redis (Cache & Sessions)**
```
Usage:
- Session storage (Socket.io)
- Rate limiting
- Cache for frequent queries
- Pub/sub for real-time updates

Configuration:
- 5GB memory instance
- AOF persistence
- Cluster mode for HA
- TTL on all keys to prevent memory bloat
```

### 2.4 LLM Integration

**OpenAI API (Primary) + Claude Fallback**
```python
# RAG + Inference Flow

from langchain.chat_models import ChatOpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Pinecone
from langchain.chains import RetrievalQA

# Initialize
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",  # cheaper than large
    api_key=os.getenv("OPENAI_API_KEY")
)

vectorstore = Pinecone(
    index=pinecone_index,
    embedding_function=embeddings.embed_query
)

# Create RAG chain
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.7),
    chain_type="stuff",  # or "map_reduce" for large contexts
    retriever=vectorstore.as_retriever(
        search_kwargs={"k": 5}  # top 5 docs
    ),
    return_source_documents=True
)

# Inference
response = qa_chain({"query": user_message})
answer = response["result"]
sources = response["source_documents"]
```

**Cost Optimization:**
```
Strategy:
1. Use GPT-3.5-turbo for most queries (~$0.002 per req)
2. Use GPT-4 only for complex logic (~$0.03 per req)
3. Use smaller embedding model (text-embedding-3-small)
4. Cache embedding results

Estimated costs at 100K conversations/month:
- 80% simple queries: $160
- 20% complex queries: $600
- Total LLM cost: ~$760/month
- Plus: API overheads $100-200
```

---

## 3. DATABASE SCHEMA

### 3.1 Core Tables

```sql
-- CUSTOMERS (Workspaces)
CREATE TABLE customers (
    id UUID PRIMARY KEY,
    workspace_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255),
    subscription_tier ENUM('starter', 'pro', 'enterprise'),
    monthly_conversation_limit INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP -- soft delete
);

-- ASSISTANTS (AI chatbots per workspace)
CREATE TABLE assistants (
    id UUID PRIMARY KEY,
    customer_id UUID REFERENCES customers,
    name VARCHAR(255),
    system_prompt TEXT,
    tone ENUM('friendly', 'professional', 'casual'),
    escalation_threshold FLOAT (0-1, confidence score),
    created_at TIMESTAMP,
    INDEX (customer_id)
);

-- CONVERSATIONS
CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    assistant_id UUID REFERENCES assistants,
    customer_id UUID REFERENCES customers,
    channel VARCHAR(50) ('web', 'slack', 'whatsapp'),
    visitor_id VARCHAR(255), -- anonymous
    status ENUM('active', 'resolved', 'escalated'),
    satisfaction_score INT (0-5),
    resolution_time_seconds INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX (assistant_id, created_at),
    INDEX (customer_id, status)
);

-- MESSAGES
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    conversation_id UUID REFERENCES conversations,
    sender_type ENUM('user', 'assistant', 'human_agent'),
    sender_id VARCHAR(255),
    content TEXT,
    message_type ENUM('text', 'file', 'card'),
    tokens_used INT, -- for cost tracking
    latency_ms INT, -- response time
    created_at TIMESTAMP,
    INDEX (conversation_id, created_at)
);

-- ESCALATIONS
CREATE TABLE escalations (
    id UUID PRIMARY KEY,
    conversation_id UUID REFERENCES conversations,
    reason ENUM('low_confidence', 'user_request', 'no_match'),
    escalated_to VARCHAR(255), -- email or Zendesk ticket ID
    resolved_by VARCHAR(255), -- agent email
    resolution_time_seconds INT,
    created_at TIMESTAMP,
    resolved_at TIMESTAMP
);

-- KNOWLEDGE BASE DOCUMENTS
CREATE TABLE kb_documents (
    id UUID PRIMARY KEY,
    assistant_id UUID REFERENCES assistants,
    title VARCHAR(255),
    content TEXT,
    source_type ENUM('pdf', 'notion', 'url', 'manual'),
    pinecone_doc_id VARCHAR(255), -- reference to vector store
    token_count INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX (assistant_id)
);

-- INTEGRATIONS
CREATE TABLE integrations (
    id UUID PRIMARY KEY,
    customer_id UUID REFERENCES customers,
    integration_type ENUM('slack', 'zendesk', 'hubspot', 'stripe'),
    api_key_encrypted VARCHAR(500),
    is_active BOOLEAN,
    created_at TIMESTAMP,
    last_sync_at TIMESTAMP
);

-- ANALYTICS EVENTS (for tracking)
CREATE TABLE analytics_events (
    id BIGSERIAL PRIMARY KEY,
    customer_id UUID,
    event_type VARCHAR(50),
    event_data JSONB,
    created_at TIMESTAMP,
    INDEX (customer_id, created_at)
    -- Partitioned by month for performance
);
```

### 3.2 Key Indexes (Performance Critical)

```sql
-- Conversation lookup by assistant
CREATE INDEX idx_conversations_assistant_created 
ON conversations(assistant_id, created_at DESC);

-- Message lookup by conversation
CREATE INDEX idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

-- Analytics query: conversations per customer
CREATE INDEX idx_conversations_customer_status 
ON conversations(customer_id, status);

-- Vector search integration (Pinecone handles this)
-- Local reference to track which documents are embedded
CREATE INDEX idx_kb_documents_assistant 
ON kb_documents(assistant_id);
```

---

## 4. API SPECIFICATION

### 4.1 Conversation API

```
Endpoint: POST /api/v1/conversations/create
Purpose: Start new conversation
Auth: Bearer token (customer)

Request:
{
  "visitor_id": "visitor_123",
  "channel": "web",
  "initial_message": "Hello, I have a question",
  "metadata": {
    "visitor_ip": "192.168.1.1",
    "user_agent": "Mozilla..."
  }
}

Response (WebSocket):
{
  "conversation_id": "conv_abc123",
  "ws_url": "wss://api.resonance.ai/ws/conv_abc123"
}

WebSocket Messages:
Client → Server: { "type": "message", "content": "..." }
Server → Client: { "type": "response", "content": "...", "sources": [...] }
Server → Client: { "type": "escalation", "ticket_id": "..." }
```

### 4.2 Authentication & Authorization

```
Auth Flow:
1. User signs up → Create workspace
2. Generate API key (stored hashed)
3. All requests include Authorization header

header: Authorization: Bearer {api_key}

Scope system:
- admin: Full access to workspace
- manager: View + edit conversations
- viewer: Read-only analytics

RBAC Implementation:
- Middleware checks JWT claims
- Row-level security: Can only see own workspace data
```

### 4.3 Rate Limiting

```
Tier-based limits:
- Starter: 5,000 API calls/month (0.17/sec)
- Pro: 50,000 API calls/month (1.7/sec)
- Enterprise: Unlimited

Implementation: Redis + sliding window algorithm
- Bucket key: "{customer_id}:{hour}"
- Reject if exceeded with 429 Too Many Requests
```

---

## 5. INTEGRATION ARCHITECTURE

### 5.1 Incoming Integrations (Send conversations to external systems)

**Zendesk Integration**
```python
# When escalation triggered
def escalate_to_zendesk(conversation_id):
    # Get conversation + messages
    conv = db.query(Conversation).get(conversation_id)
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).all()
    
    # Format as ticket description
    ticket_body = format_conversation(messages)
    
    # Create Zendesk ticket
    zendesk_client.tickets.create(
        ticket={
            "subject": f"Escalation from {conv.channel}",
            "description": ticket_body,
            "custom_fields": {
                "satisfaction_before_escalation": conv.satisfaction_score
            }
        }
    )

# Zendesk → Update satisfaction when agent resolves
webhook_route = "/webhooks/zendesk/ticket_updated"
# When resolved, fetch ticket satisfaction, store in conversations table
```

**Slack Integration**
```python
# Route conversation notifications to Slack channel
async def notify_slack_escalation(conversation_id):
    conv = db.query(Conversation).get(conversation_id)
    
    slack_client.chat_postMessage(
        channel=customer.slack_channel,
        text=f"Escalation: {conv.id}",
        blocks=[
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": conv.last_message}
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "View"},
                        "url": f"https://app.resonance.ai/conversations/{conv.id}"
                    }
                ]
            }
        ]
    )
```

### 5.2 Outgoing Integrations (Inbound conversations)

**Slack Bot**
```python
# Slack → Our service
@slack_app.message(".*")
def handle_slack_message(message, say):
    # Map Slack channel to assistant
    assistant = db.query(Assistant).filter(
        Assistant.slack_channel == message['channel']
    ).first()
    
    if not assistant:
        return
    
    # Forward to conversation service
    response = process_message(
        assistant_id=assistant.id,
        content=message['text'],
        channel='slack',
        user_id=message['user']
    )
    
    say(response.content)
```

**Email Integration (SendGrid inbound parse)**
```python
@app.post("/webhooks/email")
async def handle_incoming_email(request: Request):
    data = await request.form()
    
    # Parse email
    sender = data['from']
    subject = data['subject']
    text = data['text']
    
    # Find conversation
    conv = db.query(Conversation).filter(
        Conversation.visitor_email == sender
    ).order_by(Conversation.created_at.desc()).first()
    
    if conv and conv.status == 'open':
        # Add message to existing conversation
        add_message(conv.id, text, sender_type='user')
        
        # Get AI response
        response = process_message(...)
        
        # Send reply email
        send_email(sender, response.content)
```

---

## 6. DEPLOYMENT & DevOps

### 6.1 Infrastructure (AWS)

```yaml
# Kubernetes cluster (EKS)
Services:
  - Conversation Service (Node.js) - 3 replicas
  - Knowledge Base Service (Python) - 2 replicas
  - Admin API (Node.js) - 2 replicas
  - Webhook Service - 1 replica

Managed Services:
  - RDS PostgreSQL (Multi-AZ)
  - ElastiCache Redis
  - Pinecone (external SaaS)
  - S3 for document storage
  - CloudFront CDN for widget JS
  - SQS for async tasks
  - SNS for notifications

Load Balancing:
  - ALB in front of EKS
  - Auto-scaling: 3-10 pods based on CPU/memory
  - Geographic distribution: Multi-region at $10M ARR scale
```

### 6.2 CI/CD Pipeline

```yaml
GitHub Actions Workflow:

1. Push to main branch
   ├─ Lint & format (ESLint, Prettier)
   ├─ Unit tests (Jest, Pytest)
   ├─ Build Docker images
   ├─ Push to ECR
   └─ Trigger deployment

2. Deployment stages
   ├─ Staging (automated)
   ├─ Smoke tests
   ├─ Production (manual approval)
   └─ Canary rollout (10% → 50% → 100%)

3. Monitoring
   ├─ Error rate tracking
   ├─ Performance metrics
   └─ Auto-rollback if error rate > 1%
```

### 6.3 Monitoring & Observability

```
DataDog Integration:

Metrics:
- Request latency (p50, p95, p99)
- Error rate
- Message throughput
- Vector DB query time
- LLM API latency

Logs:
- Structured JSON logging
- Trace IDs across services
- Sample 100% at first, then 10% for cost

Alerts:
- Error rate > 1% → PagerDuty
- Response time > 1s → Slack alert
- Vector DB down → Critical alert
- High memory usage → Scale trigger
```

---

## 7. SECURITY & COMPLIANCE

### 7.1 Data Security

```
Encryption:
- In transit: TLS 1.3 for all connections
- At rest: AWS KMS for database encryption
- Customer data: Encrypted with customer-specific keys

API Keys:
- Generated with cryptographically secure random
- Hashed with SHA-256 before storage
- Support key rotation
- Automatic expiration after 90 days (configurable)

Authentication:
- JWT tokens with 24-hour expiration
- Refresh tokens with 7-day rotation
- Support OAuth 2.0 for enterprise
```

### 7.2 Compliance

```
GDPR:
- Data residency: EU data in EU region
- Right to deletion: Cascade delete all associated data
- Data portability: Export conversations as JSON
- Audit logs: All access logged for 90 days

SOC 2 Type II:
- Path to certification (Year 2)
- Annual penetration testing
- Disaster recovery testing quarterly

HIPAA (for healthcare vertical):
- BAA available for enterprise
- Encrypted PHI storage
- Access controls per HIPAA Security Rule
```

### 7.3 Rate Limiting & DDoS Protection

```
DDoS Mitigation:
- CloudFlare or AWS Shield (layer 3-4)
- WAF rules (SQL injection, XSS detection)
- API rate limiting per tier

Attack Prevention:
- Validate all inputs (OWASP top 10)
- Parameterized queries (prevent SQL injection)
- Sanitize HTML output (prevent XSS)
- CORS enabled only for customer domains
```

---

## 8. SCALABILITY PLAN

### 8.1 Scaling Phases

**Phase 1: MVP (1-100 customers)**
- Single k8s cluster (1 region)
- Shared database (multi-AZ)
- Managed Pinecone (no self-hosting)
- Budget: ~$2K-5K/month infrastructure

**Phase 2: Growth (100-1,000 customers)**
- 3-region active-active setup
- Database read replicas for analytics
- Self-hosted Weaviate for large KB
- Dedicated vector DB cluster
- Budget: ~$20K-50K/month infrastructure

**Phase 3: Enterprise (1,000+ customers)**
- Global CDN for chat widget
- Per-customer isolated databases (compliance)
- High-availability setup (99.95% SLA)
- Dedicated support infrastructure
- Budget: ~$100K-500K/month infrastructure

### 8.2 Database Scaling

```sql
-- Query optimization (1M+ conversations)
Partitioning:
- conversations: partition by month
- messages: partition by week
- analytics_events: partition by day

Read Scaling:
- Replica for analytics queries
- Read-only user: SELECT-only permissions
- Connection pooling: PgBouncer

Write Scaling:
- Sharding at $10M+ ARR (partition by customer_id)
- Async writes for non-critical data
- Batch inserts for analytics events
```

### 8.3 Cost Optimization Strategy

```
Current (100 customers, 100K conv/month):
- Servers: $3K/month
- Database: $1K/month
- LLM API: $800/month
- Vector DB: $200/month
- Total: ~$5K/month

Target (1000 customers, 1M conv/month):
- Unit economics: $5-10 per MRR customer
- At $500 MRR per customer → 20-50% cost ratio

Cost reduction tactics:
1. Use cheaper models (GPT-3.5 for 80%)
2. Cache embedding results
3. Batch process non-critical items
4. Self-host vector DB ($50K save vs Pinecone)
5. Reserved instances (AWS RI) for baseline load
```

---

## 9. TECH STACK SUMMARY TABLE

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Frontend (Widget) | React 18 + TypeScript | Small bundle, real-time capable |
| Frontend (Dashboard) | Next.js 14 | Full-stack, built-in auth, fast |
| Backend (Real-time) | Node.js + Express | Non-blocking I/O, WebSocket native |
| Backend (AI/ML) | Python + FastAPI | LLM ecosystem mature, fast APIs |
| Primary DB | PostgreSQL | Relational data, JSONB for flexibility |
| Cache/Sessions | Redis | Sub-ms latency, Pub/sub capability |
| Vector DB | Pinecone (MVP) → Weaviate (scale) | Managed vs self-hosted tradeoff |
| LLM API | OpenAI GPT-4 + Claude fallback | Quality, reliability, fallback coverage |
| Hosting | AWS EKS (Kubernetes) | Scalability, managed services ecosystem |
| CDN | CloudFront | CDN for widget.js delivery |
| Monitoring | DataDog | Comprehensive observability |
| CI/CD | GitHub Actions | Native GitHub integration |

---

## 10. DEVELOPMENT ROADMAP

| Phase | Timeline | Deliverables |
|-------|----------|-------------|
| **MVP** | Weeks 1-8 | Core chat, KB upload, basic analytics |
| **Beta** | Weeks 9-16 | Zendesk integration, email escalation, dashboard |
| **GA** | Weeks 17-20 | Security hardening, performance optimization, docs |
| **Post-GA** | Months 6+ | Multi-language, Slack native, sentiment analysis |

---

## 11. APPENDIX: Code Examples

### 11.1 WebSocket Message Handler (Node.js)

```javascript
// Conversation service - message handler
const handleUserMessage = async (socket, data) => {
  const { conversationId, content } = data;
  
  try {
    // 1. Save user message
    const userMsg = await db.messages.create({
      conversationId,
      senderType: 'user',
      content,
      createdAt: new Date()
    });

    // 2. Emit typing indicator
    socket.emit('assistant_typing', { conversationId });

    // 3. Get conversation context
    const conversation = await db.conversations.findOne(conversationId);
    const history = await db.messages.find({ conversationId });

    // 4. Call knowledge base service for RAG
    const relevantDocs = await knowledgeBaseService.search({
      query: content,
      assistantId: conversation.assistantId,
      topK: 5
    });

    // 5. Prepare prompt with RAG context
    const systemPrompt = buildSystemPrompt(conversation);
    const ragContext = relevantDocs.map(d => d.content).join('\n---\n');
    
    const fullPrompt = `
${systemPrompt}

Knowledge Base Context:
${ragContext}

Conversation History:
${history.map(m => `${m.senderType}: ${m.content}`).join('\n')}

User: ${content}
Assistant:
    `;

    // 6. Stream LLM response
    const stream = await openai.createChatCompletion({
      model: 'gpt-4-turbo',
      messages: [...history, { role: 'user', content }],
      stream: true
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const delta = chunk.choices[0].delta.content;
      fullResponse += delta;
      
      // Emit streamed chunks to client
      socket.emit('message_delta', {
        conversationId,
        delta
      });
    }

    // 7. Save assistant response
    await db.messages.create({
      conversationId,
      senderType: 'assistant',
      content: fullResponse,
      sources: relevantDocs
    });

    // 8. Check if escalation needed
    const confidence = await calculateConfidence(fullResponse);
    if (confidence < 0.6) {
      socket.emit('escalation_triggered', { conversationId });
    }

  } catch (error) {
    logger.error('Message handling error', { error, conversationId });
    socket.emit('error', { message: 'Failed to process message' });
  }
};
```

### 11.2 RAG Retrieval (Python)

```python
# Knowledge base service - semantic search
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Pinecone

async def search_knowledge_base(
    query: str,
    assistant_id: str,
    top_k: int = 5
):
    """Retrieve relevant documents for user query"""
    
    # Initialize embedding model
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small"
    )
    
    # Get Pinecone vectorstore
    vectorstore = Pinecone.from_existing_index(
        index_name=f"assistant_{assistant_id}",
        embedding=embeddings
    )
    
    # Semantic search + metadata filtering
    docs = vectorstore.similarity_search_with_score(
        query=query,
        k=top_k,
        filter={"assistant_id": assistant_id}  # Namespace isolation
    )
    
    # Return with relevance scores
    return [
        {
            "content": doc.page_content,
            "source": doc.metadata.get("source"),
            "score": score
        }
        for doc, score in docs
    ]
```

---

## Document Version & Next Steps
- **Version:** 1.0
- **Last Updated:** Jan 20, 2026
- **Next Revision:** After first production deployment
- **Owner:** Technical Lead / CTO

