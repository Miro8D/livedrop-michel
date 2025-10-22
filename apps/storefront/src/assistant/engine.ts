import groundTruth from './ground-truth.json';
import { fetchOrderStatus } from '../lib/api';

const STOP_WORDS = new Set([
  'what','is','how','do','i','my','the','a','an','of','for','in','on','to','from','by','with','that','this','be','have','has','was','were','will','would','should','could','when','which','where','who','why','as','at','or','but','if','then','so','than','also','you','me'
]);

const SYNONYMS: Record<string, string[]> = {
  shipping: ['delivery','ship','shipped','delivered','track','tracking'],
  order: ['purchase','orderid','order-id','order#'],
  return: ['refund','returns','exchange'],
  cancel: ['cancellation','cancelled','void'],
  payment: ['pay','paid','card','credit','paypal']
};

function levenshtein(a: string, b: string) {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function scoreQuestion(userQ: string, qa: { question: string }) {
  const uq = userQ.toLowerCase();
  const userTokens = uq.split(/\W+/).filter(t => t.length > 2 && !STOP_WORDS.has(t));
  const qaTokens = qa.question.toLowerCase().split(/\W+/).filter(t => t.length > 2 && !STOP_WORDS.has(t));
  if (qaTokens.length === 0 || userTokens.length === 0) return 0;

  const exactHits = qaTokens.filter(t => userTokens.includes(t)).length;
  const baseScore = exactHits / Math.max(userTokens.length, qaTokens.length);

  let fuzzyMatches = 0;
  for (const u of userTokens) {
    for (const q of qaTokens) {
      if (u === q) continue;
      if (levenshtein(u, q) <= 2) fuzzyMatches++;
    }
  }

  let synonymMatches = 0;
  for (const u of userTokens) {
    for (const [key, vals] of Object.entries(SYNONYMS)) {
      if (u === key || vals.includes(u)) {
        if (qaTokens.includes(key) || vals.some(v => qaTokens.includes(v))) synonymMatches++;
      }
    }
  }

  const combined = Math.min(1, baseScore + (fuzzyMatches * 0.08) / Math.max(userTokens.length, qaTokens.length) + (synonymMatches * 0.12) / Math.max(userTokens.length, qaTokens.length));
  return combined;
}

const ORDER_ID_REGEX = /[A-Z0-9]{10,}/g;

export async function askSupport(query: string) {
  const orderIds = query.match(ORDER_ID_REGEX);
  if (orderIds && orderIds.length > 0) {
    const orderId = orderIds[0];
    const masked = '****' + orderId.slice(-4);
    const status = await fetchOrderStatus(orderId);
    return `Order ${masked} status: ${status.status}${status.carrier ? `, Carrier: ${status.carrier}` : ''}${status.eta ? `, ETA ${status.eta}` : ''}.`;
  }

  const scored = (groundTruth as any[])
    .map(q => ({ ...q, score: scoreQuestion(query, q) }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score < 0.15) {
    return "I apologize, but I don't have enough information to answer that question accurately. Please try rephrasing your question or contact our customer service team for more specific assistance.";
  }

  return `${best.answer} [${best.qid}]`;
}
