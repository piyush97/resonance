# Week 1 Quick Start Guide

Your 7-day action plan to validate the idea and set up the technical foundation.

## Day 1-2: Outreach + Repo Setup

### Morning (2 hours): Technical Setup

1. **Initialize the monorepo:**
   ```bash
   cd /home/piyushmehta/Projects/Personal/Project
   npm install  # Install turbo for monorepo
   ```

2. **Set up each service:**
   ```bash
   # Web app
   cd apps/web
   npm install
   
   # API
   cd ../api
   npm install
   
   # Widget
   cd ../../packages/widget
   npm install
   
   # KB Service
   cd ../../services/kb
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Create GitHub repo:**
   - Go to GitHub, create new repo: `resonance`
   - Push code:
     ```bash
     git init
     git add .
     git commit -m "Initial commit: MVP structure"
     git remote add origin https://github.com/yourusername/resonance.git
     git push -u origin main
     ```

### Afternoon (2 hours): Infrastructure Setup

Follow `docs/infrastructure-setup.md` to set up:
1. Supabase (database)
2. Pinecone (vector DB)
3. OpenAI (API key)
4. Vercel (connect repo)
5. Railway/Fly.io (for backend)

**Time estimate:** 30-60 minutes total

### Evening (2 hours): Outreach Prep

1. **Create outreach list:**
   - Use LinkedIn Sales Navigator (free trial) or LinkedIn search
   - Target: SaaS founders, support managers at 50-200 employee companies
   - Build list of 50 contacts in spreadsheet

2. **Personalize emails:**
   - Use templates from `docs/outreach-email-templates.md`
   - Personalize each one (company name, specific detail)
   - Prepare first 25 emails

3. **Set up tracking:**
   - Copy `docs/validation-spreadsheet-template.csv`
   - Name it: `validation-tracker.csv`
   - Fill in first 25 prospects

## Day 3-4: First Calls + Widget

### Morning (2 hours): Send Emails

1. **Send first 25 emails:**
   - Use email scheduling tool (Mixmax, Lemlist) or send manually
   - Track in spreadsheet: Outreach Date, Response Date
   - Send Tuesday-Thursday, 9-11am or 2-4pm

2. **Follow up on responses:**
   - Book calls using Calendly or similar
   - Confirm time 24 hours before

### Afternoon (3 hours): Run First Calls

1. **Prepare for calls:**
   - Review `docs/interview-script.md`
   - Research each company (5 min prep per call)
   - Set up recording (with permission)

2. **Run 3-5 calls:**
   - Follow script
   - Take notes in real-time
   - Fill out spreadsheet immediately after

3. **Build chat widget:**
   - Widget is already built in `packages/widget`
   - Test it locally:
     ```bash
     cd packages/widget
     npm run dev
     ```
   - Embed in a test HTML page to verify it works

## Day 5-6: Deep Discovery + RAG

### Morning (2 hours): More Calls

1. **Send remaining 25 emails**
2. **Run 5-8 more calls**
3. **Update spreadsheet after each call**

### Afternoon (4 hours): RAG Pipeline

1. **Test RAG pipeline:**
   ```bash
   cd services/kb
   source venv/bin/activate
   uvicorn main:app --reload
   ```

2. **Test document upload:**
   - Use Postman or curl:
     ```bash
     curl -X POST http://localhost:8000/api/knowledge-base/upload \
       -F "file=@test-document.pdf" \
       -F "assistant_id=test-assistant"
     ```

3. **Test search:**
   ```bash
     curl -X POST http://localhost:8000/api/knowledge-base/search \
       -H "Content-Type: application/json" \
       -d '{"query": "What is your return policy?", "assistant_id": "test-assistant", "top_k": 5}'
     ```

4. **Connect to API service:**
   - Update `apps/api/src/routes/conversations.ts` to call KB service
   - Test end-to-end: Widget → API → KB Service → Response

## Day 7: Synthesis + Decision

### Morning (2 hours): Compile Insights

1. **Analyze validation data:**
   - Calculate averages (pain intensity, willingness to pay)
   - Identify patterns (common pain points, must-have features)
   - Segment by industry

2. **Fill out decision matrix:**
   - Count: How many said "Yes" to $500+/mo?
   - Average pain intensity: _____
   - Beta interest: How many said "Yes"?

3. **Write 1-page summary:**
   - Key insights
   - Patterns identified
   - Recommendation: Proceed or pivot

### Afternoon (2 hours): Technical Checkpoint

1. **Test end-to-end flow:**
   - Upload document → Embed → Search → Chat response
   - Document any blockers

2. **Deploy to staging:**
   - Deploy web app to Vercel
   - Deploy API to Railway
   - Deploy KB service to Railway
   - Test everything works

3. **Document what's working / not working**

## Decision Checkpoint

**Proceed to MVP if:**
- ✅ 10+/20 say "Yes" to $500+/mo
- ✅ Average pain intensity > 7/10
- ✅ Clear feature pattern
- ✅ Technical foundation works

**Pivot or adjust if:**
- ❌ Less than 5/20 say "Yes"
- ❌ Average pain < 6/10
- ❌ No clear pattern

## What Success Looks Like

**By end of Week 1, you should have:**
- ✅ 50 outreach emails sent
- ✅ 10-15 validation calls completed
- ✅ Spreadsheet with all insights
- ✅ Working monorepo structure
- ✅ Chat widget functional (static)
- ✅ RAG pipeline working (can upload and search)
- ✅ Clear decision: Proceed or pivot

## Common Blockers & Solutions

**"I can't find 50 prospects":**
- Use LinkedIn Sales Navigator free trial
- Search: "Support Manager" + "SaaS" + "50-200 employees"
- Use Crunchbase to find funded SaaS companies

**"No one is responding":**
- Check subject lines (try different variants)
- Personalize more (mention specific company detail)
- Try LinkedIn DM instead of email
- Follow up after 5 days

**"RAG pipeline isn't working":**
- Check OpenAI API key is set
- Verify Pinecone index exists
- Check Python dependencies installed
- Review error logs in terminal

**"I'm behind schedule":**
- Prioritize validation calls over tech
- Tech can be fixed later, validation is time-sensitive
- Minimum viable: 10 calls + basic RAG working

## Next Week Preview

**If proceeding to MVP:**
- Week 2: Build core features (KB upload UI, chat integration, basic analytics)
- Week 3-4: Polish, test with first beta customer
- Week 5-8: Full MVP with 3-5 beta customers

**If pivoting:**
- Week 2: Re-validate new problem/solution
- Adjust based on what you learned

---

**Remember:** Validation > Building. Talk to customers first, code second.
