import 'dotenv/config';
import { sql } from './db.js';
await sql `CREATE TABLE IF NOT EXISTS admin (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`;
await sql `CREATE TABLE IF NOT EXISTS realisation (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  url TEXT NOT NULL,
  icon VARCHAR(8) NOT NULL DEFAULT 'J',
  completed_at DATE,
  stack JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`;
console.log('Tables admin et realisation créées/vérifiées.');
