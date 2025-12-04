# Module 2: Create Your First Worker (Hello World)

In this module, you will create your first Cloudflare Worker using the command line.

**Time needed: 30 minutes**

---

## What is a Cloudflare Worker?

A Worker is a small program that runs on Cloudflare's servers around the world. When someone visits your Worker's URL, the program runs and sends back a response.

**Think of it like this:** When someone visits `https://my-worker.yourname.workers.dev`, Cloudflare runs your code and shows the result.

---

## Part A: Create Your First Worker

### Step 1: Open PowerShell

1. Press **Windows key + R** on your keyboard
2. Type `powershell` and press **Enter**

### Step 2: Go to Your Projects Folder

**Copy and paste this command, then press Enter:**
```powershell
cd $HOME\Documents\cloudflare-projects
```

> **Note:** If you see an error, create the folder first by running:
> ```powershell
> mkdir $HOME\Documents\cloudflare-projects
> cd $HOME\Documents\cloudflare-projects
> ```

### Step 3: Create a New Worker Project

**Copy and paste this command, then press Enter:**
```powershell
npm create cloudflare@latest -- my-first-worker
```

### Step 4: Answer the Questions

The tool will ask you some questions. **Type your answers exactly as shown:**

**Question 1:** `What would you like to start with?`
- Use arrow keys to select **"Hello World" Starter**
- Press **Enter**

**Question 2:** `Which template would you like to use?`
- Select **"Worker Only"**
- Press **Enter**

**Question 3:** `Which language do you want to use?`
- Select **JavaScript**
- Press **Enter**

**Question 4:** `Do you want to use git for version control?`
- Type `no` and press **Enter**

**Question 5:** `Do you want to deploy your application?`
- Type `no` and press **Enter** (we'll deploy later)

**Wait for it to finish.** You'll see "SUCCESS" when it's done.

### Step 5: Go Into Your Project Folder

**Copy and paste this command, then press Enter:**
```powershell
cd my-first-worker
```

### Step 6: Open the Project in VS Code

**Copy and paste this command, then press Enter:**
```powershell
code .
```

VS Code will open with your project.

### Step 7: Look at Your Worker Code

In VS Code:
1. Look at the left side panel
2. Click on the **"src"** folder to expand it
3. Click on **"index.js"**

You'll see this code:

```javascript
export default {
  async fetch(request, env, ctx) {
    return new Response('Hello World!');
  },
};
```

**This is your Worker code!** Let's understand it:

- `export default { ... }` - This creates your Worker
- `async fetch(request, env, ctx)` - This runs when someone visits your Worker
- `return new Response('Hello World!')` - This sends "Hello World!" back to the visitor

### Step 8: Test Your Worker Locally

**Go back to PowerShell.** (If you closed it, open it again and run `cd $HOME\Documents\cloudflare-projects\my-first-worker`)

**Copy and paste this command, then press Enter:**
```powershell
npm run dev
```

**You'll see something like:**
```
Ready on http://localhost:8787
```

### Step 9: View Your Worker in Browser

**Copy this link and paste it in your browser:**
```
http://localhost:8787
```

You should see: **"Hello World!"**

> ✅ Your Worker is running on your computer!

### Step 10: Change Your Worker Code

**In VS Code**, change the code in `src/index.js` to:

```javascript
export default {
  async fetch(request, env, ctx) {
    return new Response('Hello! I made this Worker myself!');
  },
};
```

**Save the file** (press Ctrl + S)

**Go back to your browser** and refresh the page (press F5)

You should see your new message!

### Step 11: Stop the Local Server

**Go back to PowerShell** and press **Ctrl + C** to stop the server.

### Step 12: Deploy Your Worker to the Internet

Now let's put your Worker on the internet so anyone can see it.

**Copy and paste this command, then press Enter:**
```powershell
npm run deploy
```
**Choose your lab account (if any)**
**You'll see something like:**
```
Published my-first-worker (1.23 sec)
  https://my-first-worker.yourname.workers.dev
```

### Step 13: Visit Your Live Worker

**Copy the URL** from the output (it looks like `https://my-first-worker.yourname.workers.dev`)

**Paste it in your browser.**

🎉 **Your Worker is now live on the internet!** Anyone with this URL can see it.

---

## Part B: Make Your Worker More Interesting

Let's make your Worker return JSON data (like a real API).

### Step 1: Update Your Code

**In VS Code**, replace ALL the code in `src/index.js` with this:

```javascript
export default {
  async fetch(request, env, ctx) {
    // Create some data
    const data = {
      message: "Hello from my Cloudflare Worker!",
      time: new Date().toISOString(),
      author: "Your Name Here"
    };

    // Send the data as JSON
    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        "content-type": "application/json"
      }
    });
  },
};
```

### Step 2: Test Locally

**In PowerShell, run:**
```powershell
npm run dev
```

**Open in browser:**
```
http://localhost:8787
```

You should see JSON data like:
```json
{
  "message": "Hello from my Cloudflare Worker!",
  "time": "2024-12-04T10:30:00.000Z",
  "author": "Your Name Here"
}
```

### Step 3: Deploy the Update

**Stop the local server** (press Ctrl + C in PowerShell)

**Deploy your changes:**
```powershell
npm run deploy
```

Visit your Worker URL to see the JSON response live!

---

## Part C: Add Multiple Pages to Your Worker

Let's make your Worker respond differently based on the URL.

### Step 1: Update Your Code

**In VS Code**, replace ALL the code in `src/index.js` with this:

```javascript
export default {
  async fetch(request, env, ctx) {
    // Get the URL path
    const url = new URL(request.url);
    const path = url.pathname;

    // Home page
    if (path === "/" || path === "") {
      return new Response("Welcome to my Worker! Try visiting /hello or /time");
    }

    // Hello page
    if (path === "/hello") {
      return new Response("Hello, World! 👋");
    }

    // Time page
    if (path === "/time") {
      const now = new Date().toLocaleString();
      return new Response("Current time: " + now);
    }

    // API page (returns JSON)
    if (path === "/api") {
      const data = {
        status: "ok",
        message: "This is my API",
        timestamp: new Date().toISOString()
      };
      return new Response(JSON.stringify(data, null, 2), {
        headers: { "content-type": "application/json" }
      });
    }

    // Page not found
    return new Response("Page not found", { status: 404 });
  },
};
```

### Step 2: Test All Pages

**Run the local server:**
```powershell
npm run dev
```

**Try these URLs in your browser:**

| URL | What You'll See |
|-----|-----------------|
| `http://localhost:8787/` | Welcome message |
| `http://localhost:8787/hello` | Hello, World! 👋 |
| `http://localhost:8787/time` | Current time |
| `http://localhost:8787/api` | JSON data |
| `http://localhost:8787/anything` | Page not found |

### Step 3: Deploy

**Stop the server** (Ctrl + C) and **deploy:**
```powershell
npm run deploy
```

---

## ✅ What You Learned

| Skill | ✓ |
|-------|---|
| Create a Worker project | ☐ |
| Run a Worker locally | ☐ |
| Deploy a Worker to the internet | ☐ |
| Return plain text | ☐ |
| Return JSON | ☐ |
| Handle different URL paths | ☐ |

---

## Quick Reference

| What You Want to Do | Command |
|---------------------|---------|
| Create a new project | `npm create cloudflare@latest -- project-name` |
| Go into project folder | `cd project-name` |
| Run locally | `npm run dev` |
| Stop local server | Press `Ctrl + C` |
| Deploy to internet | `npm run deploy` |
| Open project in VS Code | `code .` |

---

## Next Module

**Great job!** You've created and deployed your first Cloudflare Worker!

**Next:** [Module 3: Image Gallery with R2 →](./03-r2-images.md)
