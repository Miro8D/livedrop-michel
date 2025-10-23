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

// Create or update a customer by email
router.post('/', async (req, res) => {
  try {
    const db = await connectDB();
    const { email, name, phone, address } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Missing email' });

    const customers = db.collection('customers');
    const now = new Date();
    const update = {
      $set: {
        email,
        name: name || null,
        phone: phone || null,
        address: address || null,
        updatedAt: now
      },
      $setOnInsert: { createdAt: now }
    };

    const r = await customers.findOneAndUpdate(
      { email: { $regex: `^${email}$`, $options: 'i' } },
      update,
      { upsert: true, returnDocument: 'after' }
    );

    res.json(r.value || null);
  } catch (err) {
    console.error('Error creating/updating customer:', err);
    res.status(500).json({ error: 'Failed to create or update customer' });
  }
});

export default router;
