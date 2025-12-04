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

**Open `src/index.js` in VS Code.**

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

**In PowerShell, run:**
```powershell
npm run dev
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

**In VS Code, change the code to:**

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

**Replace ALL the code with:**

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

**Replace ALL the code with:**

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

| URL | Result |
|-----|--------|
| http://localhost:8787/ | Welcome to my Worker! |
| http://localhost:8787/about | This is the about page. |
| http://localhost:8787/api | JSON data |
| http://localhost:8787/xyz | Page not found |

---

## Step 7: Return HTML Page

Workers can return full HTML pages.

**Replace ALL the code with:**

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
```powershell
npm run deploy
```

**You will see:**
```
Published my-first-worker
  https://my-first-worker.YOUR-SUBDOMAIN.workers.dev
```

**Copy the URL and open it in your browser.**

Your Worker is now live on the internet!

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
| `npm run dev` | Run locally |
| `npm run deploy` | Deploy to internet |
| Ctrl + C | Stop server |

---

## Next Module

You now understand the basics of Cloudflare Workers!

**Next:** [Module 3: Add Image Storage with R2](./03-r2-images.md)
