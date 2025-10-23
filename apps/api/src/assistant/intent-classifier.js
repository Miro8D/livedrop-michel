export function classifyIntent(input) {
  if (!input || typeof input !== "string") return "off_topic";
  // Normalize: lowercase, replace non-alphanumeric with spaces, collapse spaces
  const text = input.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

  // Helper to check if any keyword tokens appear as whole words or phrases
  const contains = (kw) => {
    const k = kw.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
    return text.includes(k);
  };

  // Violation / abusive content
  const violationKeywords = ["stupid", "idiot", "hate", "dumb", "kill", "trash", "fuck", "suck"];
  if (violationKeywords.some(k => contains(k))) return "violation";

  // Policy or shipping related questions
  const policyKeywords = [
    "return", "refund", "exchange", "policy", "shipping", "warranty", "guarantee",
    "delivery time", "how long", "when will", "cancel order"
  ];
  if (policyKeywords.some(k => contains(k))) return "policy_question";

  // Order status inquiries
  const orderKeywords = [
    "track", "status", "order", "shipped", "processing", "delivered", "where is my"
  ];
  if (orderKeywords.some(k => contains(k))) return "order_status";

  // Product search or catalog questions
  const productKeywords = [
    "find", "show me", "have", "available", "in stock", "buy", "sell", "product", "price"
  ];
  if (productKeywords.some(k => contains(k))) return "product_search";

  // Complaint or problem statements
  const complaintKeywords = [
    "problem", "issue", "broken", "bad", "didnt work", "not working", "angry", "disappointed"
  ];
  if (complaintKeywords.some(k => contains(k))) return "complaint";

  // Chitchat or small talk
  const chitchatKeywords = [
    "hello", "hi", "hey", "how are you", "good morning", "good evening",
    "whats up", "thank you", "thanks", "bye", "see you"
  ];
  if (chitchatKeywords.some(k => contains(k))) return "chitchat";

  // If none matched
  return "off_topic";
}

// Backwards-compatible alias used by some tests
export const detectIntent = classifyIntent;