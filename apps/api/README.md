# Shoplite — API

This is the backend API for the Shoplite demo app. It is a small Express (ESM) service that talks to MongoDB and an external LLM service for the support assistant.

Contents
- `src/server.js` — app entrypoint
- `src/assistant/engine.js` — assistant logic, LLM adapter and Express router (mounted at `/api/assistant`)
- `src/db.js` — MongoDB connection helper
- `src/routes/*` — REST routes for products, orders, customers, analytics, dashboard

Quick start

1. From the repo root, change to the API folder:

```bash
cd apps/api
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in `apps/api` with these variables (example):

```ini
MONGODB_URI="mongodb+srv://<user>:<pass>@cluster0.example.mongodb.net/shoplite?retryWrites=true&w=majority"
PORT=5000
LLM_URI="https://your-llm.example"   # must expose /ping and /generate for assistant
```

4. Start the API:

Development (simple):
```bash
# runs Node directly - package.json script name is `run`
npm run run
```

Or run the server file directly:

```bash
node src/server.js
```

Available npm scripts
- `npm run run` — start the server using `node --env-file=.env src/server`
- `npm run seed` — run `src/seed` (seed sample data)
- `npm test` — run tests via Vitest

Key environment variables
- `MONGODB_URI` — MongoDB connection string
- `PORT` — optional; the server defaults to port 5000 in `server.js`
- `LLM_URI` — base URL of the external LLM service (engine expects `/ping` and `/generate` endpoints). If not configured assistant endpoints will report the LLM as unavailable.

Important endpoints
- GET /api/dashboard/performance — overall API performance stats
- GET /api/assistant/ping — ping the LLM via the assistant engine
- POST /api/assistant/query — assistant query endpoint (JSON body: `{ "query": "..." }`)
- REST resources mounted under `/api/products`, `/api/orders`, `/api/customers`, `/api/analytics`
- Server root: GET / — returns a simple 'API running' text

Assistant and LLM behavior
- The assistant engine (`src/assistant/engine.js`) performs intent classification, optional function calls (via a function registry), knowledge grounding (uses `docs/prompts.yaml` and `docs/ground-truth.json`), calls the external LLM at `LLM_URI` and validates any policy citations found in the LLM output.
- The engine expects that the external LLM's `/generate` returns JSON containing a top-level `text` property, for example: `{ "text": "Answer... [Policy-123]" }`. If the LLM returns a different format, the assistant will often respond with `No response`.
- For local development you can temporarily stub `callLLM()` in `src/assistant/engine.js` to return a deterministic object with a `text` field.

Troubleshooting
- MongoDB connection failure: ensure `MONGODB_URI` is correct and Atlas IP allowlist includes your dev machine (or 0.0.0.0/0 for quick testing).
- Assistant returns `No response`: check `LLM_URI` and that the external LLM returns `{ text: '...' }` from `/generate`.
- Circular import errors on startup: `server.js` dynamically imports the assistant router to avoid cycle — if you modify startup code ensure `performanceStats` injection is preserved via `setPerformanceStats()`.

Testing
- Unit/integration tests use Vitest. From `apps/api` run:

```bash
npm test
```

Contributing
- Follow the existing project coding style (ESM modules). If you add new environment variables, document them in this README and in `docs/deployment-guide.md`.

License
- ISC (see root package metadata)
