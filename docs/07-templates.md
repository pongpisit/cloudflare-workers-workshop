# Module 7: Using Cloudflare Templates

This module introduces you to Cloudflare's official templates, which provide pre-built starting points for common use cases.

## 📋 Table of Contents

1. [What are Templates?](#what-are-templates)
2. [How to Use Templates](#how-to-use-templates)
3. [Popular Templates](#popular-templates)
4. [Template Deep Dives](#template-deep-dives)
5. [Creating Your Own Templates](#creating-your-own-templates)
6. [Hands-on Exercise](#hands-on-exercise)

---

## What are Templates?

Templates are pre-configured GitHub repositories that serve as starting points for Cloudflare Workers projects. They include:

- Pre-configured `wrangler.jsonc` or `wrangler.toml`
- Sample code demonstrating best practices
- Required dependencies
- Documentation

### Benefits of Using Templates

| Benefit | Description |
|---------|-------------|
| **Quick Start** | Skip boilerplate setup |
| **Best Practices** | Learn from official examples |
| **Full Stack** | Many include frontend + backend |
| **Production Ready** | Tested configurations |

---

## How to Use Templates

### Method 1: Using C3 (Recommended)

```powershell
# General syntax
npm create cloudflare@latest -- --template=cloudflare/templates/<template-name>

# Example: Create a D1 project
npm create cloudflare@latest -- my-project --template=cloudflare/templates/d1-template
```

### Method 2: Using Dashboard

1. Go to **Workers & Pages** in the Dashboard

2. Click **Create**

3. Browse available templates

4. Click **Deploy** on your chosen template

5. Follow the setup wizard

### Method 3: Clone from GitHub

```powershell
# Clone the template repository
git clone https://github.com/cloudflare/templates.git

# Copy the template you want
Copy-Item -Recurse templates/d1-template my-project

# Navigate and install
cd my-project
npm install
```

---

## Popular Templates

### Full-Stack Templates

| Template | Description | Command |
|----------|-------------|---------|
| **react-router-hono-fullstack** | React + Hono + shadcn/ui | `npm create cloudflare@latest -- --template=cloudflare/templates/react-router-hono-fullstack-template` |
| **react-postgres-fullstack** | React + PostgreSQL | `npm create cloudflare@latest -- --template=cloudflare/templates/react-postgres-fullstack-template` |
| **next-starter** | Next.js on Workers | `npm create cloudflare@latest -- --template=cloudflare/templates/next-starter-template` |
| **remix-starter** | Remix on Workers | `npm create cloudflare@latest -- --template=cloudflare/templates/remix-starter-template` |

### Backend/API Templates

| Template | Description | Command |
|----------|-------------|---------|
| **chanfana-openapi** | Hono + OpenAPI + D1 + Vitest | `npm create cloudflare@latest -- --template=cloudflare/templates/chanfana-openapi-template` |
| **d1-template** | D1 database starter | `npm create cloudflare@latest -- --template=cloudflare/templates/d1-template` |
| **d1-starter-sessions-api** | D1 with Sessions API | `npm create cloudflare@latest -- --template=cloudflare/templates/d1-starter-sessions-api-template` |

### Storage Templates

| Template | Description | Command |
|----------|-------------|---------|
| **r2-explorer** | Google Drive-like R2 interface | `npm create cloudflare@latest -- --template=cloudflare/templates/r2-explorer-template` |
| **to-do-list-kv** | KV-based todo app | `npm create cloudflare@latest -- --template=cloudflare/templates/to-do-list-kv-template` |

### Real-Time & AI Templates

| Template | Description | Command |
|----------|-------------|---------|
| **durable-chat** | Real-time chat with Durable Objects | `npm create cloudflare@latest -- --template=cloudflare/templates/durable-chat-template` |
| **llm-chat-app** | AI chat with Workers AI | `npm create cloudflare@latest -- --template=cloudflare/templates/llm-chat-app-template` |
| **text-to-image** | Image generation with AI | `npm create cloudflare@latest -- --template=cloudflare/templates/text-to-image-template` |

### Frontend Templates

| Template | Description | Command |
|----------|-------------|---------|
| **astro-blog-starter** | Astro blog/portfolio | `npm create cloudflare@latest -- --template=cloudflare/templates/astro-blog-starter-template` |
| **vite-react** | Vite + React | `npm create cloudflare@latest -- --template=cloudflare/templates/vite-react-template` |
| **react-router-starter** | React Router 7 | `npm create cloudflare@latest -- --template=cloudflare/templates/react-router-starter-template` |

---

## Template Deep Dives

### 1. Chanfana OpenAPI Template

A complete backend API template with automatic OpenAPI documentation.

```powershell
npm create cloudflare@latest -- my-api --template=cloudflare/templates/chanfana-openapi-template
cd my-api
```

**Features:**
- Hono web framework
- Chanfana for OpenAPI spec generation
- D1 database integration
- Vitest for testing
- Automatic Swagger UI at `/docs`

**Project Structure:**
```
my-api/
├── src/
│   ├── index.ts          # Main entry point
│   ├── endpoints/        # API endpoint handlers
│   └── types.ts          # TypeScript types
├── test/                 # Test files
├── wrangler.jsonc        # Wrangler config
└── package.json
```

**Example Endpoint:**
```typescript
import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';

export class TaskCreate extends OpenAPIRoute {
  schema = {
    tags: ['Tasks'],
    summary: 'Create a new Task',
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              name: z.string(),
              slug: z.string(),
              description: z.string().optional(),
              completed: z.boolean().default(false),
            }),
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Task created successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              task: TaskSchema,
            }),
          },
        },
      },
    },
  };

  async handle(c) {
    const data = await this.getValidatedData<typeof this.schema>();
    // Create task in D1...
    return { success: true, task: newTask };
  }
}
```

### 2. React Router Hono Fullstack Template

A modern full-stack template with React frontend and Hono backend.

```powershell
npm create cloudflare@latest -- my-app --template=cloudflare/templates/react-router-hono-fullstack-template
cd my-app
```

**Features:**
- React Router 7 for frontend
- Hono for backend API
- shadcn/ui components
- Tailwind CSS
- TypeScript throughout

**Project Structure:**
```
my-app/
├── app/                  # React frontend
│   ├── components/       # UI components
│   ├── routes/          # Page routes
│   └── root.tsx         # App root
├── server/              # Hono backend
│   ├── api/             # API routes
│   └── index.ts         # Server entry
├── public/              # Static assets
└── wrangler.jsonc
```

### 3. D1 Template

A simple starter for D1 database projects.

```powershell
npm create cloudflare@latest -- my-db-app --template=cloudflare/templates/d1-template
cd my-db-app
```

**Features:**
- Pre-configured D1 binding
- Sample CRUD operations
- Migration setup

**Quick Start:**
```powershell
# Create the database
npx wrangler d1 create my-database

# Update wrangler.jsonc with database_id

# Run migrations
npx wrangler d1 execute my-database --local --file=./schema.sql

# Start development
npx wrangler dev
```

### 4. R2 Explorer Template

A Google Drive-like interface for managing R2 buckets.

```powershell
npm create cloudflare@latest -- my-explorer --template=cloudflare/templates/r2-explorer-template
cd my-explorer
```

**Features:**
- File browser UI
- Upload/download files
- Create folders
- Search functionality
- Authentication support

### 5. LLM Chat App Template

Build an AI-powered chat application.

```powershell
npm create cloudflare@latest -- my-chat --template=cloudflare/templates/llm-chat-app-template
cd my-chat
```

**Features:**
- Workers AI integration
- Chat interface
- Streaming responses
- Conversation history

---

## Creating Your Own Templates

### Template Requirements

A valid template must include:

1. **`package.json`** - Project dependencies
2. **`wrangler.jsonc`** or **`wrangler.toml`** - Wrangler configuration
3. **`src/`** - Source code directory with entry point

### Template Structure

```
my-template/
├── package.json
├── wrangler.jsonc
├── src/
│   └── index.ts
├── README.md
└── .gitignore
```

### Sharing Your Template

1. Push to GitHub

2. Others can use it:
```powershell
npm create cloudflare@latest -- --template=yourusername/your-template-repo
```

### Template with Subdirectory

If your template is in a subdirectory:
```powershell
npm create cloudflare@latest -- --template=yourusername/repo/path/to/template
```

---

## Hands-on Exercise

### Exercise 1: Deploy the Chanfana OpenAPI Template

1. **Create the project:**
```powershell
npm create cloudflare@latest -- api-demo --template=cloudflare/templates/chanfana-openapi-template
cd api-demo
```

2. **Create D1 database:**
```powershell
npx wrangler d1 create api-demo-db
```

3. **Update `wrangler.jsonc`** with your database_id

4. **Start development:**
```powershell
npx wrangler dev
```

5. **Explore the API:**
   - Open http://localhost:8787/docs for Swagger UI
   - Try the example endpoints

6. **Deploy:**
```powershell
npx wrangler deploy
```

### Exercise 2: Build a Full-Stack App

1. **Create the project:**
```powershell
npm create cloudflare@latest -- fullstack-demo --template=cloudflare/templates/react-router-hono-fullstack-template
cd fullstack-demo
```

2. **Explore the structure:**
```powershell
# View frontend routes
ls app/routes

# View backend API
ls server/api
```

3. **Start development:**
```powershell
npm run dev
```

4. **Add a new API endpoint:**

Create `server/api/hello.ts`:
```typescript
import { Hono } from 'hono';

const app = new Hono();

app.get('/hello', (c) => {
  return c.json({ message: 'Hello from the API!' });
});

export default app;
```

5. **Add a new frontend route:**

Create `app/routes/hello.tsx`:
```tsx
import { useEffect, useState } from 'react';

export default function Hello() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{message}</h1>
    </div>
  );
}
```

6. **Test and deploy:**
```powershell
npm run dev
# Visit http://localhost:5173/hello

npx wrangler deploy
```

### Exercise 3: Explore the R2 Explorer

1. **Create the project:**
```powershell
npm create cloudflare@latest -- file-explorer --template=cloudflare/templates/r2-explorer-template
cd file-explorer
```

2. **Create R2 bucket:**
```powershell
npx wrangler r2 bucket create my-files
```

3. **Update configuration** with your bucket name

4. **Start and explore:**
```powershell
npx wrangler dev
```

5. **Upload some files** through the UI

6. **Deploy:**
```powershell
npx wrangler deploy
```

---

## Template Reference

### Browse All Templates

Visit the official templates repository:
- **GitHub**: https://github.com/cloudflare/templates
- **Documentation**: https://developers.cloudflare.com/workers/get-started/quickstarts/

### List Available Templates

```powershell
# View all templates in the repo
npm create cloudflare@latest -- --help
```

---

## 📝 Checkpoint

Before proceeding, ensure you have:

- [ ] Understood what templates are and their benefits
- [ ] Successfully deployed at least one template
- [ ] Explored the project structure of a template
- [ ] Made modifications to a template
- [ ] Understood how to create your own templates

---

## Next Steps

Excellent! You've learned how to leverage templates. Let's wrap up with best practices.

**Continue to** → [Module 8: Best Practices & Next Steps](./08-best-practices.md)
