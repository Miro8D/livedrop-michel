# Touchpoints

## 1. Typeahead Search

**Problem:**  
Users take too much time to find items with keyword search, a smarter typeahead can predict what they want in less than 300ms

**Happy path:**  
1. User starts typing in search box
2. Frontend calls typeahead API
3. Check the cache
4. If not cached, query goes to AI model with SKU data
5. Model returns top 5 suggestions
6. Results merged with standard search for fallback  
7. Suggestions shown in dropdown
8. User clicks one and gets redirected to product page

**Grounding & guardrails:**  
- Source: product catalog only
- Limit to 50 SKUs context
- Refuse to generate if query is outside scope

**Human-in-the-loop:**  
- There's no need because there's no major risk

**Latency budget:**  
- Cache check: 50 ms  
- Model: 200 ms  
- Merge: 50 ms  
- Total: 300 ms  

**Error & fallback:**  
- If model fails fallback to default keyword search.  

**PII:**  
- No personal data leaves app.  

**Metrics:**  
- CTR on suggestions = clicks / impressions  
- Conversion lift = orders from suggestions / baseline orders  
- Business: incremental revenue per session  

**Feasibility:**  
We already have SKU data. Use Llama 3.1 8B Instruct via OpenRouter with small context. 
Next step: prototype with cached prompts.  

---

## 2. Support Assistant

**Problem:**  
Users contact support for basic order status and FAQ answers can be automated

**Happy path:**  
1. User opens support chat.  
2. Types question (most likely about his order).  
3. Cache checked for common answers.
4. If not cached, assistant retrieves FAQ or order-status API.  
5. Model generates grounded answer.  
6. If confident, response shown.  
7. If low confidence, escalate to human agent.  
8. User gets final answer as fast as possible

**Grounding & guardrails:**  
- Sources: FAQ markdown + order-status API.  
- Max context: 2k tokens.  
- Refuse if question is outside scope.  

**Human-in-the-loop:**  
- Escalate if confidence <0.8.  
- Human agents handle escalations within 10 min SLA.  

**Latency budget:**  
- Cache: 100 ms  
- Retrieval: 200 ms  
- Model: 800 ms  
- Wrap-up: 100 ms  
- Total: 1200 ms  

**Error & fallback:**  
- If model fails → “Please hold, connecting you to an agent.”  

**PII:**  
- Only order ID passes to backend API.  
- No sensitive data stored in logs.  

**Metrics:**  
- Resolution rate = AI-resolved / total chats  
- Avg. response time  
- Business: lower contact rate per 1k sessions  

**Feasibility:**  
FAQ already in markdown, order-status API exists. GPT-4o-mini or Llama 3.1 would work. Next step: wire up retrieval prototype.  
