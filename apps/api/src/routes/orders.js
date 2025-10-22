import express from "express";
import { connectDB } from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const db = await connectDB();
    const ordersCol = db.collection("orders");

    const { customerId, items, total, status = "PENDING" } = req.body;

    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    const newOrder = {
      customerId,
      items,
      total,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ordersCol.insertOne(newOrder);

    res.status(201).json({
      message: "Order created successfully",
      orderId: result.insertedId,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const ordersCol = db.collection("orders");
    const { id } = req.params;
    const { ObjectId } = await import("mongodb");

    // Validate id format to avoid BSONError when constructing ObjectId
    if (!ObjectId.isValid(id)) {
      console.warn(`Invalid order id requested: ${id}`);
      return res.status(400).json({ error: "Invalid order id format" });
    }

    const order = await ordersCol.findOne({ _id: new ObjectId(id) });
    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json(order);
  } catch (err) {
    console.error("Error fetching order by ID: ", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const ordersCol = db.collection("orders");
    const { customerId } = req.query;

    if (!customerId) {
        const orders = await ordersCol.find().sort({}).toArray();
        res.json(orders);
        return;
    }

    const orders = await ordersCol
      .find({ customerId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

export default router;
