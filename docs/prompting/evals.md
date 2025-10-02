# RAG System Evaluation

## Retrieval Quality Tests (10 tests)
| Test ID | Question | Expected Documents | Pass Criteria |
|---------|----------|-------------------|---------------|
| R01 | How do I create an account on Shoplite? | Documents related to Account Setup | Retrieved docs contain relevant account creation info |
| R02 | What payment methods does Shoplite support? | Documents 5: Payment Methods | Retrieved docs mention Visa, Mastercard, PayPal, COD |
| R03 | How long does standard shipping take? | Document 6: Shipping Policy | Retrieved docs mention standard and express shipping times |
| R04 | Can I cancel an order after it ships? | Documents 4, 17, 18 | Retrieved docs correctly explain cancellation rules |
| R05 | What is Shoplite Drops? | Relevant Drops documents | Retrieved docs explain limited-time launches and order rules |
| R06 | What is Shoplite’s return policy? | Document 7: Returns and Refunds | Retrieved docs mention 30-day returns and refund process |
| R07 | How does Shoplite handle refunds for COD orders? | Documents 5, 7, 15 | Retrieved docs explain store credit refunds and COD handling |
| R08 | Do all products come with a warranty? | Document 8: Warranty Policy | Retrieved docs mention manufacturer warranties |
| R09 | How do I track my order after purchase? | Document 17: Order Tracking | Retrieved docs explain order tracking steps |
| R10 | What should I do if my package says “Delivered” but I didn’t receive it? | Document 17: Order Tracking | Retrieved docs explain reporting procedure |

## Response Quality Tests (15 tests)
| Test ID | Question | Required Keywords | Forbidden Terms | Expected Behavior |
|---------|----------|-------------------|-----------------|-----------------|
| Q01 | How do I create an account on Shoplite? | ["email", "password", "Google", "Facebook"] | ["wrong info", "guess"] | Clear instructions with verification step |
| Q02 | What payment methods does Shoplite support? | ["Visa", "Mastercard", "PayPal", "COD"] | ["speculation"] | List payment methods with COD details |
| Q03 | How long does standard shipping take? | ["5–7 business days", "2–3 business days", "free shipping"] | ["incorrect dates"] | Provide standard and express shipping info |
| Q04 | Can I cancel an order after it ships? | ["Processing stage", "contacting support"] | ["guarantee"] | Correctly specify cancellation limitations |
| Q05 | What is Shoplite Drops? | ["limited-time", "first-come-first-serve", "cannot cancel"] | ["wrong info"] | Explain Drops rules concisely |
| Q06 | What is Shoplite’s return policy? | ["30 days", "unused", "proof of purchase", "refunds"] | ["incorrect process"] | Summarize return eligibility and refund timing |
| Q07 | How does Shoplite handle refunds for COD orders? | ["store credit", "handling fee"] | ["guess"] | Specify COD refund process |
| Q08 | Do all products come with a warranty? | ["6–12 months", "defects"] | ["all products"] | Clarify warranty coverage |
| Q09 | How do I track my order after purchase? | ["Processing", "Shipped", "Delivered", "notifications"] | ["wrong status"] | Provide stepwise tracking info |
| Q10 | What should I do if my package says “Delivered” but I didn’t receive it? | ["report", "48 hours"] | ["guess"] | Direct user to reporting procedure |
| Q11 | Does Shoplite store my credit card details? | ["tokenized", "secure payment providers"] | ["stores card details"] | Explain secure payment handling |
| Q12 | How does the loyalty program work? | ["points", "redeem", "expire"] | ["misleading info"] | Explain points accrual, redemption, expiration |
| Q13 | Can I combine multiple coupons in one order? | ["cannot stack", "one coupon"] | ["speculation"] | Clarify coupon stacking rules |
| Q14 | Are reviews moderated on Shoplite? | ["abusive content", "verified customers"] | ["false info"] | Explain moderation process |
| Q15 | How are third-party sellers managed? | ["verification", "escrow", "ratings"] | ["incorrect policy"] | Outline seller verification, escrow, and removal |

## Edge Case Tests (5 tests)
| Test ID | Scenario | Expected Response Type |
|---------|----------|----------------------|
| E01 | Question not in knowledge base | Refusal with explanation |
| E02 | Ambiguous question | Clarification request |
| E03 | Question with multiple interpretations | Clarification request |
| E04 | Question about unsupported feature | Refusal with explanation |
| E05 | Question with partial info in docs | Short concise answer using available info |
