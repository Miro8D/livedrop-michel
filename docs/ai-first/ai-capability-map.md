# AI Capability Map

| Capability              | Intent (user)                     | Inputs             | Risk | p95 ms | Est. cost/action | Fallback                  | Selected |
|-------------------------|-----------------------------------|--------------------|------|--------|------------------|---------------------------|:-------:|
| Typeahead Search        | Find products faster              | Query text, SKU DB | 2    | 300    | $0.004           | Default keyword search    | ✅ |
| Support Assistant       | Get answers to policies/orders    | FAQ docs, order ID | 3    | 1200   | $0.09            | Hand off to live support  | ✅ |
| Product Summaries       | Quick description of items        | Product metadata   | 4    | 500    | $0.01            | Use stored description    |   |
| Review Analyzer         | Summarize customer reviews        | Review text        | 4    | 800    | $0.05            | Show full reviews         |   |
| Personalized recommendations       | Suggest products for each user    | User history       | 4    | 1000   | $0.07            | Show popular items        |   |

### Why these two
**Typeahead Search** and **Support Assistant**; Both directly improve main goals: product discovery (conversion rate) and fewer support tickets (lower costs). They are also easier to test quickly since we already have the product catalog, FAQ file, and order-status API.
