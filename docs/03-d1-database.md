# Module 3: Connect to a Database (D1)

In this module, you will create a database and connect it to your Worker.

**Time needed: 30 minutes**

---

## What is D1?

D1 is Cloudflare's database. You can store and retrieve data from your Worker.

---

## Step 1: Create a New Project

**Open PowerShell and run these commands one by one:**

```powershell
cd $HOME\Documents\cloudflare-projects
```

```powershell
npm create cloudflare@latest -- my-todo-app
```

**Answer the questions:**
- What would you like to start with? → **Hello World example**
- Which template? → **Hello World Worker**
- Which language? → **JavaScript**
- Use git? → **yes**
- Deploy? → **no**

**Go into the project:**
```powershell
cd my-todo-app
```

---

## Step 2: Create a Database

**Run this command to create a database:**
```powershell
npx wrangler d1 create my-todo-db
```

**You'll see output like this:**
```
✅ Successfully created DB 'my-todo-db'

[[d1_databases]]
binding = "DB"
database_name = "my-todo-db"
database_id = "xxxx-xxxx-xxxx-xxxx"
```

**⚠️ IMPORTANT:** Copy the `database_id` value. You'll need it in the next step.

---

## Step 3: Connect Database to Your Worker

**Open the project in VS Code:**
```powershell
code .
```

**In VS Code, find and open the file called `wrangler.jsonc`**

It looks something like this:
```json
{
  "name": "my-todo-app",
  "main": "src/index.js",
  "compatibility_date": "2024-01-01"
}
```

**Replace the ENTIRE file with this (change YOUR-DATABASE-ID to your actual ID):**

```json
{
  "name": "my-todo-app",
  "main": "src/index.js",
  "compatibility_date": "2024-01-01",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-todo-db",
      "database_id": "YOUR-DATABASE-ID"
    }
  ]
}
```

**Save the file (Ctrl + S)**

---

## Step 4: Create the Database Table

**In VS Code, create a new file:**
1. Right-click in the file explorer (left panel)
2. Click "New File"
3. Name it: `schema.sql`

**Copy and paste this code into `schema.sql`:**

```sql
DROP TABLE IF EXISTS todos;

CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0
);

INSERT INTO todos (title, completed) VALUES
  ('Learn Cloudflare Workers', 1),
  ('Build a todo app', 0),
  ('Deploy to production', 0);
```

**Save the file (Ctrl + S)**

**Go back to PowerShell and run this command:**
```powershell
npx wrangler d1 execute my-todo-db --local --file=schema.sql
```

You should see: `🌀 Executed X commands`

---

## Step 5: Write the Worker Code

**In VS Code, open `src/index.js`**

**Delete everything and paste this code:**

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Home page - show instructions
    if (path === "/") {
      return new Response(`
Todo API - Available endpoints:
- GET  /todos     → List all todos
- POST /todos     → Add a todo (send JSON: {"title": "your task"})
- PUT  /todos/1   → Mark todo #1 as complete
- DELETE /todos/1 → Delete todo #1
      `, { headers: { "content-type": "text/plain" } });
    }

    // GET /todos - List all todos
    if (path === "/todos" && request.method === "GET") {
      const result = await env.DB.prepare("SELECT * FROM todos ORDER BY id DESC").all();
      return new Response(JSON.stringify(result.results, null, 2), {
        headers: { "content-type": "application/json" }
      });
    }

    // POST /todos - Add a new todo
    if (path === "/todos" && request.method === "POST") {
      const body = await request.json();
      const result = await env.DB.prepare(
        "INSERT INTO todos (title) VALUES (?)"
      ).bind(body.title).run();
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Todo added!",
        id: result.meta.last_row_id 
      }), {
        headers: { "content-type": "application/json" }
      });
    }

    // PUT /todos/:id - Mark as complete
    if (path.startsWith("/todos/") && request.method === "PUT") {
      const id = path.split("/")[2];
      await env.DB.prepare(
        "UPDATE todos SET completed = 1 WHERE id = ?"
      ).bind(id).run();
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Todo marked as complete!" 
      }), {
        headers: { "content-type": "application/json" }
      });
    }

    // DELETE /todos/:id - Delete a todo
    if (path.startsWith("/todos/") && request.method === "DELETE") {
      const id = path.split("/")[2];
      await env.DB.prepare(
        "DELETE FROM todos WHERE id = ?"
      ).bind(id).run();
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Todo deleted!" 
      }), {
        headers: { "content-type": "application/json" }
      });
    }

    return new Response("Not found", { status: 404 });
  }
};
```

**Save the file (Ctrl + S)**

---

## Step 6: Test Your App Locally

**In PowerShell, run:**
```powershell
npm run dev
```

**Open your browser and go to:**
```
http://localhost:8787
```

You'll see the instructions.

**Now try:**
```
http://localhost:8787/todos
```

You'll see your todos as JSON!

---

## Step 7: Test Adding a Todo

**Open a new PowerShell window** (keep the server running)

**Run this command to add a new todo:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8787/todos" -Method POST -Body '{"title":"My new task"}' -ContentType "application/json"
```

**Refresh your browser at `http://localhost:8787/todos` to see the new todo!**

---

## Step 8: Deploy to Production

**Stop the local server** (press Ctrl + C in the first PowerShell window)

**First, create the table on the production database:**
```powershell
npx wrangler d1 execute my-todo-db --remote --file=schema.sql
```

**Then deploy your Worker:**
```powershell
npm run deploy
```

**Copy the URL from the output and open it in your browser!**

---

## ✅ What You Learned

| Skill | ✓ |
|-------|---|
| Create a D1 database | ☐ |
| Connect database to Worker | ☐ |
| Read data from database | ☐ |
| Write data to database | ☐ |
| Update and delete data | ☐ |
| Deploy database app | ☐ |

---

## Quick Reference

| What You Want to Do | Command |
|---------------------|---------|
| Create a database | `npx wrangler d1 create database-name` |
| Run SQL locally | `npx wrangler d1 execute db-name --local --file=schema.sql` |
| Run SQL on production | `npx wrangler d1 execute db-name --remote --file=schema.sql` |
| See your databases | `npx wrangler d1 list` |

---

## Next Module

**Awesome!** You've built a database-powered app!

**Next:** [Module 4: File Storage with R2 →](./04-r2-storage.md)
