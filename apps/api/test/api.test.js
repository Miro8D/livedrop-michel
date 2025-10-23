import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/server.js"; // adjust path if needed

describe("API Endpoints", () => {
  it("GET /api/products returns an array", async () => {
    const res = await request(app).get("/api/products");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/orders creates an order with valid data", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ productId: "P001", quantity: 1, email: "test@example.com" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
  });

  it("POST /api/orders returns 400 for invalid data", async () => {
    const res = await request(app).post("/api/orders").send({});
    expect(res.statusCode).toBe(400);
  });

  it("GET /api/analytics returns JSON stats", async () => {
    const res = await request(app).get("/api/analytics");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("sseConnections");
    expect(res.body).toHaveProperty("totalRequests");
  });

  it("GET unknown route returns JSON error", async () => {
    const res = await request(app).get("/unknown");
    expect(res.headers["content-type"]).toMatch(/json/);
  });
});
