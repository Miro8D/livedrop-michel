import { describe, test, expect } from "vitest";
import request from "supertest";
import app from "../src/server.js";

describe("Integration Tests", () => {
  let orderId;

  test("Complete Purchase Flow", async () => {
    const prodRes = await request(app).get("/api/products");
    const firstProduct = prodRes.body[0];
    const orderRes = await request(app)
      .post("/api/orders")
      .send({ productId: firstProduct.id, quantity: 1, email: "user@test.com" });
    expect(orderRes.statusCode).toBe(201);
    orderId = orderRes.body.id;

    const streamRes = await request(app).get(`/api/orders/${orderId}/stream`);
    expect(streamRes.statusCode).toBe(200);

    const assistantRes = await request(app)
      .post("/api/assistant")
      .send({ query: `What's the status of order ${orderId}?` });
    expect(assistantRes.statusCode).toBe(200);
    expect(assistantRes.body.functionsCalled).toContain("getOrderStatus");
  });

  test("Support Interaction Flow", async () => {
    const policyRes = await request(app)
      .post("/api/assistant")
      .send({ query: "What is your return policy?" });
    expect(policyRes.statusCode).toBe(200);
    expect(policyRes.body.citations.validCitations.length).toBeGreaterThan(0);

    const complaintRes = await request(app)
      .post("/api/assistant")
      .send({ query: "My item arrived broken." });
    expect(complaintRes.statusCode).toBe(200);
    expect(complaintRes.body.intent).toBe("complaint");
  });

  test("Multi-Intent Conversation", async () => {
    await request(app).post("/api/assistant").send({ query: "Hello!" });
    await request(app).post("/api/assistant").send({ query: "Show me phones." });
    const policy = await request(app)
      .post("/api/assistant")
      .send({ query: "What’s your refund policy?" });
    expect(policy.body.intent).toBe("policy_question");
    const status = await request(app)
      .post("/api/assistant")
      .send({ query: "Track order #123" });
    expect(status.body.intent).toBe("order_status");
  });
});
