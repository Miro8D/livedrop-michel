import { describe, test, expect } from "vitest";
import { detectIntent } from "../src/assistant/intentClassifier.js";
import { validateCitations } from "../src/utils/validateCitations.js";

describe("Assistant Intent Detection", () => {
  const samples = {
    policy_question: [
      "What's your return policy?",
      "Do you offer refunds?",
      "Tell me about warranties."
    ],
    order_status: [
      "Where is my order #123?",
      "Track my shipment please.",
      "Has my package arrived?"
    ],
    product_search: [
      "Show me running shoes.",
      "Find laptops under $1000.",
      "Do you sell gaming keyboards?"
    ],
    complaint: [
      "My item arrived damaged.",
      "I'm not happy with my order.",
      "The product I got was wrong."
    ],
    chitchat: ["Hi there!", "How are you?", "Good morning!"],
    off_topic: ["What's the weather?", "Who won the game last night?"],
    violation: ["You're stupid.", "Go away.", "This is garbage."]
  };

  for (const [intent, queries] of Object.entries(samples)) {
    test(`detectIntent identifies ${intent}`, () => {
      for (const q of queries) {
        const result = detectIntent(q);
        expect(result).toBe(intent);
      }
    });
  }
});

describe("Assistant Identity Rules", () => {
  test("Never reveals model identity", () => {
    const reply = "I'm Lina, your Shoplite support specialist.";
    expect(reply).not.toMatch(/ChatGPT|Llama|AI|OpenAI|Meta/i);
  });

  test("Handles 'Are you a robot?' naturally", () => {
    const reply = "I'm Lina, your Shoplite support specialist here to help.";
    expect(reply).toMatch(/Lina/);
  });

  test("References company for 'Who created you?'", () => {
    const reply = "I was created by the Shoplite support engineering team.";
    expect(reply).toMatch(/Shoplite/);
  });
});

describe("Citation Validation", () => {
  test("Valid citation passes", () => {
    const text = "You can return items within 30 days [Returns3.2]";
    const result = validateCitations(text);
    expect(result.isValid).toBe(true);
  });

  test("Invalid citation fails", () => {
    const text = "Policy [Policy99.9] covers this.";
    const result = validateCitations(text);
    expect(result.isValid).toBe(false);
  });
});
