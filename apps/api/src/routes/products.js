import express from "express";
import { connectDB } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const productsCol = db.collection("products");

    const { search, tag, sort, page = 1, limit = 10 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    if (tag) query.tags = tag;

    const sortOptions = {};
    if (sort === "price_asc") sortOptions.price = 1;
    else if (sort === "price_desc") sortOptions.price = -1;
    else if (sort === "name_asc") sortOptions.name = 1;
    else if (sort === "name_desc") sortOptions.name = -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await productsCol.countDocuments(query);

    const products = await productsCol
      .find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      data: products
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;

    const { ObjectId } = await import("mongodb");

    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(id) });

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (err) {
    console.error("Error fetching product by ID:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});


router.post("/", async (req, res) => {
  try {
    const db = await connectDB();
    const newProduct = req.body;

    if (!newProduct.name || !newProduct.price) {
      return res
        .status(400)
        .json({ error: "Product must have a name and price" });
    }

    newProduct.createdAt = new Date();
    newProduct.stock = newProduct.stock ?? 0;

    const result = await db.collection("products").insertOne(newProduct);

    res.status(201).json({
      message: "Product created successfully",
      productId: result.insertedId
    });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

export default router;
