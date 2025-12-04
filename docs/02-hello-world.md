# Module 2: Your First Worker - Hello World

In this module, you'll create and deploy your first Cloudflare Worker using both the Dashboard GUI and the Wrangler CLI.

## 📋 Table of Contents

1. [Understanding Workers](#understanding-workers)
2. [Method 1: Create Worker via Dashboard](#method-1-create-worker-via-dashboard)
3. [Method 2: Create Worker via Wrangler CLI](#method-2-create-worker-via-wrangler-cli)
4. [Understanding the Code](#understanding-the-code)
5. [Local Development](#local-development)
6. [Deploy Your Worker](#deploy-your-worker)
7. [Hands-on Exercise](#hands-on-exercise)

---

## Understanding Workers

### What is a Cloudflare Worker?

A Cloudflare Worker is a serverless function that runs on Cloudflare's global edge network. Key characteristics:

- **Serverless**: No servers to manage
- **Global**: Runs in 300+ data centers worldwide
- **Fast**: Cold starts in milliseconds
- **Scalable**: Automatically scales to handle traffic
- **Cost-effective**: Pay only for what you use (free tier: 100K requests/day)

### How Workers Work

```
┌─────────────┐     ┌─────────────────────┐     ┌─────────────┐
│   Client    │────▶│  Cloudflare Edge    │────▶│   Origin    │
│  (Browser)  │     │  (Worker executes)  │     │  (Optional) │
└─────────────┘     └─────────────────────┘     └─────────────┘
```

Workers intercept HTTP requests at the edge, allowing you to:
- Modify requests/responses
- Return custom responses
- Route traffic
- Implement authentication
- And much more!

---

## Method 1: Create Worker via Dashboard

Let's create a Worker using the Cloudflare Dashboard GUI.

### Step 1: Navigate to Workers & Pages

1. Log in to the Cloudflare Dashboard: **https://dash.cloudflare.com/**

2. In the left sidebar, click **Workers & Pages**

3. Click the **Create** button (or **Create application**)

### Step 2: Create a New Worker

1. Under "Create an application", select **Create Worker**

2. Give your Worker a name: `hello-world-dashboard`
   > **Note**: The name must be lowercase and can contain hyphens

3. Click **Deploy**

### Step 3: View Your Worker

1. After deployment, you'll see a success message

2. Click on the Worker name to view details

3. Your Worker is now live at: `https://hello-world-dashboard.<your-subdomain>.workers.dev`

### Step 4: Edit the Worker Code

1. Click the **Edit code** button (or go to the "Code" tab)

2. You'll see the default code:

```javascript
export default {
  async fetch(request, env, ctx) {
    return new Response('Hello World!');
  },
};
```

3. Modify the code to personalize the response:

```javascript
export default {
  async fetch(request, env, ctx) {
    return new Response('Hello from Cloudflare Workers Dashboard! 🎉', {
      headers: {
        'content-type': 'text/plain',
      },
    });
  },
};
```

4. Click **Save and deploy**

5. Visit your Worker URL to see the changes

---

## Method 2: Create Worker via Wrangler CLI

Now let's create a Worker using the command line, which is the recommended approach for real projects.

### Step 1: Create a New Project

Open **PowerShell** and navigate to your projects folder:

```powershell
# Navigate to your projects folder (create it if needed)
cd C:\Users\YourName\cloudflare-projects

# Create a new Worker project using C3 (create-cloudflare-cli)
npm create cloudflare@latest -- my-first-worker
```

### Step 2: Answer the Setup Questions

When prompted, select the following options:

```
What would you like to start with?
> Hello World example

Which template would you like to use?
> Worker only

Which language do you want to use?
> JavaScript (or TypeScript if you prefer)

Do you want to use git for version control?
> Yes

Do you want to deploy your application?
> No (we'll deploy manually later)
```

### Step 3: Navigate to Your Project

```powershell
cd my-first-worker
```

### Step 4: Explore the Project Structure

Your project now contains:

```
my-first-worker/
├── node_modules/          # Dependencies
├── src/
│   └── index.js          # Your Worker code
├── package.json          # Project configuration
├── package-lock.json     # Dependency lock file
├── wrangler.jsonc        # Wrangler configuration
└── .gitignore           # Git ignore rules
```

### Step 5: View the Default Code

Open `src/index.js` in VS Code:

```powershell
code .
```

You'll see:

```javascript
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * having access to environment variables and bindings in your worker.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		return new Response('Hello World!');
	},
};
```

---

## Understanding the Code

Let's break down the Worker code:

### The Export Default Pattern

```javascript
export default {
  // Worker handlers go here
};
```

This is the ES Module syntax. Your Worker must have a default export with handler functions.

### The Fetch Handler

```javascript
async fetch(request, env, ctx) {
  return new Response('Hello World!');
}
```

| Parameter | Description |
|-----------|-------------|
| `request` | The incoming HTTP [Request](https://developers.cloudflare.com/workers/runtime-apis/request/) object |
| `env` | Environment bindings (KV, D1, R2, secrets, etc.) |
| `ctx` | Execution context (waitUntil, passThroughOnException) |

### The Response Object

```javascript
return new Response('Hello World!');
```

Workers must return a [Response](https://developers.cloudflare.com/workers/runtime-apis/response/) object. You can customize:

```javascript
return new Response('Hello World!', {
  status: 200,
  statusText: 'OK',
  headers: {
    'content-type': 'text/plain',
    'x-custom-header': 'my-value',
  },
});
```

---

## Local Development

Wrangler provides a local development server for testing your Worker.

### Start the Development Server

```powershell
npm run dev
```

Or directly with Wrangler:

```powershell
npx wrangler dev
```

### Expected Output

```
⛅️ wrangler 3.99.0
-------------------
wrangler dev now uses local mode by default, powered by 🔥 Miniflare and 👷 workerd.
To run an ideally configured remote development session on the edge, pass the --remote flag
Your worker has access to the following bindings:
Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

### Test Your Worker

1. Open your browser and go to: **http://localhost:8787**

2. You should see: "Hello World!"

### Hot Reloading

The development server supports hot reloading:

1. Keep the dev server running

2. Modify `src/index.js`:

```javascript
export default {
  async fetch(request, env, ctx) {
    return new Response('Hello from my first Cloudflare Worker! 🚀');
  },
};
```

3. Save the file

4. Refresh your browser - you'll see the updated response immediately!

---

## Deploy Your Worker

### Deploy Using Wrangler

```powershell
npm run deploy
```

Or directly:

```powershell
npx wrangler deploy
```

### Expected Output

```
⛅️ wrangler 3.99.0
-------------------
Total Upload: 0.19 KiB / gzip: 0.16 KiB
Uploaded my-first-worker (1.23 sec)
Published my-first-worker (0.45 sec)
  https://my-first-worker.<your-subdomain>.workers.dev
Current Deployment ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Verify Deployment

1. Copy the URL from the output

2. Open it in your browser

3. You should see your Worker's response!

### View in Dashboard

1. Go to the Cloudflare Dashboard

2. Navigate to **Workers & Pages**

3. You'll see your deployed Worker listed

---

## Hands-on Exercise

### Exercise 1: Create a JSON API

Modify your Worker to return JSON data:

```javascript
export default {
  async fetch(request, env, ctx) {
    const data = {
      message: 'Hello from Cloudflare Workers!',
      timestamp: new Date().toISOString(),
      location: 'Edge Network',
    };

    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        'content-type': 'application/json',
      },
    });
  },
};
```

### Exercise 2: Handle Different Routes

Create a Worker that responds differently based on the URL path:

```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    switch (path) {
      case '/':
        return new Response('Welcome to my Worker!');
      
      case '/hello':
        return new Response('Hello, World!');
      
      case '/time':
        return new Response(`Current time: ${new Date().toISOString()}`);
      
      case '/json':
        return new Response(JSON.stringify({ status: 'ok' }), {
          headers: { 'content-type': 'application/json' },
        });
      
      default:
        return new Response('Not Found', { status: 404 });
    }
  },
};
```

### Exercise 3: Read Request Information

Create a Worker that displays information about the incoming request:

```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    const info = {
      method: request.method,
      url: request.url,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      headers: Object.fromEntries(request.headers),
      cf: request.cf, // Cloudflare-specific request properties
    };

    return new Response(JSON.stringify(info, null, 2), {
      headers: { 'content-type': 'application/json' },
    });
  },
};
```

Test it with: `http://localhost:8787/test?name=John&age=30`

---

## 📝 Checkpoint

Before proceeding, ensure you have:

- [ ] Created a Worker using the Dashboard
- [ ] Created a Worker using Wrangler CLI
- [ ] Understood the basic Worker code structure
- [ ] Run the local development server
- [ ] Deployed a Worker to production
- [ ] Completed at least one hands-on exercise

---

## Key Commands Summary

| Command | Description |
|---------|-------------|
| `npm create cloudflare@latest` | Create a new project |
| `npx wrangler dev` | Start local development server |
| `npx wrangler deploy` | Deploy to production |
| `npx wrangler whoami` | Check authentication |
| `npx wrangler tail` | View real-time logs |

---

## Next Steps

You've created your first Worker! 

**Continue to** → [Module 3: Understanding Workers & Wrangler](./03-workers-basics.md)
