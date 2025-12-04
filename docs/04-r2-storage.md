# Module 4: File Storage with R2

In this module, you will create a file storage bucket and upload/download files.

**Time needed: 25 minutes**

---

## What is R2?

R2 is Cloudflare's file storage. You can upload images, documents, and any files.

---

## Step 1: Create a New Project

**Open PowerShell and run:**

```powershell
cd $HOME\Documents\cloudflare-projects
```

```powershell
npm create cloudflare@latest -- my-file-app
```

**Answer the questions:**
- What would you like to start with? → **Hello World example**
- Which template? → **Hello World Worker**
- Which language? → **JavaScript**
- Use git? → **yes**
- Deploy? → **no**

**Go into the project:**
```powershell
cd my-file-app
```

---

## Step 2: Create a Storage Bucket

**Run this command:**
```powershell
npx wrangler r2 bucket create my-files
```

You should see: `✅ Created bucket 'my-files'`

---

## Step 3: Connect Bucket to Your Worker

**Open the project in VS Code:**
```powershell
code .
```

**Open `wrangler.jsonc` and replace EVERYTHING with:**

```json
{
  "name": "my-file-app",
  "main": "src/index.js",
  "compatibility_date": "2024-01-01",
  "r2_buckets": [
    {
      "binding": "BUCKET",
      "bucket_name": "my-files"
    }
  ]
}
```

**Save the file (Ctrl + S)**

---

## Step 4: Write the Worker Code

**Open `src/index.js` and replace EVERYTHING with:**

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Home page
    if (path === "/") {
      return new Response(`
File Storage API:
- GET  /files          → List all files
- GET  /files/name.txt → Download a file
- PUT  /files/name.txt → Upload a file (send file in body)
- DELETE /files/name.txt → Delete a file
      `, { headers: { "content-type": "text/plain" } });
    }

    // List all files
    if (path === "/files" && request.method === "GET") {
      const list = await env.BUCKET.list();
      const files = list.objects.map(obj => ({
        name: obj.key,
        size: obj.size,
        uploaded: obj.uploaded
      }));
      return new Response(JSON.stringify(files, null, 2), {
        headers: { "content-type": "application/json" }
      });
    }

    // Upload a file: PUT /files/filename.txt
    if (path.startsWith("/files/") && request.method === "PUT") {
      const filename = path.replace("/files/", "");
      await env.BUCKET.put(filename, request.body);
      return new Response(JSON.stringify({ 
        success: true, 
        message: `File '${filename}' uploaded!` 
      }), {
        headers: { "content-type": "application/json" }
      });
    }

    // Download a file: GET /files/filename.txt
    if (path.startsWith("/files/") && request.method === "GET") {
      const filename = path.replace("/files/", "");
      const file = await env.BUCKET.get(filename);
      
      if (!file) {
        return new Response("File not found", { status: 404 });
      }
      
      return new Response(file.body, {
        headers: { 
          "content-type": file.httpMetadata?.contentType || "application/octet-stream" 
        }
      });
    }

    // Delete a file: DELETE /files/filename.txt
    if (path.startsWith("/files/") && request.method === "DELETE") {
      const filename = path.replace("/files/", "");
      await env.BUCKET.delete(filename);
      return new Response(JSON.stringify({ 
        success: true, 
        message: `File '${filename}' deleted!` 
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

## Step 5: Test Locally

**In PowerShell, run:**
```powershell
npm run dev
```

**Open your browser:**
```
http://localhost:8787
```

---

## Step 6: Upload a File

**Open a new PowerShell window** and run:

```powershell
Invoke-RestMethod -Uri "http://localhost:8787/files/hello.txt" -Method PUT -Body "Hello, this is my file content!"
```

**Check the file list:**
```
http://localhost:8787/files
```

**Download the file:**
```
http://localhost:8787/files/hello.txt
```

---

## Step 7: Deploy to Production

**Stop the local server** (Ctrl + C)

**Deploy:**
```powershell
npm run deploy
```

**Your file storage is now live!**

---

## ✅ What You Learned

| Skill | ✓ |
|-------|---|
| Create an R2 bucket | ☐ |
| Upload files | ☐ |
| Download files | ☐ |
| List files | ☐ |
| Delete files | ☐ |

---

## Quick Reference

| What You Want to Do | Command |
|---------------------|---------|
| Create a bucket | `npx wrangler r2 bucket create bucket-name` |
| List buckets | `npx wrangler r2 bucket list` |
| Upload file via CLI | `npx wrangler r2 object put bucket-name/file.txt --file=./local-file.txt --remote` |

---

## Next Module

**Great!** You can now store files in the cloud!

**Next:** [Module 5: Deploy with GitHub →](./05-github-deploy.md)
