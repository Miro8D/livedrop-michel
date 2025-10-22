import express from "express";
import { connectDB } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Missing email parameter" });
    }

    const customer = await db
      .collection("customers")
      .findOne({ email: { $regex: `^${email}$`, $options: "i" } });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(customer);
  } catch (err) {
    console.error("Error fetching customer by email:", err);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;
    const { ObjectId } = await import("mongodb");

    const customer = await db
      .collection("customers")
      .findOne({ _id: new ObjectId(id) });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(customer);
  } catch (err) {
    console.error("Error fetching customer by ID:", err);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

export default router;
