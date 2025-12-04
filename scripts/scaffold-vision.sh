#!/usr/bin/env bash
set -e

mkdir -p apps/portfolio/pages/demos apps/portfolio/pages/api/lead services/lead services/rag data .github/workflows

# Next.js app placeholder
cat > apps/portfolio/package.json <<'JSON'
{
  "name": "portfolio",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "eslint . --ext .ts,.tsx"
  },
  "dependencies": {
    "next": "14",
    "react": "18",
    "react-dom": "18"
  }
}
JSON

# Minimal Next.js page for demo
cat > apps/portfolio/pages/demos/lead.tsx <<'TSX'
import React from 'react';
export default function LeadDemo() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Lead Qualifier Demo</h1>
      <p>Upload CSV or paste leads to run the demo. This page calls /api/lead/qualify.</p>
      <pre style={{ background: '#f6f8fa', padding: 12 }}>Demo UI placeholder — replace with real UI</pre>
    </main>
  );
}
TSX

# Next.js API proxy to Python service
cat > apps/portfolio/pages/api/lead/qualify.ts <<'TS'
import type { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = process.env.LEAD_SERVICE_URL || 'http://localhost:8001/qualify';
  const r = await fetch(url, { method: 'POST', body: JSON.stringify(req.body), headers: { 'Content-Type': 'application/json' }});
  const data = await r.json();
  res.status(200).json(data);
}
TS

# Python FastAPI skeleton for lead service
cat > services/lead/requirements.txt <<'TXT'
fastapi
uvicorn[standard]
pydantic
requests
TXT

cat > services/lead/app.py <<'PY'
from fastapi import FastAPI
from pydantic import BaseModel
from planner import plan_for_leads
from executor import execute_plan

app = FastAPI()

class Leads(BaseModel):
    leads: list

@app.post("/qualify")
async def qualify(payload: Leads):
    plan = plan_for_leads(payload.leads)
    result = await execute_plan(plan)
    return {"plan": plan, "result": result}
PY

cat > services/lead/planner.py <<'PY'
import time
def plan_for_leads(leads):
    return {
        "planId": f"lead-{int(time.time())}",
        "steps": [
            {"id":"normalize","action":"normalize-leads"},
            {"id":"score","action":"score-leads","usesLLM":True},
            {"id":"export","action":"export-qualified","requiresApproval":True}
        ],
        "leads_count": len(leads)
    }
PY

cat > services/lead/executor.py <<'PY'
import asyncio
async def execute_plan(plan):
    logs=[]
    for step in plan['steps']:
        logs.append({"step":step['id'],"status":"started"})
        await asyncio.sleep(0.2)
        logs.append({"step":step['id'],"status":"succeeded"})
    return {"logs":logs,"status":"completed"}
PY

# Docker Compose
cat > docker-compose.yml <<'YML'
version: '3.8'
services:
  web:
    build: ./apps/portfolio
    ports: ['3000:3000']
    environment:
      - LEAD_SERVICE_URL=http://lead:8001/qualify
  lead:
    build: ./services/lead
    ports: ['8001:8001']
YML

# Simple Dockerfiles
cat > apps/portfolio/Dockerfile <<'DF'
FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
CMD ["npm","run","dev"]
DF

cat > services/lead/Dockerfile <<'DF'
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn","app:app","--host","0.0.0.0","--port","8001","--reload"]
DF

# CI skeleton
cat > .github/workflows/ci.yml <<'YML'
name: CI
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with: node-version: '20'
      - name: Lint JS
        run: |
          cd apps/portfolio || exit 0
          npm ci || true
          npm run lint || true
YML

echo "Scaffold created."
