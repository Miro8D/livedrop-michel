import express from "express";
import { connectDB } from "../db.js";

const router = express.Router();

router.get("/daily-revenue", async (req, res) => {
  try {
    const db = await connectDB();
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: "Missing from/to query parameters" });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    const data = await db.collection("orders").aggregate([
      {
        $match: {
          createdAt: { $gte: fromDate, $lte: toDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$total" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { "_id": 1 },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          revenue: 1,
          orderCount: 1,
        },
      },
    ]).toArray();

    res.json(data);
  } catch (err) {
    console.error("Error in daily-revenue analytics:", err);
    res.status(500).json({ error: "Failed to fetch daily revenue" });
  }
});

router.get("/dashboard-metrics", async (req, res) => {
  try {
    const db = await connectDB();

    const [summary] = await db.collection("orders").aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$total" },
        },
      },
    ]).toArray();

    const statusBreakdown = await db.collection("orders").aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]).toArray();

    res.json({
      totalRevenue: summary?.totalRevenue || 0,
      totalOrders: summary?.totalOrders || 0,
      avgOrderValue: parseFloat((summary?.avgOrderValue || 0).toFixed(2)),
      statusBreakdown,
    });
  } catch (err) {
    console.error("Error in dashboard-metrics analytics:", err);
    res.status(500).json({ error: "Failed to fetch dashboard metrics" });
  }
});

export default router;
