# 🚀 START HERE - Your Week 1 Checklist

Print this or keep it open. Check off items as you complete them.

## ✅ Setup (Day 1 Morning - 2 hours)

- [ ] Run `npm install` in root directory
- [ ] Install dependencies in each app/service:
  - [ ] `cd apps/web && npm install`
  - [ ] `cd apps/api && npm install`
  - [ ] `cd packages/widget && npm install`
  - [ ] `cd services/kb && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt`
- [ ] Create GitHub repo and push code
- [ ] Set up Supabase (follow `docs/infrastructure-setup.md`)
- [ ] Run `docs/supabase-schema.sql` in Supabase SQL Editor
- [ ] Set up Pinecone index
- [ ] Get OpenAI API key
- [ ] Create `.env` files from `.env.example` templates
- [ ] Test: Can you run `npm run dev` in `apps/web`? (should see landing page)

## 📧 Outreach (Day 1-2 - 4 hours)

- [ ] Build list of 50 prospects (LinkedIn Sales Navigator or manual search)
- [ ] Copy `docs/validation-spreadsheet-template.csv` → `validation-tracker.csv`
- [ ] Fill in first 25 prospects in spreadsheet
- [ ] Personalize first 25 emails using `docs/outreach-email-templates.md`
- [ ] Send first 25 emails (Tuesday-Thursday, 9-11am or 2-4pm)
- [ ] Track: Outreach Date, Response Date in spreadsheet

## 📞 Validation Calls (Day 3-7 - Ongoing)

- [ ] Review `docs/interview-script.md` before first call
- [ ] Book first 3-5 calls (use Calendly or similar)
- [ ] Run calls, take notes
- [ ] Fill out spreadsheet immediately after each call:
  - [ ] Pain intensity (1-10)
  - [ ] Would pay $500+/mo? (Yes/No/Maybe)
  - [ ] Key pain points (verbatim quotes)
  - [ ] Must-have features
  - [ ] Beta interest
- [ ] Send remaining 25 emails (Day 3-4)
- [ ] Run 5-8 more calls (Day 5-6)
- [ ] Total calls completed: _____ / 15 target

## 🛠️ Technical Testing (Day 3-6 - 4 hours)

- [ ] Test chat widget: `cd packages/widget && npm run dev`
- [ ] Embed widget in test HTML page, verify it renders
- [ ] Start KB service: `cd services/kb && uvicorn main:app --reload`
- [ ] Test upload: Upload a test PDF via Postman/curl
- [ ] Test search: Query the knowledge base
- [ ] Verify: Can you upload a doc and search it? (Yes/No)

## 📊 Decision Day (Day 7 - 2 hours)

- [ ] Calculate averages:
  - [ ] Average pain intensity: _____
  - [ ] % who would pay $500+/mo: _____
  - [ ] # interested in beta: _____
- [ ] Identify patterns:
  - [ ] Most common pain point: _____
  - [ ] Most requested feature: _____
- [ ] Write 1-page summary of insights
- [ ] Make decision:
  - [ ] 10+/20 said "Yes" to $500+/mo? → ✅ Proceed to MVP
  - [ ] Average pain > 7/10? → ✅ Proceed
  - [ ] Less than 5 said "Yes"? → ⚠️ Pivot or adjust

## 🎯 Week 1 Success Criteria

**Minimum viable:**
- ✅ 10 validation calls completed
- ✅ RAG pipeline working (can upload and search)
- ✅ Chat widget renders
- ✅ Clear decision: Proceed or pivot

**Ideal:**
- ✅ 15 validation calls completed
- ✅ 10+ said "Yes" to $500+/mo
- ✅ Average pain intensity > 7/10
- ✅ 5+ interested in beta
- ✅ All services deployed to staging

## 📚 Key Documents

- **Quick Start**: `docs/week1-quickstart.md`
- **Infrastructure**: `docs/infrastructure-setup.md`
- **Email Templates**: `docs/outreach-email-templates.md`
- **Interview Script**: `docs/interview-script.md`
- **Tracking Guide**: `docs/validation-spreadsheet-guide.md`
- **Full Summary**: `IMPLEMENTATION_SUMMARY.md`

## 🆘 Need Help?

**Technical issues:**
- Check `docs/infrastructure-setup.md` for service setup
- Review error messages carefully
- Test each service in isolation first

**Validation issues:**
- Review `docs/interview-script.md` for call structure
- Check `docs/outreach-email-templates.md` for email variants
- Follow up after 5 days if no response

**Behind schedule:**
- Prioritize validation calls over tech
- Minimum: 10 calls + basic RAG working
- Tech can be fixed later

---

**Remember:** Validation > Building. Talk to customers first, code second.

**You've got this! 🚀**
