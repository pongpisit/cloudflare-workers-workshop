# Module 3: Understanding Workers & Wrangler

This module covers the fundamentals of Cloudflare Workers architecture and the Wrangler CLI configuration.

## 📋 Table of Contents

1. [Workers Runtime](#workers-runtime)
2. [Wrangler Configuration](#wrangler-configuration)
3. [Environment Variables & Secrets](#environment-variables--secrets)
4. [Bindings Overview](#bindings-overview)
5. [Wrangler Commands Reference](#wrangler-commands-reference)
6. [Hands-on Exercise](#hands-on-exercise)

---

## Workers Runtime

### How Workers Execute

Cloudflare Workers run on the **V8 JavaScript engine** (the same engine that powers Chrome and Node.js), but with some key differences:

```
┌────────────────────────────────────────────────────────────┐
│                    Cloudflare Edge                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   V8 Isolate                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │  Worker A   │  │  Worker B   │  │  Worker C   │   │  │
│  │  │  (Isolate)  │  │  (Isolate)  │  │  (Isolate)  │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Key Characteristics

| Feature | Description |
|---------|-------------|
| **Isolates** | Each Worker runs in its own V8 isolate for security |
| **Cold Start** | ~0ms (isolates are pre-warmed) |
| **CPU Time** | 10ms (free) / 30s (paid) per request |
| **Memory** | 128 MB per Worker |
| **Global Network** | 300+ data centers worldwide |

### Supported APIs

Workers support Web Standard APIs:

```javascript
// Fetch API
const response = await fetch('https://api.example.com/data');

// URL API
const url = new URL(request.url);

// Headers API
const headers = new Headers();
headers.set('Content-Type', 'application/json');

// Crypto API
const hash = await crypto.subtle.digest('SHA-256', data);

// TextEncoder/TextDecoder
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Streams API
const stream = new ReadableStream({...});

// Cache API
const cache = caches.default;
```

### What's NOT Available

Some Node.js APIs are not available in Workers:

- ❌ `fs` (file system)
- ❌ `process` (use `env` instead)
- ❌ `__dirname`, `__filename`
- ❌ Native Node.js modules

> **💡 Tip**: Use the `nodejs_compat` compatibility flag to enable some Node.js APIs.

---

## Wrangler Configuration

Wrangler uses a configuration file to define your Worker's settings.

### Configuration File Formats

Wrangler supports two formats:

1. **`wrangler.jsonc`** (JSON with comments) - Recommended
2. **`wrangler.toml`** (TOML format) - Legacy but still supported

### Basic wrangler.jsonc Structure

```jsonc
{
  // Schema for IDE autocompletion
  "$schema": "./node_modules/wrangler/config-schema.json",
  
  // Worker name (used in the URL)
  "name": "my-worker",
  
  // Entry point for your Worker
  "main": "src/index.js",
  
  // Compatibility date (determines which APIs are available)
  "compatibility_date": "2024-01-01",
  
  // Optional: Compatibility flags
  "compatibility_flags": ["nodejs_compat"]
}
```

### Basic wrangler.toml Structure

```toml
# Worker name
name = "my-worker"

# Entry point
main = "src/index.js"

# Compatibility date
compatibility_date = "2024-01-01"

# Compatibility flags
compatibility_flags = ["nodejs_compat"]
```

### Common Configuration Options

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "my-worker",
  "main": "src/index.js",
  "compatibility_date": "2024-01-01",
  
  // Account ID (optional, can be set via CLI)
  "account_id": "your-account-id",
  
  // Custom routes
  "routes": [
    { "pattern": "example.com/*", "zone_name": "example.com" }
  ],
  
  // Or use workers.dev subdomain
  "workers_dev": true,
  
  // Cron triggers for scheduled Workers
  "triggers": {
    "crons": ["0 * * * *"]  // Every hour
  },
  
  // Build configuration
  "build": {
    "command": "npm run build"
  },
  
  // Minification
  "minify": true,
  
  // Source maps for debugging
  "upload_source_maps": true
}
```

---

## Environment Variables & Secrets

### Plain Text Variables

Define variables in your configuration:

**wrangler.jsonc:**
```jsonc
{
  "vars": {
    "API_URL": "https://api.example.com",
    "DEBUG_MODE": "true"
  }
}
```

**wrangler.toml:**
```toml
[vars]
API_URL = "https://api.example.com"
DEBUG_MODE = "true"
```

Access in your Worker:

```javascript
export default {
  async fetch(request, env, ctx) {
    console.log(env.API_URL);      // "https://api.example.com"
    console.log(env.DEBUG_MODE);   // "true"
    
    return new Response('OK');
  },
};
```

### Secrets (Sensitive Data)

For sensitive data like API keys, use secrets:

```powershell
# Add a secret
npx wrangler secret put API_KEY
# You'll be prompted to enter the value

# List secrets
npx wrangler secret list

# Delete a secret
npx wrangler secret delete API_KEY
```

Access secrets the same way as variables:

```javascript
export default {
  async fetch(request, env, ctx) {
    // Secrets are accessed via env, just like variables
    const apiKey = env.API_KEY;
    
    const response = await fetch('https://api.example.com/data', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    return response;
  },
};
```

### Environment-Specific Configuration

Define different settings for development and production:

**wrangler.jsonc:**
```jsonc
{
  "name": "my-worker",
  "main": "src/index.js",
  "compatibility_date": "2024-01-01",
  
  // Default (production) variables
  "vars": {
    "ENVIRONMENT": "production",
    "API_URL": "https://api.example.com"
  },
  
  // Development environment
  "env": {
    "dev": {
      "vars": {
        "ENVIRONMENT": "development",
        "API_URL": "https://dev-api.example.com"
      }
    },
    "staging": {
      "vars": {
        "ENVIRONMENT": "staging",
        "API_URL": "https://staging-api.example.com"
      }
    }
  }
}
```

Deploy to specific environments:

```powershell
# Deploy to production (default)
npx wrangler deploy

# Deploy to development
npx wrangler deploy --env dev

# Deploy to staging
npx wrangler deploy --env staging
```

---

## Bindings Overview

Bindings connect your Worker to Cloudflare resources.

### Types of Bindings

| Binding | Purpose | Configuration Key |
|---------|---------|-------------------|
| **KV** | Key-Value storage | `kv_namespaces` |
| **D1** | SQL database | `d1_databases` |
| **R2** | Object storage | `r2_buckets` |
| **Durable Objects** | Stateful objects | `durable_objects` |
| **Service Bindings** | Worker-to-Worker | `services` |
| **Queue** | Message queues | `queues` |
| **Analytics Engine** | Analytics data | `analytics_engine_datasets` |

### Example Configuration with Bindings

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "my-worker",
  "main": "src/index.js",
  "compatibility_date": "2024-01-01",
  
  // KV Namespace binding
  "kv_namespaces": [
    {
      "binding": "MY_KV",
      "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    }
  ],
  
  // D1 Database binding
  "d1_databases": [
    {
      "binding": "MY_DB",
      "database_name": "my-database",
      "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    }
  ],
  
  // R2 Bucket binding
  "r2_buckets": [
    {
      "binding": "MY_BUCKET",
      "bucket_name": "my-bucket"
    }
  ]
}
```

Access bindings in your Worker:

```javascript
export default {
  async fetch(request, env, ctx) {
    // KV operations
    await env.MY_KV.put('key', 'value');
    const value = await env.MY_KV.get('key');
    
    // D1 operations
    const result = await env.MY_DB.prepare('SELECT * FROM users').all();
    
    // R2 operations
    await env.MY_BUCKET.put('file.txt', 'content');
    const object = await env.MY_BUCKET.get('file.txt');
    
    return new Response('OK');
  },
};
```

---

## Wrangler Commands Reference

### Project Management

```powershell
# Create a new project
npm create cloudflare@latest -- my-project

# Initialize wrangler in existing project
npx wrangler init

# Generate TypeScript types for bindings
npx wrangler types
```

### Development

```powershell
# Start local development server
npx wrangler dev

# Start with remote resources (real KV, D1, R2)
npx wrangler dev --remote

# Start on a specific port
npx wrangler dev --port 3000

# Start with local persistence
npx wrangler dev --persist-to ./data
```

### Deployment

```powershell
# Deploy to production
npx wrangler deploy

# Deploy to specific environment
npx wrangler deploy --env staging

# Deploy with dry run (see what would be deployed)
npx wrangler deploy --dry-run

# Deploy and keep terminal open for logs
npx wrangler deploy && npx wrangler tail
```

### Monitoring & Debugging

```powershell
# View real-time logs
npx wrangler tail

# View logs with filters
npx wrangler tail --format pretty
npx wrangler tail --status error
npx wrangler tail --search "error"

# View deployment history
npx wrangler deployments list

# Rollback to previous deployment
npx wrangler rollback
```

### Resource Management

```powershell
# KV Namespaces
npx wrangler kv namespace create MY_KV
npx wrangler kv namespace list
npx wrangler kv key put --binding MY_KV "key" "value"
npx wrangler kv key get --binding MY_KV "key"

# D1 Databases
npx wrangler d1 create my-database
npx wrangler d1 list
npx wrangler d1 execute my-database --command "SELECT * FROM users"
npx wrangler d1 execute my-database --file ./schema.sql

# R2 Buckets
npx wrangler r2 bucket create my-bucket
npx wrangler r2 bucket list
npx wrangler r2 object put my-bucket/file.txt --file ./local-file.txt
npx wrangler r2 object get my-bucket/file.txt

# Secrets
npx wrangler secret put API_KEY
npx wrangler secret list
npx wrangler secret delete API_KEY
```

### Authentication

```powershell
# Login to Cloudflare
npx wrangler login

# Check current authentication
npx wrangler whoami

# Logout
npx wrangler logout
```

---

## Hands-on Exercise

### Exercise 1: Configure Multiple Environments

1. Create a new Worker project:

```powershell
npm create cloudflare@latest -- env-demo
cd env-demo
```

2. Update `wrangler.jsonc`:

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "env-demo",
  "main": "src/index.js",
  "compatibility_date": "2024-01-01",
  
  "vars": {
    "ENVIRONMENT": "production",
    "API_VERSION": "v2"
  },
  
  "env": {
    "dev": {
      "name": "env-demo-dev",
      "vars": {
        "ENVIRONMENT": "development",
        "API_VERSION": "v1"
      }
    }
  }
}
```

3. Update `src/index.js`:

```javascript
export default {
  async fetch(request, env, ctx) {
    const data = {
      environment: env.ENVIRONMENT,
      apiVersion: env.API_VERSION,
      timestamp: new Date().toISOString(),
    };
    
    return new Response(JSON.stringify(data, null, 2), {
      headers: { 'content-type': 'application/json' },
    });
  },
};
```

4. Test locally:

```powershell
# Test production config
npx wrangler dev

# Test development config
npx wrangler dev --env dev
```

### Exercise 2: Add a Secret and Use It

1. Add a secret:

```powershell
npx wrangler secret put MY_SECRET
# Enter: super-secret-value
```

2. Update your Worker to use the secret:

```javascript
export default {
  async fetch(request, env, ctx) {
    // Never log secrets in production!
    const hasSecret = env.MY_SECRET ? 'Yes' : 'No';
    
    return new Response(`Secret configured: ${hasSecret}`);
  },
};
```

3. Deploy and test:

```powershell
npx wrangler deploy
```

---

## 📝 Checkpoint

Before proceeding, ensure you understand:

- [ ] How Workers execute on the edge
- [ ] The structure of wrangler.jsonc/wrangler.toml
- [ ] How to use environment variables and secrets
- [ ] The different types of bindings available
- [ ] Common Wrangler CLI commands

---

## Next Steps

Now that you understand the fundamentals, let's integrate with a database!

**Continue to** → [Module 4: Integrating with D1 Database](./04-d1-database.md)
