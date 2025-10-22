import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

export async function connectDB() {
  if (db) return db;

  try {
    await client.connect();
    console.log("MongoDB connected");
    db = client.db("store");
    return db;
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
}

export { client };
