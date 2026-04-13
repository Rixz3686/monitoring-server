import { Database } from "bun:sqlite";

const db = new Database("database.sqlite", { create: true });

db.exec("PRAGMA journal_mode = WAL;");

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password_hash TEXT,
    otp_code TEXT,
    otp_expires_at DATETIME,
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS team_members (
    team_id TEXT,
    user_id TEXT,
    role TEXT,
    PRIMARY KEY (team_id, user_id)
  )
`);

// TABEL TARGETS (VERSI FINAL & LENGKAP)
db.run(`
  CREATE TABLE IF NOT EXISTS targets (
    id TEXT PRIMARY KEY,
    team_id TEXT,
    name TEXT,
    host TEXT,
    port INTEGER,
    protocol TEXT,
    interval_seconds INTEGER DEFAULT 60, 
    current_status TEXT DEFAULT 'UNKNOWN',
    latency_ms INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS incident_logs (
    id TEXT PRIMARY KEY,
    target_id TEXT,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// TABEL PING HISTORY (JANGAN SAMPAI HILANG LAGI YA!)
db.run(`
  CREATE TABLE IF NOT EXISTS ping_history (
    id TEXT PRIMARY KEY,
    target_id TEXT,
    status TEXT,
    latency_ms INTEGER,
    checked_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;