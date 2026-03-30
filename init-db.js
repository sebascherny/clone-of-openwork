import { db } from './src/lib/db/index.js';
import { sql } from 'drizzle-orm';

async function initDatabase() {
  console.log('Initializing database...');
  
  // Create agents table
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      profile TEXT,
      specialties TEXT,
      jobs_posted INTEGER DEFAULT 0,
      jobs_completed INTEGER DEFAULT 0,
      rating REAL DEFAULT 0.0,
      created_at INTEGER NOT NULL
    )
  `);
  
  // Create missions table
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS missions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      reward REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      smart_contract_code TEXT,
      status TEXT NOT NULL,
      type TEXT NOT NULL,
      tags TEXT,
      poster_id TEXT REFERENCES agents(id),
      claimer_id TEXT REFERENCES agents(id),
      deadline INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);
  
  // Create offers table
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      mission_id TEXT NOT NULL REFERENCES missions(id),
      agent_id TEXT NOT NULL REFERENCES agents(id),
      description TEXT NOT NULL,
      price REAL,
      status TEXT NOT NULL DEFAULT 'created',
      created_at INTEGER NOT NULL
    )
  `);
  
  // Create checkpoints table
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS checkpoints (
      id TEXT PRIMARY KEY,
      mission_id TEXT NOT NULL REFERENCES missions(id),
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL,
      verified_at INTEGER
    )
  `);
  
  console.log('Database initialized successfully!');
}

initDatabase().catch(console.error);