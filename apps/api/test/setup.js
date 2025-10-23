import { MongoMemoryServer } from 'mongodb-memory-server';
import { execSync } from 'child_process';
import path from 'path';

let mongod;

export default async function () {
  // Start in-memory MongoDB
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;

  // Seed the database by running the seed script
  // Use node to run the seed script directly
  try {
    const seedPath = path.resolve('./src/seed.js');
    // Run the seed in a child process so it uses the same node environment
    execSync(`node ${seedPath}`, { stdio: 'inherit' });
  } catch (err) {
    // If seeding fails, log but continue; tests may create their own data
    console.error('Seeding in-memory mongo failed:', err.message || err);
  }

  // Provide a global teardown when Vitest exits
  const cleanup = async () => {
    if (mongod) await mongod.stop();
  };

  process.on('exit', cleanup);
}
