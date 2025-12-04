-- D1 Todo API Schema
-- Run with: npx wrangler d1 execute todo-db --local --file=./schema.sql

CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO todos (title, completed) VALUES 
  ('Learn Cloudflare Workers', 1),
  ('Build a Todo API with D1', 0),
  ('Deploy to production', 0),
  ('Add authentication', 0),
  ('Write documentation', 0);
