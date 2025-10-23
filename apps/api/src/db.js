import { MongoClient } from "mongodb";

let client;
let db;
let _mongodInstance; // when we start an in-memory server for tests

async function ensureTestMongo() {
  // If running tests and no usable MONGODB_URI is present, start in-memory mongo
  const uri = process.env.MONGODB_URI;
  if (process.env.NODE_ENV === 'test' && (!uri || uri.includes('127.0.0.1'))) {
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      _mongodInstance = await MongoMemoryServer.create();
      process.env.MONGODB_URI = _mongodInstance.getUri();
      console.log('Started in-memory MongoDB for tests at', process.env.MONGODB_URI);
    } catch (e) {
      console.warn('Could not start in-memory mongo:', e && e.message ? e.message : e);
    }
  }
}

function createClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  return new MongoClient(uri);
}

export async function connectDB() {
  if (db) return db;

  try {
    await ensureTestMongo();
    if (!client) client = createClient();
    await client.connect();
    console.log("MongoDB connected");
    db = client.db("store");
    return db;
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    // Throw instead of exiting so test runner can handle the failure
    throw err;
  }
}

export { client };
