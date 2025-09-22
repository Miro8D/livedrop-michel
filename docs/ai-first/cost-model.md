# Cost Model

## Assumptions
- Model: Llama 3.1 8B Instruct ($0.05/1K prompt, $0.20/1K completion)
- Typeahead: 20 in, 5 out tokens; 50k req/day; 70% cache hit
- Support: 200 in, 100 out tokens; 1k req/day; 30% cache hit

---

## Typeahead
Cost/action = (20/1000 * 0.05) + (5/1000 * 0.20)  
= 0.001 + 0.001 = **$0.002 per action**  

Daily cost = 0.002 * 50,000 * (1 - 0.7)  
= 0.002 * 15,000 = **$30/day**

---

## Support Assistant
Cost/action = (200/1000 * 0.05) + (100/1000 * 0.20)  
= 0.01 + 0.02 = **$0.03 per action**  

Daily cost = 0.03 * 1000 * (1 - 0.3)  
= 0.03 * 700 = **$21/day**

---

## Results
- Typeahead: $0.002/action, ~$30/day
- Support Assistant: $0.03/action, ~$21/day

---

## Cost levers
- Typeahead: shorten queries passed to the model or increase cache hit rate
- Support: summarize FAQs better to reduce input tokens
