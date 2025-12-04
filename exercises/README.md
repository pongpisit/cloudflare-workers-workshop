# Workshop Exercises

This folder contains hands-on exercise solutions for the Cloudflare Workers Workshop.

## 📁 Exercise Structure

```
exercises/
├── hello-world/          # Module 2: Hello World exercises
├── d1-example/           # Module 4: D1 Database Todo API
└── r2-example/           # Module 5: R2 File Upload API
```

## 🚀 Getting Started

Each exercise folder is a standalone project. To run an exercise:

### 1. Navigate to the exercise folder

```powershell
cd exercises/hello-world
# or
cd exercises/d1-example
# or
cd exercises/r2-example
```

### 2. Install dependencies

```powershell
npm install
```

### 3. Generate TypeScript types (for TypeScript projects)

```powershell
npx wrangler types
```

### 4. Start the development server

```powershell
npm run dev
```

## 📝 Exercise Details

### Hello World (`hello-world/`)

Basic Worker exercises from Module 2:
- Exercise 1: JSON API Response
- Exercise 2: Route Handler
- Exercise 3: Request Information

**Run:**
```powershell
cd hello-world
npm install
npm run dev
```

**Test endpoints:**
- http://localhost:8787/exercise1 - JSON API
- http://localhost:8787/exercise2/hello - Route handler
- http://localhost:8787/exercise3 - Request info

---

### D1 Todo API (`d1-example/`)

Complete CRUD API using D1 database from Module 4.

**Setup:**
```powershell
cd d1-example
npm install

# Create the database
npx wrangler d1 create todo-db

# Update wrangler.jsonc with your database_id

# Run migrations
npm run db:migrate:local

# Start development
npm run dev
```

**Test endpoints:**
- GET http://localhost:8787/todos - List todos
- POST http://localhost:8787/todos - Create todo
- GET http://localhost:8787/todos/1 - Get todo
- PUT http://localhost:8787/todos/1 - Update todo
- DELETE http://localhost:8787/todos/1 - Delete todo

---

### R2 File Upload API (`r2-example/`)

File upload/download API using R2 storage from Module 5.

**Setup:**
```powershell
cd r2-example
npm install

# Create the bucket
npx wrangler r2 bucket create file-uploads

# Start development
npm run dev
```

**Test:**
1. Open `test-upload.html` in your browser
2. Or use curl:

```powershell
# Upload a file
curl -X POST http://localhost:8787/upload -F "file=@yourfile.jpg"

# List files
curl http://localhost:8787/files

# Download a file
curl http://localhost:8787/files/uploads/yourfile.jpg -o downloaded.jpg

# Delete a file
curl -X DELETE http://localhost:8787/files/uploads/yourfile.jpg
```

## ⚠️ TypeScript Note

If you see TypeScript errors like "Cannot find name 'D1Database'" or "Cannot find name 'R2Bucket'", this is expected before running `npm install`. 

These types come from the `@cloudflare/workers-types` package which is installed as a dev dependency. After running `npm install`, the errors will be resolved.

## 🔧 Troubleshooting

### "Database not found" error
Make sure you've:
1. Created the database with `npx wrangler d1 create <name>`
2. Updated `wrangler.jsonc` with the correct `database_id`
3. Run migrations with `npm run db:migrate:local`

### "Bucket not found" error
Make sure you've:
1. Created the bucket with `npx wrangler r2 bucket create <name>`
2. Updated `wrangler.jsonc` with the correct `bucket_name`

### Port already in use
If port 8787 is already in use, specify a different port:
```powershell
npx wrangler dev --port 3000
```

## 📚 Related Documentation

- [Module 2: Hello World](../docs/02-hello-world.md)
- [Module 4: D1 Database](../docs/04-d1-database.md)
- [Module 5: R2 Storage](../docs/05-r2-storage.md)
