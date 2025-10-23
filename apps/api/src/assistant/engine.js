import fetch from 'node-fetch';
// performanceStats is injected by server.js via setPerformanceStats to avoid a circular import
let performanceStats = { llmResponseTimes: [] };
export function setPerformanceStats(ps) {
  performanceStats = ps;
}
import { classifyIntent } from './intent-classifier.js';
import functionRegistry from './function-registry.js';
import fs from 'fs';
import yaml from 'js-yaml';

const prompts = yaml.load(fs.readFileSync(new URL('../../../../docs/prompts.yaml', import.meta.url)));
const knowledgeBase = JSON.parse(fs.readFileSync(new URL('../../../../docs/ground-truth.json', import.meta.url)));

const LLM_URI = process.env.LLM_URI || '';

// Ping LLM /ping endpoint with short timeout and measure latency
export async function pingLLM() {
  if (!LLM_URI) return { up: false, error: 'LLM_URI not configured', latencyMs: null, body: null };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const start = performance.now();
    const r = await fetch(new URL('/ping', LLM_URI).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'health' }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    const latency = performance.now() - start;
    performanceStats.llmResponseTimes.push(latency);
    if (performanceStats.llmResponseTimes.length > 100) performanceStats.llmResponseTimes.shift();
    const body = await r.json().catch(() => null);
    return { up: r.ok, latencyMs: Number(latency.toFixed(2)), body };
  } catch (err) {
    return { up: false, latencyMs: null, body: null, error: err && err.message ? err.message : String(err) };
  }
}

// Call LLM /generate and measure time
export async function callLLM(prompt, opts = {}) {
  if (!LLM_URI) throw new Error('LLM_URI not configured');
  const start = performance.now();
  const r = await fetch(new URL('/generate', LLM_URI).toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, ...opts })
  });
  const duration = performance.now() - start;
  performanceStats.llmResponseTimes.push(duration);
  if (performanceStats.llmResponseTimes.length > 100) performanceStats.llmResponseTimes.shift();
  const data = await r.json().catch(() => null);
  return { ok: r.ok, data, latencyMs: Number(duration.toFixed(2)) };
}

// Extract citations like [Policy3.1] from text
export function extractCitations(text) {
  if (!text || typeof text !== 'string') return [];
  const re = /\[([A-Za-z0-9_.-]+)\]/g;
  const matches = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    matches.push(m[1]);
  }
  return Array.from(new Set(matches));
}

// Validate extracted citation ids against the knowledgeBase
export function validateCitations(text) {
  const ids = extractCitations(text);
  const kbIds = new Set((knowledgeBase || []).map(i => i.id));
  const valid = [];
  const invalid = [];
  for (const id of ids) {
    if (kbIds.has(id)) valid.push(id);
    else invalid.push(id);
  }
  return { isValid: invalid.length === 0 && valid.length > 0, validCitations: valid, invalidCitations: invalid };
}

// Example high-level assistant flow: classify + route to function or LLM
export async function processAssistantInput(input) {
  const intent = classifyIntent(input);
  const result = { intent, text: '', citations: [], functionsCalled: [] };

  // Route by intent
  if (intent === 'order_status') {
    // extract order id and call function registry
    const ids = input.match(/[A-Z0-9]{10,}/g);
    if (ids && ids.length) {
      const orderId = ids[0];
      try {
        const fnRes = await functionRegistry.execute('getOrderStatus', { orderId });
        result.functionsCalled.push('getOrderStatus');
        result.text = `Order ${orderId} status: ${fnRes.status}`;
        return result;
      } catch (err) {
        result.text = 'Could not fetch order status.';
        return result;
      }
    }
  }

  if (intent === 'product_search') {
    // delegate to product search function
    result.functionsCalled.push('searchProducts');
    try {
      const fnRes = await functionRegistry.execute('searchProducts', { query: input, limit: 5 });
      result.text = `Found ${fnRes.length} products.`;
      result.citations = fnRes.slice(0,3).map(p => ({ id: p._id || p.id, title: p.name || p.title }));
      return result;
    } catch (err) {
      result.text = 'Product search failed.';
      return result;
    }
  }

  if (intent === 'policy_question') {
    // ground on KB first: find relevant policies and include them in the prompt
    const policies = findRelevantPolicies(input, 3);
    if (policies && policies.length > 0) {
      // build grounded prompt with identity, tone, and the found policy texts
      const grounded = buildGroundedPrompt(input, intent, policies);
      try {
        const llmRes = await callLLM(grounded);
        const text = (llmRes.data && llmRes.data.text) ? llmRes.data.text : (llmRes.data ? JSON.stringify(llmRes.data) : 'No response');
        result.text = text;
        // populate citations extracted from the response
        const cited = extractCitations(text);
        result.citations = cited;
        // validate citations
        try { result.citationValidation = validateCitations(text); } catch (e) { result.citationValidation = { isValid: false, validCitations: [], invalidCitations: [] }; }
        return result;
      } catch (err) {
        result.text = 'Assistant failed to generate grounded policy answer.';
        return result;
      }
    }
    // If no policies found, fall through to default LLM behavior below
  }

  // default: call LLM for open questions / policy
  try {
    const prompt = `User asked: ${input}`;
    const llmRes = await callLLM(prompt);
    result.text = (llmRes.data && llmRes.data.text) ? llmRes.data.text : (llmRes.data ? JSON.stringify(llmRes.data) : 'No response');
    // validate citations in LLM output
    try {
      const report = validateCitations(result.text);
      result.citationValidation = report;
    } catch (e) {
      result.citationValidation = { isValid: false, validCitations: [], invalidCitations: [] };
    }
    return result;
  } catch (err) {
    result.text = 'Assistant error';
    return result;
  }
}

// Find relevant policies from the knowledge base by simple token overlap scoring
export function findRelevantPolicies(query, topN = 3) {
  if (!query || !knowledgeBase || !Array.isArray(knowledgeBase)) return [];
  const q = query.toLowerCase();
  const tokens = q.split(/\W+/).filter(Boolean).map(t => t.trim()).filter(t => t.length > 2);
  const scores = knowledgeBase.map((item) => {
    const hay = `${item.question} ${item.answer}`.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (hay.includes(t)) score += 1;
    }
    return { item, score };
  }).filter(s => s.score > 0).sort((a,b) => b.score - a.score).slice(0, topN).map(s => s.item);
  return scores;
}

// Build a grounded prompt that includes identity, tone instructions, and the selected policies
export function buildGroundedPrompt(query, intent, policies = []) {
  const identity = prompts?.identity?.description || 'You are a helpful support agent.';
  const never = (prompts?.never_say || []).join('\n');
  const tone = (prompts?.intents && prompts.intents[intent] && prompts.intents[intent].tone) || (prompts?.response_guidelines?.tone_per_intent && prompts.response_guidelines.tone_per_intent[intent]) || 'professional and concise';

  let policyText = '';
  if (policies && policies.length > 0) {
    policyText = 'Grounded policies (cite as [ID]):\n';
    for (const p of policies) {
      policyText += `[${p.id}] ${p.question}\n${p.answer}\n\n`;
    }
  }

  const prompt = `Identity:\n${identity}\n\nDo not say:\n${never}\n\nTone: ${tone}\n\n${policyText}User question:\n${query}\n\nInstructions:\n- Answer relying only on the provided grounded policies when possible.\n- Include inline citations like [PolicyID] when referencing those policies.\n- If no policy applies, answer concisely and do not hallucinate policy references.\n- Keep the response short and customer-friendly.\n`;
  return prompt;
}

  // --- Express router exported from the assistant module so the route can be mounted
  import express from 'express';

  const router = express.Router();

  router.get('/ping', async (req, res) => {
    try {
      const r = await pingLLM();
      res.json(r);
    } catch (err) {
      res.status(500).json({ up: false, error: String(err) });
    }
  });

  router.post('/query', async (req, res) => {
    try {
      const { query } = req.body || {};
      if (!query) return res.status(400).json({ error: 'Missing query' });
      const out = await processAssistantInput(query);
      res.json(out);
    } catch (err) {
      console.error('Assistant query error', err);
      res.status(500).json({ error: 'Assistant failed' });
    }
  });

  export default router;