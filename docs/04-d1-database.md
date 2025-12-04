# Module 4: Integrating with D1 Database

This module teaches you how to use Cloudflare D1, a serverless SQL database, with your Workers.

## 📋 Table of Contents

1. [What is D1?](#what-is-d1)
2. [Create a D1 Database](#create-a-d1-database)
3. [Bind D1 to Your Worker](#bind-d1-to-your-worker)
4. [Database Operations](#database-operations)
5. [Migrations & Schema Management](#migrations--schema-management)
6. [Hands-on Exercise: Build a Todo API](#hands-on-exercise-build-a-todo-api)

---

## What is D1?

D1 is Cloudflare's native serverless SQL database built on SQLite.

### Key Features

| Feature | Description |
|---------|-------------|
| **SQLite Compatible** | Uses familiar SQL syntax |
| **Serverless** | No server management required |
| **Global** | Automatically replicated for low latency |
| **Integrated** | Native binding to Workers |
| **Free Tier** | 5 GB storage, 5M rows read/day |

### When to Use D1

✅ **Good for:**
- Relational data with complex queries
- User data, content management
- Configuration storage
- Small to medium datasets

❌ **Consider alternatives for:**
- High-frequency writes (use Durable Objects)
- Simple key-value data (use KV)
- Large files (use R2)

---

## Create a D1 Database

### Method 1: Using Wrangler CLI

```powershell
# Create a new D1 database
npx wrangler d1 create my-database
```

**Expected Output:**
```
✅ Successfully created DB 'my-database' in region WEUR
Created your new D1 database.

{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-database",
      "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    }
  ]
}
```

> **📝 Note**: Copy the output - you'll need the `database_id` for configuration.

### Method 2: Using Cloudflare Dashboard

1. Log in to the Cloudflare Dashboard: **https://dash.cloudflare.com/**

2. Navigate to **Workers & Pages** → **D1 SQL Database**

3. Click **Create database**

4. Enter a name: `my-database`

5. (Optional) Select a location hint for data residency

6. Click **Create**

### List Your Databases

```powershell
npx wrangler d1 list
```

---

## Bind D1 to Your Worker

### Step 1: Create a Worker Project

```powershell
npm create cloudflare@latest -- d1-demo
cd d1-demo
```

Select:
- Hello World example
- Worker only
- TypeScript (recommended for D1)

### Step 2: Add D1 Binding to Configuration

**wrangler.jsonc:**
```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "d1-demo",
  "main": "src/index.ts",
  "compatibility_date": "2024-01-01",
  
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-database",
      "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    }
  ]
}
```

**wrangler.toml:**
```toml
name = "d1-demo"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### Step 3: Generate TypeScript Types

```powershell
npx wrangler types
```

This creates a `worker-configuration.d.ts` file with type definitions for your bindings.

---

## Database Operations

### Creating Tables

Create a schema file `schema.sql`:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
```

Execute the schema:

```powershell
# Execute on local development database
npx wrangler d1 execute my-database --local --file=./schema.sql

# Execute on remote production database
npx wrangler d1 execute my-database --remote --file=./schema.sql
```

### Basic CRUD Operations

**src/index.ts:**

```typescript
export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // CREATE - Insert a new user
      if (path === '/users' && request.method === 'POST') {
        const body = await request.json() as { email: string; name: string };
        
        const result = await env.DB.prepare(
          'INSERT INTO users (email, name) VALUES (?, ?)'
        )
          .bind(body.email, body.name)
          .run();

        return Response.json({
          success: true,
          id: result.meta.last_row_id,
        });
      }

      // READ - Get all users
      if (path === '/users' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM users ORDER BY created_at DESC'
        ).all();

        return Response.json(results);
      }

      // READ - Get single user
      if (path.startsWith('/users/') && request.method === 'GET') {
        const id = path.split('/')[2];
        
        const user = await env.DB.prepare(
          'SELECT * FROM users WHERE id = ?'
        )
          .bind(id)
          .first();

        if (!user) {
          return Response.json({ error: 'User not found' }, { status: 404 });
        }

        return Response.json(user);
      }

      // UPDATE - Update a user
      if (path.startsWith('/users/') && request.method === 'PUT') {
        const id = path.split('/')[2];
        const body = await request.json() as { name: string };
        
        await env.DB.prepare(
          'UPDATE users SET name = ? WHERE id = ?'
        )
          .bind(body.name, id)
          .run();

        return Response.json({ success: true });
      }

      // DELETE - Delete a user
      if (path.startsWith('/users/') && request.method === 'DELETE') {
        const id = path.split('/')[2];
        
        await env.DB.prepare(
          'DELETE FROM users WHERE id = ?'
        )
          .bind(id)
          .run();

        return Response.json({ success: true });
      }

      return Response.json({ error: 'Not found' }, { status: 404 });
      
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  },
};
```

### Query Methods

D1 provides several methods for executing queries:

```typescript
// .all() - Returns all rows
const { results, success, meta } = await env.DB
  .prepare('SELECT * FROM users')
  .all();

// .first() - Returns first row or null
const user = await env.DB
  .prepare('SELECT * FROM users WHERE id = ?')
  .bind(1)
  .first();

// .first(column) - Returns single column value
const count = await env.DB
  .prepare('SELECT COUNT(*) as count FROM users')
  .first('count');

// .run() - For INSERT, UPDATE, DELETE (no results)
const result = await env.DB
  .prepare('INSERT INTO users (name) VALUES (?)')
  .bind('John')
  .run();
// result.meta.last_row_id - ID of inserted row
// result.meta.changes - Number of rows affected

// .raw() - Returns raw array format
const rows = await env.DB
  .prepare('SELECT id, name FROM users')
  .raw();
// Returns: [[1, 'John'], [2, 'Jane']]
```

### Batch Operations

Execute multiple statements in a single round-trip:

```typescript
const results = await env.DB.batch([
  env.DB.prepare('INSERT INTO users (name, email) VALUES (?, ?)').bind('John', 'john@example.com'),
  env.DB.prepare('INSERT INTO users (name, email) VALUES (?, ?)').bind('Jane', 'jane@example.com'),
  env.DB.prepare('SELECT * FROM users'),
]);

// results[0] - First INSERT result
// results[1] - Second INSERT result
// results[2] - SELECT result with all users
```

### Parameterized Queries (Prevent SQL Injection)

**Always use parameterized queries:**

```typescript
// ✅ CORRECT - Safe from SQL injection
const user = await env.DB
  .prepare('SELECT * FROM users WHERE email = ?')
  .bind(userEmail)
  .first();

// ❌ WRONG - Vulnerable to SQL injection
const user = await env.DB
  .prepare(`SELECT * FROM users WHERE email = '${userEmail}'`)
  .first();
```

---

## Migrations & Schema Management

### Creating Migration Files

Organize your schema changes in migration files:

```
migrations/
├── 0001_initial_schema.sql
├── 0002_add_posts_table.sql
└── 0003_add_user_avatar.sql
```

**migrations/0001_initial_schema.sql:**
```sql
-- Migration: Initial Schema
-- Created: 2024-01-01

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**migrations/0002_add_posts_table.sql:**
```sql
-- Migration: Add Posts Table
-- Created: 2024-01-02

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Running Migrations

```powershell
# Run all migrations locally
npx wrangler d1 migrations apply my-database --local

# Run all migrations on remote database
npx wrangler d1 migrations apply my-database --remote

# Execute a specific migration file
npx wrangler d1 execute my-database --remote --file=./migrations/0001_initial_schema.sql
```

### Viewing Database State

```powershell
# List tables
npx wrangler d1 execute my-database --remote --command "SELECT name FROM sqlite_master WHERE type='table';"

# Describe a table
npx wrangler d1 execute my-database --remote --command "PRAGMA table_info(users);"

# Count rows
npx wrangler d1 execute my-database --remote --command "SELECT COUNT(*) FROM users;"
```

---

## Hands-on Exercise: Build a Todo API

Let's build a complete Todo API with D1.

### Step 1: Create the Project

```powershell
npm create cloudflare@latest -- todo-api
cd todo-api
```

### Step 2: Create the Database

```powershell
npx wrangler d1 create todo-db
```

Copy the database_id from the output.

### Step 3: Update Configuration

**wrangler.jsonc:**
```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "todo-api",
  "main": "src/index.ts",
  "compatibility_date": "2024-01-01",
  
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "todo-db",
      "database_id": "YOUR-DATABASE-ID-HERE"
    }
  ]
}
```

### Step 4: Create the Schema

**schema.sql:**
```sql
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
  ('Build a Todo API', 0),
  ('Deploy to production', 0);
```

Execute the schema:

```powershell
npx wrangler d1 execute todo-db --local --file=./schema.sql
```

### Step 5: Implement the API

**src/index.ts:**
```typescript
export interface Env {
  DB: D1Database;
}

interface Todo {
  id: number;
  title: string;
  completed: number;
  created_at: string;
  updated_at: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // GET /todos - List all todos
      if (path === '/todos' && method === 'GET') {
        const { results } = await env.DB
          .prepare('SELECT * FROM todos ORDER BY created_at DESC')
          .all<Todo>();

        return Response.json(results, { headers: corsHeaders });
      }

      // POST /todos - Create a new todo
      if (path === '/todos' && method === 'POST') {
        const body = await request.json() as { title: string };
        
        if (!body.title || body.title.trim() === '') {
          return Response.json(
            { error: 'Title is required' },
            { status: 400, headers: corsHeaders }
          );
        }

        const result = await env.DB
          .prepare('INSERT INTO todos (title) VALUES (?)')
          .bind(body.title.trim())
          .run();

        const newTodo = await env.DB
          .prepare('SELECT * FROM todos WHERE id = ?')
          .bind(result.meta.last_row_id)
          .first<Todo>();

        return Response.json(newTodo, { 
          status: 201, 
          headers: corsHeaders 
        });
      }

      // GET /todos/:id - Get a single todo
      if (path.match(/^\/todos\/\d+$/) && method === 'GET') {
        const id = path.split('/')[2];
        
        const todo = await env.DB
          .prepare('SELECT * FROM todos WHERE id = ?')
          .bind(id)
          .first<Todo>();

        if (!todo) {
          return Response.json(
            { error: 'Todo not found' },
            { status: 404, headers: corsHeaders }
          );
        }

        return Response.json(todo, { headers: corsHeaders });
      }

      // PUT /todos/:id - Update a todo
      if (path.match(/^\/todos\/\d+$/) && method === 'PUT') {
        const id = path.split('/')[2];
        const body = await request.json() as { title?: string; completed?: boolean };

        // Check if todo exists
        const existing = await env.DB
          .prepare('SELECT * FROM todos WHERE id = ?')
          .bind(id)
          .first<Todo>();

        if (!existing) {
          return Response.json(
            { error: 'Todo not found' },
            { status: 404, headers: corsHeaders }
          );
        }

        // Build update query dynamically
        const updates: string[] = [];
        const values: (string | number)[] = [];

        if (body.title !== undefined) {
          updates.push('title = ?');
          values.push(body.title);
        }
        if (body.completed !== undefined) {
          updates.push('completed = ?');
          values.push(body.completed ? 1 : 0);
        }

        if (updates.length > 0) {
          updates.push('updated_at = CURRENT_TIMESTAMP');
          values.push(id);

          await env.DB
            .prepare(`UPDATE todos SET ${updates.join(', ')} WHERE id = ?`)
            .bind(...values)
            .run();
        }

        const updated = await env.DB
          .prepare('SELECT * FROM todos WHERE id = ?')
          .bind(id)
          .first<Todo>();

        return Response.json(updated, { headers: corsHeaders });
      }

      // DELETE /todos/:id - Delete a todo
      if (path.match(/^\/todos\/\d+$/) && method === 'DELETE') {
        const id = path.split('/')[2];

        const existing = await env.DB
          .prepare('SELECT * FROM todos WHERE id = ?')
          .bind(id)
          .first<Todo>();

        if (!existing) {
          return Response.json(
            { error: 'Todo not found' },
            { status: 404, headers: corsHeaders }
          );
        }

        await env.DB
          .prepare('DELETE FROM todos WHERE id = ?')
          .bind(id)
          .run();

        return Response.json(
          { success: true, message: 'Todo deleted' },
          { headers: corsHeaders }
        );
      }

      // Root path - API info
      if (path === '/' || path === '') {
        return Response.json({
          name: 'Todo API',
          version: '1.0.0',
          endpoints: {
            'GET /todos': 'List all todos',
            'POST /todos': 'Create a new todo',
            'GET /todos/:id': 'Get a single todo',
            'PUT /todos/:id': 'Update a todo',
            'DELETE /todos/:id': 'Delete a todo',
          },
        }, { headers: corsHeaders });
      }

      return Response.json(
        { error: 'Not found' },
        { status: 404, headers: corsHeaders }
      );

    } catch (error) {
      console.error('Error:', error);
      return Response.json(
        { error: error instanceof Error ? error.message : 'Internal server error' },
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
```

### Step 6: Test Locally

```powershell
npx wrangler dev
```

Test the API:

```powershell
# List todos
curl http://localhost:8787/todos

# Create a todo
curl -X POST http://localhost:8787/todos -H "Content-Type: application/json" -d "{\"title\": \"New task\"}"

# Update a todo
curl -X PUT http://localhost:8787/todos/1 -H "Content-Type: application/json" -d "{\"completed\": true}"

# Delete a todo
curl -X DELETE http://localhost:8787/todos/1
```

### Step 7: Deploy to Production

```powershell
# First, apply schema to remote database
npx wrangler d1 execute todo-db --remote --file=./schema.sql

# Then deploy the Worker
npx wrangler deploy
```

---

## 📝 Checkpoint

Before proceeding, ensure you have:

- [ ] Created a D1 database
- [ ] Bound D1 to a Worker
- [ ] Executed SQL queries from a Worker
- [ ] Used parameterized queries
- [ ] Completed the Todo API exercise

---

## Next Steps

Great job! Now let's learn about object storage with R2.

**Continue to** → [Module 5: Integrating with R2 Storage](./05-r2-storage.md)
