import express from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../db.js";
import { performanceStats } from "../server.js";

const router = express.Router();

const delay = (min, max) =>
  new Promise((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min)
  );

router.get("/:id/stream", async (req, res) => {
  const db = await connectDB();
  const orders = db.collection("orders");
  const orderId = req.params.id;

  performanceStats.sseConnections++;

  res.on("close", () => {
    performanceStats.sseConnections--;
    console.log(`SSE connection closed for order ${orderId}`);
  });

  let order;
  try {
    order = await orders.findOne({ _id: new ObjectId(orderId) });
  } catch {
    order = await orders.findOne({ _id: orderId });
  }

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ status: order.status })}\n\n`);

  const flow = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
  let currentIndex = flow.indexOf(order.status);
  if (currentIndex === -1) currentIndex = 0;
  let closed = false;

  req.on("close", () => (closed = true));

  async function progress() {
    while (!closed && currentIndex < flow.length - 1) {
      const current = flow[currentIndex];
      const next = flow[currentIndex + 1];

      if (current === "PENDING") await delay(3000, 5000);
      else await delay(5000, 7000);

      await orders.updateOne(
        { _id: order._id },
        { $set: { status: next, updatedAt: new Date() } }
      );

      res.write(`data: ${JSON.stringify({ status: next })}\n\n`);
      console.log(`Order ${orderId} → ${next}`);

      currentIndex++;

      if (next === "DELIVERED") {
        res.write(`event: close\ndata: stream closed\n\n`);
        res.end();
        console.log(`Order ${orderId} reached DELIVERED — stream closed.`);
        break;
      }
    }
  }

  progress().catch((err) => {
    console.error("Error in SSE simulation:", err);
    res.end();
  });
});

export default router;
