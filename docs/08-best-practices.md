# Module 8: Best Practices & Next Steps

This final module covers best practices for Cloudflare Workers development and provides guidance for continued learning.

## 📋 Table of Contents

1. [Code Organization](#code-organization)
2. [Performance Optimization](#performance-optimization)
3. [Security Best Practices](#security-best-practices)
4. [Error Handling](#error-handling)
5. [Testing Strategies](#testing-strategies)
6. [Monitoring & Debugging](#monitoring--debugging)
7. [Cost Optimization](#cost-optimization)
8. [Next Steps & Resources](#next-steps--resources)

---

## Code Organization

### Project Structure

Organize your Workers project for maintainability:

```
my-worker/
├── src/
│   ├── index.ts              # Entry point
│   ├── routes/               # Route handlers
│   │   ├── api.ts
│   │   └── health.ts
│   ├── services/             # Business logic
│   │   ├── userService.ts
│   │   └── dataService.ts
│   ├── middleware/           # Middleware functions
│   │   ├── auth.ts
│   │   └── cors.ts
│   ├── utils/                # Utility functions
│   │   ├── helpers.ts
│   │   └── validators.ts
│   └── types/                # TypeScript types
│       └── index.ts
├── migrations/               # D1 migrations
├── test/                     # Test files
├── wrangler.jsonc
├── package.json
└── tsconfig.json
```

### Use TypeScript

TypeScript provides better developer experience and catches errors early:

```typescript
// Define your environment types
export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  KV: KVNamespace;
  API_KEY: string;
}

// Type your handlers
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // TypeScript ensures type safety
    const result = await env.DB.prepare('SELECT * FROM users').all();
    return Response.json(result);
  },
};
```

### Modular Code

Split your code into reusable modules:

```typescript
// src/routes/users.ts
import { Env } from '../types';

export async function handleUsers(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  
  switch (request.method) {
    case 'GET':
      return getUsers(env);
    case 'POST':
      return createUser(request, env);
    default:
      return new Response('Method not allowed', { status: 405 });
  }
}

async function getUsers(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare('SELECT * FROM users').all();
  return Response.json(results);
}

async function createUser(request: Request, env: Env): Promise<Response> {
  const body = await request.json();
  // ... create user logic
}
```

```typescript
// src/index.ts
import { handleUsers } from './routes/users';
import { handleHealth } from './routes/health';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/api/users')) {
      return handleUsers(request, env);
    }
    
    if (url.pathname === '/health') {
      return handleHealth(env);
    }
    
    return new Response('Not found', { status: 404 });
  },
};
```

---

## Performance Optimization

### Minimize Cold Starts

Workers have near-zero cold starts, but you can optimize further:

```typescript
// ❌ Avoid: Heavy initialization in global scope
const heavyData = computeExpensiveData(); // Runs on every isolate creation

// ✅ Better: Lazy initialization
let cachedData: Data | null = null;

async function getData(env: Env): Promise<Data> {
  if (!cachedData) {
    cachedData = await fetchData(env);
  }
  return cachedData;
}
```

### Use Caching Effectively

```typescript
// Cache API responses
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const cache = caches.default;
    const cacheKey = new Request(request.url, request);
    
    // Check cache first
    let response = await cache.match(cacheKey);
    if (response) {
      return response;
    }
    
    // Generate response
    response = await generateResponse(request, env);
    
    // Cache the response
    response = new Response(response.body, response);
    response.headers.set('Cache-Control', 'public, max-age=3600');
    
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    
    return response;
  },
};
```

### Optimize Database Queries

```typescript
// ❌ Avoid: N+1 queries
for (const user of users) {
  const posts = await env.DB.prepare('SELECT * FROM posts WHERE user_id = ?')
    .bind(user.id)
    .all();
}

// ✅ Better: Single query with JOIN
const { results } = await env.DB.prepare(`
  SELECT users.*, posts.title as post_title
  FROM users
  LEFT JOIN posts ON users.id = posts.user_id
`).all();

// ✅ Better: Batch queries
const results = await env.DB.batch([
  env.DB.prepare('SELECT * FROM users'),
  env.DB.prepare('SELECT * FROM posts'),
]);
```

### Use Streaming for Large Responses

```typescript
// Stream large files instead of loading into memory
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const object = await env.BUCKET.get('large-file.zip');
    
    if (!object) {
      return new Response('Not found', { status: 404 });
    }
    
    // Stream the response body directly
    return new Response(object.body, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Length': object.size.toString(),
      },
    });
  },
};
```

---

## Security Best Practices

### Input Validation

Always validate and sanitize user input:

```typescript
import { z } from 'zod';

// Define schema
const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().positive().optional(),
});

// Validate input
async function createUser(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json();
    const validatedData = UserSchema.parse(body);
    
    // Safe to use validatedData
    await env.DB.prepare('INSERT INTO users (email, name) VALUES (?, ?)')
      .bind(validatedData.email, validatedData.name)
      .run();
      
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ errors: error.errors }, { status: 400 });
    }
    throw error;
  }
}
```

### Use Parameterized Queries

```typescript
// ❌ NEVER: String concatenation (SQL injection vulnerable)
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ ALWAYS: Parameterized queries
const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
  .bind(email)
  .first();
```

### Protect Secrets

```typescript
// ❌ Never hardcode secrets
const apiKey = 'sk-1234567890';

// ✅ Use environment variables/secrets
const apiKey = env.API_KEY;

// ❌ Never log secrets
console.log('API Key:', env.API_KEY);

// ✅ Log safely
console.log('API Key configured:', !!env.API_KEY);
```

### Implement Authentication

```typescript
// Simple API key authentication
async function authenticate(request: Request, env: Env): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.slice(7);
  return token === env.API_KEY;
}

// Use in handler
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (!await authenticate(request, env)) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // Handle authenticated request
  },
};
```

### CORS Configuration

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com', // Be specific!
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// ❌ Avoid in production
'Access-Control-Allow-Origin': '*'

// ✅ Be specific
'Access-Control-Allow-Origin': 'https://app.example.com'
```

---

## Error Handling

### Comprehensive Error Handling

```typescript
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await handleRequest(request, env);
    } catch (error) {
      console.error('Error:', error);
      
      if (error instanceof AppError) {
        return Response.json(
          { error: error.message, code: error.code },
          { status: error.statusCode }
        );
      }
      
      // Don't expose internal errors to clients
      return Response.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  },
};

// Usage
async function getUser(id: string, env: Env) {
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
    .bind(id)
    .first();
    
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  
  return user;
}
```

### Graceful Degradation

```typescript
async function fetchWithFallback(env: Env): Promise<Response> {
  try {
    // Try primary data source
    const data = await env.DB.prepare('SELECT * FROM data').all();
    return Response.json(data.results);
  } catch (dbError) {
    console.error('Database error, trying cache:', dbError);
    
    try {
      // Fallback to cache
      const cached = await env.KV.get('data-cache', 'json');
      if (cached) {
        return Response.json(cached);
      }
    } catch (cacheError) {
      console.error('Cache error:', cacheError);
    }
    
    // Return error response
    return Response.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 }
    );
  }
}
```

---

## Testing Strategies

### Unit Testing with Vitest

```typescript
// src/utils/helpers.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, validateEmail } from './helpers';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('January 15, 2024');
  });
});

describe('validateEmail', () => {
  it('should return true for valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });
  
  it('should return false for invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
  });
});
```

### Integration Testing

```typescript
// test/integration.test.ts
import { unstable_dev } from 'wrangler';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Worker Integration Tests', () => {
  let worker: UnstableDevWorker;

  beforeAll(async () => {
    worker = await unstable_dev('src/index.ts', {
      experimental: { disableExperimentalWarning: true },
    });
  });

  afterAll(async () => {
    await worker.stop();
  });

  it('should return 200 for health check', async () => {
    const response = await worker.fetch('/health');
    expect(response.status).toBe(200);
  });

  it('should return users list', async () => {
    const response = await worker.fetch('/api/users');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });
});
```

### Run Tests

```powershell
# Add to package.json
# "scripts": { "test": "vitest" }

npm test
```

---

## Monitoring & Debugging

### Logging Best Practices

```typescript
// Structured logging
function log(level: 'info' | 'warn' | 'error', message: string, data?: object) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data,
  }));
}

// Usage
log('info', 'Request received', { path: url.pathname, method: request.method });
log('error', 'Database error', { error: error.message, query: 'SELECT...' });
```

### Real-Time Logs with Wrangler Tail

```powershell
# View real-time logs
npx wrangler tail

# Filter by status
npx wrangler tail --status error

# Filter by search term
npx wrangler tail --search "user"

# Pretty format
npx wrangler tail --format pretty
```

### Analytics and Metrics

```typescript
// Track custom metrics with Analytics Engine
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const startTime = Date.now();
    
    try {
      const response = await handleRequest(request, env);
      
      // Log metrics
      ctx.waitUntil(
        env.ANALYTICS.writeDataPoint({
          blobs: [request.url, request.method],
          doubles: [Date.now() - startTime, response.status],
          indexes: ['request'],
        })
      );
      
      return response;
    } catch (error) {
      // Log errors
      ctx.waitUntil(
        env.ANALYTICS.writeDataPoint({
          blobs: [request.url, error.message],
          doubles: [Date.now() - startTime, 500],
          indexes: ['error'],
        })
      );
      throw error;
    }
  },
};
```

---

## Cost Optimization

### Understand the Pricing

| Resource | Free Tier | Paid |
|----------|-----------|------|
| Workers Requests | 100K/day | $0.30/million |
| Workers CPU Time | 10ms | 30s ($0.02/million ms) |
| D1 Reads | 5M/day | $0.001/million |
| D1 Writes | 100K/day | $1.00/million |
| R2 Storage | 10 GB | $0.015/GB |
| R2 Class A | 1M/month | $4.50/million |
| R2 Class B | 10M/month | $0.36/million |
| KV Reads | 100K/day | $0.50/million |
| KV Writes | 1K/day | $5.00/million |

### Optimization Tips

1. **Cache aggressively** - Reduce database and API calls
2. **Use KV for read-heavy data** - Cheaper than D1 for simple lookups
3. **Batch operations** - Reduce request count
4. **Optimize queries** - Use indexes, limit results
5. **Use R2 for large files** - Zero egress fees

```typescript
// Example: Cache expensive queries
async function getPopularPosts(env: Env): Promise<Post[]> {
  // Check KV cache first (cheaper than D1)
  const cached = await env.KV.get('popular-posts', 'json');
  if (cached) return cached;
  
  // Query D1 if not cached
  const { results } = await env.DB.prepare(`
    SELECT * FROM posts 
    ORDER BY views DESC 
    LIMIT 10
  `).all();
  
  // Cache for 1 hour
  await env.KV.put('popular-posts', JSON.stringify(results), {
    expirationTtl: 3600,
  });
  
  return results;
}
```

---

## Next Steps & Resources

### Continue Learning

1. **Official Documentation**
   - [Workers Docs](https://developers.cloudflare.com/workers/)
   - [D1 Docs](https://developers.cloudflare.com/d1/)
   - [R2 Docs](https://developers.cloudflare.com/r2/)

2. **Advanced Topics**
   - [Durable Objects](https://developers.cloudflare.com/durable-objects/) - Stateful serverless
   - [Queues](https://developers.cloudflare.com/queues/) - Message queues
   - [Workers AI](https://developers.cloudflare.com/workers-ai/) - AI/ML at the edge
   - [Hyperdrive](https://developers.cloudflare.com/hyperdrive/) - Database connection pooling

3. **Community Resources**
   - [Cloudflare Discord](https://discord.gg/cloudflaredev)
   - [Cloudflare Community](https://community.cloudflare.com/)
   - [GitHub Examples](https://github.com/cloudflare/workers-sdk)

### Project Ideas

| Project | Technologies |
|---------|--------------|
| URL Shortener | Workers + D1 + KV |
| Image Gallery | Workers + R2 + D1 |
| Real-time Chat | Workers + Durable Objects |
| AI Chatbot | Workers + Workers AI |
| API Gateway | Workers + Rate Limiting |
| Blog Platform | Workers + D1 + R2 |

### Certification

Consider getting certified:
- [Cloudflare Certifications](https://www.cloudflare.com/learning/certification/)

---

## 📝 Workshop Summary

Congratulations! You've completed the Cloudflare Workers Workshop! 🎉

### What You've Learned

- ✅ Set up a Windows development environment
- ✅ Created Workers using Dashboard and CLI
- ✅ Understood Workers runtime and Wrangler configuration
- ✅ Integrated with D1 database
- ✅ Integrated with R2 storage
- ✅ Set up GitHub CI/CD
- ✅ Used official templates
- ✅ Applied best practices

### Key Commands Reference

```powershell
# Project creation
npm create cloudflare@latest -- my-project

# Development
npx wrangler dev
npx wrangler dev --remote

# Deployment
npx wrangler deploy
npx wrangler deploy --env staging

# Database
npx wrangler d1 create my-db
npx wrangler d1 execute my-db --remote --file=./schema.sql

# Storage
npx wrangler r2 bucket create my-bucket
npx wrangler r2 object put my-bucket/file.txt --file=./file.txt --remote

# Secrets
npx wrangler secret put API_KEY

# Monitoring
npx wrangler tail
npx wrangler tail --format pretty
```

---

## Thank You!

Thank you for completing this workshop. You now have the skills to build and deploy production-ready applications on Cloudflare's global edge network.

**Happy building! 🚀**
