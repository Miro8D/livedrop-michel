import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import productsRoute from './routes/products.js';
import ordersRoute from './routes/orders.js';
import customersRoute from './routes/customers.js';
import analyticsRoute from './routes/analytics.js';
import dashboardRoute from './routes/dashboard.js';
import orderStatusSseRouter from "./sse/order-status.js";


const app = express();
app.use(cors());
app.use(express.json());

// Only auto-connect to the DB and start listening when not in test mode.
// Tests should import the app directly and manage DB connectivity.
if (process.env.NODE_ENV !== 'test') {
  await connectDB();
}

// Track request times
const performanceStats = {
  totalRequests: 0,
  failedRequests: 0,
  latencies: [],
  sseConnections: 0,
  llmResponseTimes: []
};

// Middleware to measure latency
app.use((req, res, next) => {
  const start = performance.now();

  res.on("finish", () => {
    const latency = performance.now() - start;
    performanceStats.latencies.push(latency);
    performanceStats.totalRequests++;

    if (performanceStats.latencies.length > 100)
      performanceStats.latencies.shift();

    if (res.statusCode >= 400)
      performanceStats.failedRequests++;
  });

  next();
});

export { performanceStats };
// Dynamically import assistant route after performanceStats is initialized to avoid
// a circular import between server.js and assistant/engine.js
let assistantRoute;
try {
  const mod = await import('./assistant/engine.js');
  assistantRoute = mod.default;
  if (mod.setPerformanceStats) mod.setPerformanceStats(performanceStats);
} catch (e) {
  console.warn('Could not load assistant router at startup:', e && e.message ? e.message : e);
}

app.use("/api/products", productsRoute);
app.use("/api/orders", ordersRoute);
app.use("/api/customers", customersRoute);
app.use("/api/analytics", analyticsRoute);
app.use("/api/dashboard", dashboardRoute);
app.use("/api/orders", orderStatusSseRouter);
if (assistantRoute) app.use('/api/assistant', assistantRoute);

app.get('/', (req, res) => res.send('API running'));
if (process.env.NODE_ENV !== 'test') {
  app.listen(5000, () => console.log('Server running on port 5000'));
}

export default app;
