import express from "express";
import { pingLLM } from '../assistant/engine.js';
import { connectDB } from "../db.js";
import { performanceStats } from "../server.js";

const router = express.Router();

router.get("/business-metrics", async (req, res) => {
  try {
    const db = await connectDB();
    const orders = db.collection("orders");

    const pipeline = [
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$total" },
        },
      },
    ];

    const statusPipeline = [
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ];

    const [main] = await orders.aggregate(pipeline).toArray();
    const statusBreakdown = await orders.aggregate(statusPipeline).toArray();

    res.json({
      totalRevenue: main?.totalRevenue || 0,
      totalOrders: main?.totalOrders || 0,
      avgOrderValue: main?.avgOrderValue || 0,
      statusBreakdown,
    });
  } catch (err) {
    console.error("Error fetching business metrics:", err);
    res.status(500).json({ error: "Failed to fetch business metrics" });
  }
});

router.get("/performance", async (req, res) => {
  try {
    const latencies = performanceStats.latencies;
    const avgLatency =
      latencies.length > 0
        ? latencies.reduce((a, b) => a + b, 0) / latencies.length
        : 0;

    const avgLLMResponse =
      performanceStats.llmResponseTimes.length > 0
        ? performanceStats.llmResponseTimes.reduce((a, b) => a + b, 0) /
          performanceStats.llmResponseTimes.length
        : 0;

    res.json({
      totalRequests: performanceStats.totalRequests,
      failedRequests: performanceStats.failedRequests,
      averageLatencyMs: Number(avgLatency.toFixed(2)),
      recentLatencySamples: latencies.slice(-10).map(n => Number(n.toFixed(2))),
      activeSSEConnections: performanceStats.sseConnections,
      averageLLMResponseMs: Number(avgLLMResponse.toFixed(2)),
      llm: { up: false, lastLatencyMs: null },
      timestamp: new Date()
    });
  } catch (err) {
    console.error("Error fetching performance data:", err);
    res.status(500).json({ error: "Failed to fetch performance data" });
  }
});

// Optionally check LLM ping when requested
router.get('/performance/with-llm', async (req, res) => {
  try {
    const base = await router.handle ? true : true; // noop to keep structure
    const perfRes = await (async () => {
      const latencies = performanceStats.latencies;
      const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
      const avgLLMResponse = performanceStats.llmResponseTimes.length > 0 ? performanceStats.llmResponseTimes.reduce((a, b) => a + b, 0) / performanceStats.llmResponseTimes.length : 0;
      return {
        totalRequests: performanceStats.totalRequests,
        failedRequests: performanceStats.failedRequests,
        averageLatencyMs: Number(avgLatency.toFixed(2)),
        recentLatencySamples: latencies.slice(-10).map(n => Number(n.toFixed(2))),
        activeSSEConnections: performanceStats.sseConnections,
        averageLLMResponseMs: Number(avgLLMResponse.toFixed(2)),
        timestamp: new Date()
      };
    })();

    const result = { ...perfRes, llm: { up: false, lastLatencyMs: null } };
    try {
      const llm = await pingLLM();
      result.llm = { up: !!llm.up, lastLatencyMs: llm.latencyMs ?? null };
    } catch (err) {
      result.llm = { up: false, lastLatencyMs: null };
    }

    res.json(result);
  } catch (err) {
    console.error('Error fetching performance+llm data', err);
    res.status(500).json({ error: 'Failed to fetch perf with llm' });
  }
});

router.get("/assistant-stats", async (req, res) => {
  try {
    const intents = [
      { name: "CheckOrderStatus", count: 34 },
      { name: "AddToCart", count: 21 },
      { name: "SearchProducts", count: 45 },
      { name: "Checkout", count: 18 },
      { name: "TrackShipment", count: 12 },
    ];

    const functions = [
      { name: "getOrders", calls: 28 },
      { name: "getProducts", calls: 40 },
      { name: "createOrder", calls: 15 },
      { name: "calculateRevenue", calls: 9 },
    ];

    const totalIntents = intents.reduce((a, b) => a + b.count, 0);
    const totalFunctions = functions.reduce((a, b) => a + b.calls, 0);

    res.json({
      totalIntents,
      totalFunctions,
      intents,
      functions,
      lastUpdated: new Date(),
    });
  } catch (err) {
    console.error("Error fetching assistant stats:", err);
    res.status(500).json({ error: "Failed to fetch assistant stats" });
  }
});

export default router;
