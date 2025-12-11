# Module 2: Hello World

In this module, you will learn the basics of Cloudflare Workers step by step.

**Time needed: 25 minutes**

---

## What You Will Learn

- Create a Worker project
- Understand the basic code structure
- Return text responses
- Return JSON responses
- Handle different URL paths
- Test locally and deploy

---

## Step 1: Create a New Project

**Open PowerShell:**

1. Press **Windows key + R**
2. Type `powershell` and press **Enter**

**Run these commands:**

```powershell
cd $HOME\Documents\cloudflare-projects
```

```powershell
npm create cloudflare@latest -- my-first-worker
```

**Answer the questions:**
- Start with → Hello World example
- Template → Worker only
- Language → JavaScript
- Git → no
- Deploy → no

**Go into the project:**
```powershell
cd my-first-worker
```

**Open in VS Code:**
```powershell
code .
```

---

## Step 2: Understand the Basic Code

**In VS Code, open the file `src/index.js`**

You can find it in the left sidebar under your project folder.

You will see this code:

```javascript
export default {
  async fetch(request, env, ctx) {
    return new Response('Hello World!');
  },
};
```

**What does this code do?**

| Part | Meaning |
|------|---------|
| `export default` | Creates your Worker |
| `async fetch(request, env, ctx)` | Runs when someone visits your Worker |
| `request` | Information about the visitor (URL, method, etc.) |
| `return new Response('Hello World!')` | Sends text back to the visitor |

---

## Step 3: Test Your Worker Locally

**In CMD or PowerShell, run:**
```cmd
npx wrangler dev
```

**You will see:**
```
Ready on http://localhost:8787
```

**Open your browser and go to:**
```
http://localhost:8787
```

**You should see:** Hello World!

---

## Step 4: Change the Response Text

**File to edit: `src/index.js`**

Change the code to:

```javascript
export default {
  async fetch(request, env, ctx) {
    return new Response('Hello! This is my first Cloudflare Worker!');
  },
};
```

**Save the file (Ctrl + S)**

**Refresh your browser (F5)**

You should see your new message!

---

## Step 5: Return JSON Data

Workers can return JSON data like a real API.

**File to edit: `src/index.js`**

**Delete everything in the file and paste this code:**

```javascript
export default {
  async fetch(request, env, ctx) {
    const data = {
      message: "Hello from my Worker!",
      timestamp: new Date().toISOString(),
      status: "ok"
    };

    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        "content-type": "application/json"
      }
    });
  },
};
```

**Save and refresh your browser.**

You should see JSON data:
```json
{
  "message": "Hello from my Worker!",
  "timestamp": "2024-12-04T12:00:00.000Z",
  "status": "ok"
}
```

---

## Step 6: Handle Different URL Paths

Let's make your Worker respond differently based on the URL.

**File to edit: `src/index.js`**

**Delete everything in the file and paste this code:**

```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Home page
    if (path === "/" || path === "") {
      return new Response("Welcome to my Worker!");
    }

    // About page
    if (path === "/about") {
      return new Response("This is the about page.");
    }

    // API endpoint
    if (path === "/api") {
      const data = { status: "ok", message: "API is working" };
      return new Response(JSON.stringify(data), {
        headers: { "content-type": "application/json" }
      });
    }

    // Page not found
    return new Response("Page not found", { status: 404 });
  },
};
```

**Save and test these URLs:**

| Local URL | Workers URL | Result |
|-----------|---------------|--------|
| http://localhost:8787/ | `https://<worker-name>.<subdomain>.workers.dev/` | Welcome to my Worker! |
| http://localhost:8787/about | `https://<worker-name>.<subdomain>.workers.dev/about` | This is the about page. |
| http://localhost:8787/api | `https://<worker-name>.<subdomain>.workers.dev/api` | JSON data |
| http://localhost:8787/xyz | `https://<worker-name>.<subdomain>.workers.dev/xyz` | Page not found |

---

## Step 7: Return HTML Page

Workers can return full HTML pages.

**File to edit: `src/index.js`**

**Delete everything in the file and paste this code:**

```javascript
export default {
  async fetch(request, env, ctx) {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>My First Worker</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      text-align: center;
    }
    h1 { color: #f38020; }
    p { color: #666; line-height: 1.6; }
  </style>
</head>
<body>
  <h1>Hello from Cloudflare Workers!</h1>
  <p>This page is served from the edge, close to you.</p>
  <p>Current time: ${new Date().toLocaleString()}</p>
</body>
</html>`;

    return new Response(html, {
      headers: { "content-type": "text/html" }
    });
  },
};
```

**Save and refresh your browser.**

You should see a styled HTML page!

---

## Step 8: Deploy Your Worker

**Stop the local server** (press Ctrl + C in PowerShell)

**Deploy to the internet:**
```cmd
npx wrangler deploy
```

**You will see:**
```
Published my-first-worker
  https://my-first-worker.YOUR-SUBDOMAIN.workers.dev
```

**Copy the URL and open it in your browser.**

Your Worker is now live on the internet!

---

## Real World Example: Personal Profile Page

Now let's use what you learned to build a real application - a personal profile page like Linktree.

**File to edit: `src/index.js`**

**Delete everything in the file and paste this code:**

```javascript
export default {
  async fetch(request, env, ctx) {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>My Profile</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 40px;
      font-weight: bold;
    }
    h1 { color: #333; margin-bottom: 5px; }
    .title { color: #666; margin-bottom: 15px; }
    .bio { color: #555; line-height: 1.6; margin-bottom: 25px; font-size: 14px; }
    .links { display: flex; flex-direction: column; gap: 10px; }
    .link {
      display: block;
      padding: 12px 20px;
      background: #f5f5f5;
      border-radius: 8px;
      color: #333;
      text-decoration: none;
      transition: all 0.2s;
    }
    .link:hover {
      background: #667eea;
      color: white;
    }
    .footer { margin-top: 25px; color: #999; font-size: 11px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="avatar">JD</div>
    <h1>John Doe</h1>
    <p class="title">Web Developer</p>
    <p class="bio">Building things with Cloudflare Workers. Based in Bangkok, Thailand.</p>
    <div class="links">
      <a href="https://github.com" class="link">GitHub</a>
      <a href="https://linkedin.com" class="link">LinkedIn</a>
      <a href="https://twitter.com" class="link">Twitter</a>
      <a href="mailto:hello@example.com" class="link">Email Me</a>
    </div>
    <p class="footer">Powered by Cloudflare Workers</p>
  </div>
</body>
</html>`;

    return new Response(html, {
      headers: { "content-type": "text/html" }
    });
  },
};
```

**Save and test:**
```cmd
npx wrangler dev
```

**Open:** http://localhost:8787

You now have a personal profile page! Customize it by changing:
- The initials in `.avatar` (JD)
- The name (John Doe)
- The title (Web Developer)
- The bio text
- The links

**Deploy when ready:**
```cmd
npx wrangler deploy
```

---

## What You Learned

| Skill | Done |
|-------|------|
| Create a Worker project | |
| Return text responses | |
| Return JSON responses | |
| Handle different URL paths | |
| Return HTML pages | |
| Deploy to the internet | |
| Build a real profile page | |

---

## Key Concepts

| Concept | Description |
|---------|-------------|
| `new Response(body)` | Send a response to the visitor |
| `request.url` | Get the URL the visitor requested |
| `headers` | Set response type (text, JSON, HTML) |
| `status: 404` | Set HTTP status code |

---

## Quick Reference

| Command | What It Does |
|---------|--------------|
| `npm create cloudflare@latest -- name` | Create project |
| `npx wrangler dev` | Run locally |
| `npx wrangler deploy` | Deploy to internet |
| Ctrl + C | Stop server |

---

## Next Module

You now understand the basics of Cloudflare Workers!

**Next:** [Module 3: Add Image Storage with R2](./03-r2-images.md)
