# Deployment Guide

This document explains how to deploy and run the Shoplite system, including the database, backend API, frontend interface, and the LLM service.

The project can be visited [here](https://livedrop-michel.vercel.app/)

The API is hosted on https://livedrop-l0el.onrender.com/

---

## 1. MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas and create an account or sign in
2. Create a new project
3. Under Database Deployments, create a free cluster
4. Choose your preferred region.
5. Create new database user
6. Enable `0.0.0.0/0` (to allow access from anywhere).
7. Then copy the connection string from the drivers section
8. Add it to your backend `.env` file:

```markdown
# Deployment Guide

This document explains how to deploy and run the Shoplite system, including the database, backend API, frontend interface, and the LLM service.

---

## 1. MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas and create an account or sign in
2. Create a new project
3. Under Database Deployments, create a free cluster
4. Choose your preferred region.
5. Create new database user
6. Enable `0.0.0.0/0` (to allow access from anywhere).
7. Then copy the connection string from the drivers section
8. Add it to your backend `.env` file:

---

## 2. Backend Deployment

1. Push your code to GitHub.
2. Go to https://render.com and create a new Web Service.
3. Connect it to your GitHub repository.
4. Set the root directory to `apps/api`.
5. Set the build command to `npm install`.
6. Set the start command to `node src/server`.
7. Add the following environment variables:

MONGODB_URI=your_mongo_uri_here
LLM_URI=https://your-ngrok-url.ngrok-free.app

8. Deploy the service.

---

## 3. Frontend Deployment (Vercel)

1. Push the `apps/storefront` folder to GitHub.
2. Go to https://vercel.com and create a new project.
3. Import the GitHub repository.
4. Set the root directory to `apps/storefront`.
5. Build command: `npm i --legacy-peer-deps && npm run build`
6. Output directory: `dist` (or `.next` if you are using Next.js)
7. Add the following environment variable:

VITE_API_BASE_URL= your render.com website

8. Deploy the project.

---

## 4. LLM Setup (Week 3 to Week 5 Update)

1. Open your Week 3 Colab notebook that runs the LLM.
2. Add this endpoint at the bottom of the Flask app:

```python
@app.route('/generate', methods=['POST'])
def generate():
    """Simple text completion - no RAG, no retrieval"""
    prompt = request.json.get('prompt')
    max_tokens = request.json.get('max_tokens', 500)
    
    response = model.generate(prompt, max_tokens=max_tokens)
    
    return jsonify({"text": response})
```

3. Run all cells to start Flask and ngrok.

4. Copy the ngrok URL displayed

Add the URL to the backend .env file:

LLM_API_URL=https://7c1a-34-75-11-217.ngrok-free.app


## 5. Run locally (development)

These steps explain how to run the backend API and the storefront locally for development and quick smoke tests.

Prerequisites
- Node.js v18+ (recommended)
- npm (or pnpm)
- A MongoDB connection (Atlas or local mongod)
- An LLM service reachable from your machine, or a local stub for testing

Repository layout (relevant folders)
- `apps/api` — backend API
- `apps/storefront` — frontend (Vite + React)

1) Backend — install and run

```bash
# from repo root
cd apps/api
npm install
# create an `.env` file in apps/api (example below)
# then start the API (dev or production)
npm run dev   # if you have a dev script (nodemon) or
node src/server.js
```

Example `apps/api/.env` (replace values):

```text
MONGODB_URI="mongodb+srv://<user>:<pass>@cluster0.example.mongodb.net/shoplite?retryWrites=true&w=majority"
PORT=5000
LLM_URI="https://your-llm.example"   # must expose /ping and /generate
```

2) Frontend — install and run

```bash
cd ../../apps/storefront
npm install --legacy-peer-deps
# set the API base URL for the storefront (so it can call the backend)
export VITE_API_BASE_URL=http://localhost:5000
npm run dev
```

3) Quick smoke tests

Run these from any terminal (adjust host/port if you changed them):

```bash
# dashboard performance
curl -sS http://localhost:5000/api/dashboard/performance | jq .

# assistant LLM ping
curl -sS http://localhost:5000/api/assistant/ping | jq .

# assistant sample query
curl -sS -X POST http://localhost:5000/api/assistant/query \
    -H 'Content-Type: application/json' \
    -d '{"query":"Can I return items within 30 days? Please cite policy."}' | jq .
```

If `/api/assistant/ping` returns `{"up":false,...}` or queries return `"text":"No response"`, then either your `LLM_URI` is unreachable or the LLM service returns a different JSON shape than the engine expects (engine expects a top-level `text` field from `/generate`).

4) Stubbing the LLM for local testing

If you don't have an LLM available, temporarily stub `callLLM()` in `apps/api/src/assistant/engine.js` to return a deterministic response so you can test the UI and plumbing. Example quick stub:

```js
// inside callLLM or where engine makes the fetch to LLM
return { text: 'This is a local stub response. [Policy-123]' };
```

5) Troubleshooting notes
- If using MongoDB Atlas, ensure your IP allowlist includes your machine (or use 0.0.0.0/0 for quick testing).
- If the storefront can't reach the API, confirm `VITE_API_BASE_URL` is set and backend CORS is configured.
- When deploying to Render/Vercel, use the environment-variable instructions in sections 2 and 3 above.

That's all — once both services are running you can open the storefront (Vite will print the local URL) and exercise the Support Assistant and admin dashboard.

``` 