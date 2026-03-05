import { Database } from "bun:sqlite";

const db = new Database("monitoring.sqlite", { create: true });
db.run("PRAGMA foreign_keys = ON;");

db.run(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`);
db.run(`CREATE TABLE IF NOT EXISTS teams (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`);
db.run(`CREATE TABLE IF NOT EXISTS team_members (team_id TEXT NOT NULL, user_id TEXT NOT NULL, role TEXT CHECK(role IN ('ADMIN', 'MEMBER', 'VIEWER')) NOT NULL, joined_at DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (team_id, user_id), FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);`);
db.run(`CREATE TABLE IF NOT EXISTS targets (id TEXT PRIMARY KEY, team_id TEXT NOT NULL, name TEXT NOT NULL, host TEXT NOT NULL, port INTEGER, protocol TEXT CHECK(protocol IN ('TCP', 'HTTP')) NOT NULL, interval_seconds INTEGER NOT NULL, prometheus_url TEXT, metric_query TEXT, metric_threshold REAL, threshold_operator TEXT CHECK(threshold_operator IN ('>', '<', '=')), current_status TEXT CHECK(current_status IN ('UP', 'DOWN', 'WARNING', 'UNKNOWN')) DEFAULT 'UNKNOWN', last_checked_at DATETIME, FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE);`);
db.run(`CREATE TABLE IF NOT EXISTS alert_channels (id TEXT PRIMARY KEY, team_id TEXT NOT NULL, name TEXT NOT NULL, type TEXT CHECK(type IN ('DISCORD', 'TELEGRAM', 'EMAIL')) NOT NULL, config TEXT NOT NULL, FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE);`);
db.run(`CREATE TABLE IF NOT EXISTS incidents_log (id TEXT PRIMARY KEY, team_id TEXT NOT NULL, target_id TEXT NOT NULL, event_type TEXT CHECK(event_type IN ('WENT_DOWN', 'CAME_UP', 'THRESHOLD_EXCEEDED')) NOT NULL, message TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE, FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE CASCADE);`);

export default db;
