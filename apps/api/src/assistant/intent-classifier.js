export function classifyIntent(input) {
  if (!input || typeof input !== "string") return "off_topic";
  const text = input.toLowerCase();

  // Violation / abusive content
  const violationKeywords = ["stupid", "idiot", "hate", "dumb", "kill", "trash", "f***", "suck"];
  if (violationKeywords.some(k => text.includes(k))) return "violation";

  // Policy or shipping related questions
  const policyKeywords = [
    "return", "refund", "exchange", "policy", "shipping", "warranty", "guarantee",
    "delivery time", "how long", "when will", "cancel order"
  ];
  if (policyKeywords.some(k => text.includes(k))) return "policy_question";

  // Order status inquiries
  const orderKeywords = [
    "track", "status", "order", "shipped", "processing", "delivered", "where is my"
  ];
  if (orderKeywords.some(k => text.includes(k))) return "order_status";

  // Product search or catalog questions
  const productKeywords = [
    "find", "show me", "have", "available", "in stock", "buy", "sell", "product", "price"
  ];
  if (productKeywords.some(k => text.includes(k))) return "product_search";

  // Complaint or problem statements
  const complaintKeywords = [
    "problem", "issue", "broken", "bad", "didn't work", "not working", "angry", "disappointed"
  ];
  if (complaintKeywords.some(k => text.includes(k))) return "complaint";

  // Chitchat or small talk
  const chitchatKeywords = [
    "hello", "hi", "hey", "how are you", "good morning", "good evening",
    "what's up", "thank you", "thanks", "bye", "see you"
  ];
  if (chitchatKeywords.some(k => text.includes(k))) return "chitchat";

  // If none matched
  return "off_topic";
}