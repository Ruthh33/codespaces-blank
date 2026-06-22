#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "Starting Postgres via docker-compose..."
docker-compose up -d postgres

export DATABASE_URL="postgres://postgres:postgres@localhost:5432/embedded_signup"

echo "Waiting for Postgres to accept connections..."
node -e "const {Client}=require('pg');(async()=>{const c=new Client({connectionString:process.env.DATABASE_URL});for(let i=0;i<60;i++){try{await c.connect();await c.end();console.log('connected');process.exit(0);}catch(e){await new Promise(r=>setTimeout(r,1000));}}console.error('timeout waiting for postgres');process.exit(2);})();"

echo "Running migrations..."
pnpm run migrate

echo "Running e2e tests..."
pnpm run test:e2e

echo "Done. Postgres left running."
