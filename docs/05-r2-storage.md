# Module 5: Integrating with R2 Storage

This module teaches you how to use Cloudflare R2, an S3-compatible object storage service, with your Workers.

## 📋 Table of Contents

1. [What is R2?](#what-is-r2)
2. [Create an R2 Bucket](#create-an-r2-bucket)
3. [Bind R2 to Your Worker](#bind-r2-to-your-worker)
4. [R2 Operations](#r2-operations)
5. [Public Access & Custom Domains](#public-access--custom-domains)
6. [Hands-on Exercise: Build a File Upload API](#hands-on-exercise-build-a-file-upload-api)

---

## What is R2?

R2 is Cloudflare's object storage service, designed to be S3-compatible with zero egress fees.

### Key Features

| Feature | Description |
|---------|-------------|
| **S3 Compatible** | Works with existing S3 tools and SDKs |
| **Zero Egress** | No charges for data transfer out |
| **Global** | Automatically distributed globally |
| **Integrated** | Native binding to Workers |
| **Free Tier** | 10 GB storage, 1M Class A ops, 10M Class B ops |

### R2 vs Other Storage Options

| Use Case | Recommended |
|----------|-------------|
| Large files (images, videos, documents) | **R2** |
| Small key-value data | KV |
| Relational data | D1 |
| Real-time state | Durable Objects |

### Pricing (Beyond Free Tier)

| Resource | Price |
|----------|-------|
| Storage | $0.015 / GB-month |
| Class A operations (write) | $4.50 / million |
| Class B operations (read) | $0.36 / million |
| Egress | **$0 (free!)** |

---

## Create an R2 Bucket

### Method 1: Using Wrangler CLI

```powershell
# Create a new R2 bucket
npx wrangler r2 bucket create my-bucket
```

**Expected Output:**
```
Creating bucket my-bucket.
Created bucket my-bucket.
```

### Method 2: Using Cloudflare Dashboard

1. Log in to the Cloudflare Dashboard: **https://dash.cloudflare.com/**

2. Navigate to **R2 Object Storage** in the left sidebar

3. Click **Create bucket**

4. Enter a bucket name: `my-bucket`
   > **Note**: Bucket names must be globally unique and lowercase

5. (Optional) Select a location hint

6. Click **Create bucket**

### List Your Buckets

```powershell
npx wrangler r2 bucket list
```

---

## Bind R2 to Your Worker

### Step 1: Create a Worker Project

```powershell
npm create cloudflare@latest -- r2-demo
cd r2-demo
```

### Step 2: Add R2 Binding to Configuration

**wrangler.jsonc:**
```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "r2-demo",
  "main": "src/index.ts",
  "compatibility_date": "2024-01-01",
  
  "r2_buckets": [
    {
      "binding": "MY_BUCKET",
      "bucket_name": "my-bucket"
    }
  ]
}
```

**wrangler.toml:**
```toml
name = "r2-demo"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "MY_BUCKET"
bucket_name = "my-bucket"
```

### Step 3: Generate TypeScript Types

```powershell
npx wrangler types
```

---

## R2 Operations

### Basic Operations Overview

```typescript
export interface Env {
  MY_BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // PUT - Upload an object
    await env.MY_BUCKET.put('key', 'value');
    
    // GET - Download an object
    const object = await env.MY_BUCKET.get('key');
    
    // HEAD - Get object metadata only
    const head = await env.MY_BUCKET.head('key');
    
    // DELETE - Delete an object
    await env.MY_BUCKET.delete('key');
    
    // LIST - List objects
    const listed = await env.MY_BUCKET.list();
    
    return new Response('OK');
  },
};
```

### PUT - Upload Objects

```typescript
// Upload text
await env.MY_BUCKET.put('hello.txt', 'Hello, World!');

// Upload JSON
await env.MY_BUCKET.put('data.json', JSON.stringify({ foo: 'bar' }), {
  httpMetadata: {
    contentType: 'application/json',
  },
});

// Upload from request body (for file uploads)
await env.MY_BUCKET.put('uploaded-file.pdf', request.body, {
  httpMetadata: {
    contentType: request.headers.get('content-type') || 'application/octet-stream',
  },
});

// Upload with custom metadata
await env.MY_BUCKET.put('image.jpg', imageData, {
  httpMetadata: {
    contentType: 'image/jpeg',
    cacheControl: 'public, max-age=31536000',
  },
  customMetadata: {
    uploadedBy: 'user123',
    originalName: 'photo.jpg',
  },
});
```

### GET - Download Objects

```typescript
// Get an object
const object = await env.MY_BUCKET.get('hello.txt');

if (object === null) {
  return new Response('Object not found', { status: 404 });
}

// Return the object as response
const headers = new Headers();
object.writeHttpMetadata(headers);
headers.set('etag', object.httpEtag);

return new Response(object.body, { headers });

// Get object as text
const text = await object.text();

// Get object as JSON
const json = await object.json();

// Get object as ArrayBuffer
const buffer = await object.arrayBuffer();
```

### GET with Range Requests (Partial Content)

```typescript
// Support range requests for video streaming, resumable downloads
const object = await env.MY_BUCKET.get('video.mp4', {
  range: request.headers,
  onlyIf: request.headers,
});

if (object === null) {
  return new Response('Object not found', { status: 404 });
}

const headers = new Headers();
object.writeHttpMetadata(headers);
headers.set('etag', object.httpEtag);

// Check if this is a partial response
if (object.range) {
  headers.set('content-range', `bytes ${object.range.offset}-${object.range.offset + object.range.length - 1}/${object.size}`);
  return new Response(object.body, { status: 206, headers });
}

return new Response(object.body, { headers });
```

### HEAD - Get Metadata Only

```typescript
const head = await env.MY_BUCKET.head('file.txt');

if (head === null) {
  return new Response('Object not found', { status: 404 });
}

return Response.json({
  key: head.key,
  size: head.size,
  etag: head.etag,
  httpEtag: head.httpEtag,
  uploaded: head.uploaded,
  httpMetadata: head.httpMetadata,
  customMetadata: head.customMetadata,
});
```

### DELETE - Remove Objects

```typescript
// Delete a single object
await env.MY_BUCKET.delete('file.txt');

// Delete multiple objects
await env.MY_BUCKET.delete(['file1.txt', 'file2.txt', 'file3.txt']);
```

### LIST - List Objects

```typescript
// List all objects
const listed = await env.MY_BUCKET.list();

// List with prefix (like folders)
const images = await env.MY_BUCKET.list({
  prefix: 'images/',
});

// List with pagination
const page1 = await env.MY_BUCKET.list({ limit: 100 });
if (page1.truncated) {
  const page2 = await env.MY_BUCKET.list({
    limit: 100,
    cursor: page1.cursor,
  });
}

// List with delimiter (folder-like structure)
const folders = await env.MY_BUCKET.list({
  prefix: 'uploads/',
  delimiter: '/',
});
// folders.objects - files directly in uploads/
// folders.delimitedPrefixes - "subfolders" in uploads/
```

---

## Public Access & Custom Domains

### Enable Public Access via Dashboard

1. Go to **R2 Object Storage** in the Dashboard

2. Click on your bucket

3. Go to **Settings** tab

4. Under **Public access**, click **Allow Access**

5. Your bucket is now accessible at: `https://<bucket>.<account-id>.r2.dev`

### Custom Domain Setup

1. In your bucket settings, go to **Custom Domains**

2. Click **Connect Domain**

3. Enter your domain: `files.example.com`

4. Cloudflare will automatically configure DNS

5. Your files are now accessible at: `https://files.example.com/path/to/file`

### Accessing Public URLs in Workers

```typescript
export interface Env {
  MY_BUCKET: R2Bucket;
  R2_PUBLIC_URL: string; // Set in wrangler.jsonc vars
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Upload a file
    await env.MY_BUCKET.put('images/photo.jpg', imageData);
    
    // Return the public URL
    const publicUrl = `${env.R2_PUBLIC_URL}/images/photo.jpg`;
    
    return Response.json({ url: publicUrl });
  },
};
```

**wrangler.jsonc:**
```jsonc
{
  "vars": {
    "R2_PUBLIC_URL": "https://files.example.com"
  }
}
```

---

## Hands-on Exercise: Build a File Upload API

Let's build a complete file upload API with R2.

### Step 1: Create the Project

```powershell
npm create cloudflare@latest -- file-api
cd file-api
```

### Step 2: Create the R2 Bucket

```powershell
npx wrangler r2 bucket create file-uploads
```

### Step 3: Update Configuration

**wrangler.jsonc:**
```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "file-api",
  "main": "src/index.ts",
  "compatibility_date": "2024-01-01",
  
  "r2_buckets": [
    {
      "binding": "BUCKET",
      "bucket_name": "file-uploads"
    }
  ],
  
  "vars": {
    "MAX_FILE_SIZE": "10485760"
  }
}
```

### Step 4: Implement the API

**src/index.ts:**
```typescript
export interface Env {
  BUCKET: R2Bucket;
  MAX_FILE_SIZE: string;
}

interface FileMetadata {
  key: string;
  size: number;
  uploaded: string;
  contentType: string;
  customMetadata?: Record<string, string>;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Custom-Metadata',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // POST /upload - Upload a file
      if (path === '/upload' && method === 'POST') {
        const contentType = request.headers.get('content-type') || '';
        
        // Handle multipart form data
        if (contentType.includes('multipart/form-data')) {
          const formData = await request.formData();
          const file = formData.get('file') as File | null;
          
          if (!file) {
            return Response.json(
              { error: 'No file provided' },
              { status: 400, headers: corsHeaders }
            );
          }

          // Check file size
          const maxSize = parseInt(env.MAX_FILE_SIZE);
          if (file.size > maxSize) {
            return Response.json(
              { error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` },
              { status: 400, headers: corsHeaders }
            );
          }

          // Generate unique key
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 8);
          const extension = file.name.split('.').pop() || '';
          const key = `uploads/${timestamp}-${randomId}.${extension}`;

          // Upload to R2
          await env.BUCKET.put(key, file.stream(), {
            httpMetadata: {
              contentType: file.type,
            },
            customMetadata: {
              originalName: file.name,
              uploadedAt: new Date().toISOString(),
            },
          });

          return Response.json({
            success: true,
            key: key,
            originalName: file.name,
            size: file.size,
            contentType: file.type,
          }, { status: 201, headers: corsHeaders });
        }

        // Handle raw binary upload
        const filename = url.searchParams.get('filename') || 'file';
        const key = `uploads/${Date.now()}-${filename}`;

        await env.BUCKET.put(key, request.body, {
          httpMetadata: {
            contentType: contentType || 'application/octet-stream',
          },
        });

        return Response.json({
          success: true,
          key: key,
        }, { status: 201, headers: corsHeaders });
      }

      // GET /files - List all files
      if (path === '/files' && method === 'GET') {
        const prefix = url.searchParams.get('prefix') || 'uploads/';
        const limit = parseInt(url.searchParams.get('limit') || '100');
        const cursor = url.searchParams.get('cursor') || undefined;

        const listed = await env.BUCKET.list({
          prefix,
          limit,
          cursor,
        });

        const files: FileMetadata[] = listed.objects.map(obj => ({
          key: obj.key,
          size: obj.size,
          uploaded: obj.uploaded.toISOString(),
          contentType: obj.httpMetadata?.contentType || 'unknown',
          customMetadata: obj.customMetadata,
        }));

        return Response.json({
          files,
          truncated: listed.truncated,
          cursor: listed.truncated ? listed.cursor : undefined,
        }, { headers: corsHeaders });
      }

      // GET /files/:key - Download a file
      if (path.startsWith('/files/') && method === 'GET') {
        const key = decodeURIComponent(path.replace('/files/', ''));
        
        const object = await env.BUCKET.get(key, {
          range: request.headers,
          onlyIf: request.headers,
        });

        if (object === null) {
          return Response.json(
            { error: 'File not found' },
            { status: 404, headers: corsHeaders }
          );
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        
        // Add CORS headers
        Object.entries(corsHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });

        // Handle range requests
        if (object.range) {
          const { offset, length } = object.range;
          headers.set('content-range', `bytes ${offset}-${offset + length - 1}/${object.size}`);
          headers.set('content-length', length.toString());
          return new Response(object.body, { status: 206, headers });
        }

        return new Response(object.body, { headers });
      }

      // HEAD /files/:key - Get file metadata
      if (path.startsWith('/files/') && method === 'HEAD') {
        const key = decodeURIComponent(path.replace('/files/', ''));
        
        const head = await env.BUCKET.head(key);

        if (head === null) {
          return new Response(null, { status: 404, headers: corsHeaders });
        }

        const headers = new Headers(corsHeaders);
        headers.set('content-length', head.size.toString());
        headers.set('content-type', head.httpMetadata?.contentType || 'application/octet-stream');
        headers.set('etag', head.httpEtag);
        headers.set('last-modified', head.uploaded.toUTCString());

        return new Response(null, { headers });
      }

      // DELETE /files/:key - Delete a file
      if (path.startsWith('/files/') && method === 'DELETE') {
        const key = decodeURIComponent(path.replace('/files/', ''));
        
        // Check if file exists
        const head = await env.BUCKET.head(key);
        if (head === null) {
          return Response.json(
            { error: 'File not found' },
            { status: 404, headers: corsHeaders }
          );
        }

        await env.BUCKET.delete(key);

        return Response.json({
          success: true,
          message: 'File deleted',
          key: key,
        }, { headers: corsHeaders });
      }

      // Root path - API info
      if (path === '/' || path === '') {
        return Response.json({
          name: 'File Upload API',
          version: '1.0.0',
          endpoints: {
            'POST /upload': 'Upload a file (multipart/form-data or raw binary)',
            'GET /files': 'List all files',
            'GET /files/:key': 'Download a file',
            'HEAD /files/:key': 'Get file metadata',
            'DELETE /files/:key': 'Delete a file',
          },
          limits: {
            maxFileSize: `${parseInt(env.MAX_FILE_SIZE) / 1024 / 1024}MB`,
          },
        }, { headers: corsHeaders });
      }

      return Response.json(
        { error: 'Not found' },
        { status: 404, headers: corsHeaders }
      );

    } catch (error) {
      console.error('Error:', error);
      return Response.json(
        { error: error instanceof Error ? error.message : 'Internal server error' },
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
```

### Step 5: Test Locally

```powershell
npx wrangler dev
```

Test the API:

```powershell
# Upload a file using curl (Windows PowerShell)
curl.exe -X POST http://localhost:8787/upload -F "file=@C:\path\to\your\file.jpg"

# List files
curl.exe http://localhost:8787/files

# Download a file
curl.exe http://localhost:8787/files/uploads/your-file-key.jpg -o downloaded.jpg

# Delete a file
curl.exe -X DELETE http://localhost:8787/files/uploads/your-file-key.jpg
```

### Step 6: Test with HTML Form

Create a simple HTML file to test uploads:

**test-upload.html:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>File Upload Test</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
    .upload-form { border: 2px dashed #ccc; padding: 20px; text-align: center; }
    .result { margin-top: 20px; padding: 10px; background: #f5f5f5; }
    button { padding: 10px 20px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>File Upload Test</h1>
  
  <div class="upload-form">
    <input type="file" id="fileInput" />
    <button onclick="uploadFile()">Upload</button>
  </div>
  
  <div id="result" class="result" style="display: none;"></div>
  
  <h2>Files</h2>
  <button onclick="listFiles()">Refresh List</button>
  <ul id="fileList"></ul>

  <script>
    const API_URL = 'http://localhost:8787';

    async function uploadFile() {
      const fileInput = document.getElementById('fileInput');
      const file = fileInput.files[0];
      
      if (!file) {
        alert('Please select a file');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        
        document.getElementById('result').style.display = 'block';
        document.getElementById('result').innerHTML = `
          <strong>Upload Result:</strong><br>
          <pre>${JSON.stringify(result, null, 2)}</pre>
        `;
        
        listFiles();
      } catch (error) {
        alert('Upload failed: ' + error.message);
      }
    }

    async function listFiles() {
      try {
        const response = await fetch(`${API_URL}/files`);
        const data = await response.json();
        
        const list = document.getElementById('fileList');
        list.innerHTML = data.files.map(file => `
          <li>
            <a href="${API_URL}/files/${encodeURIComponent(file.key)}" target="_blank">
              ${file.key}
            </a>
            (${(file.size / 1024).toFixed(2)} KB)
            <button onclick="deleteFile('${file.key}')">Delete</button>
          </li>
        `).join('');
      } catch (error) {
        console.error('Failed to list files:', error);
      }
    }

    async function deleteFile(key) {
      if (!confirm('Delete this file?')) return;
      
      try {
        await fetch(`${API_URL}/files/${encodeURIComponent(key)}`, {
          method: 'DELETE',
        });
        listFiles();
      } catch (error) {
        alert('Delete failed: ' + error.message);
      }
    }

    // Load files on page load
    listFiles();
  </script>
</body>
</html>
```

Open this HTML file in your browser to test the upload functionality.

### Step 7: Deploy to Production

```powershell
npx wrangler deploy
```

---

## R2 CLI Commands Reference

```powershell
# Bucket management
npx wrangler r2 bucket create <bucket-name>
npx wrangler r2 bucket list
npx wrangler r2 bucket delete <bucket-name>

# Object management (local development)
npx wrangler r2 object put <bucket>/<key> --file=./local-file.txt
npx wrangler r2 object get <bucket>/<key>
npx wrangler r2 object delete <bucket>/<key>

# Object management (remote/production) - IMPORTANT!
npx wrangler r2 object put <bucket>/<key> --file=./local-file.txt --remote
npx wrangler r2 object get <bucket>/<key> --remote
npx wrangler r2 object delete <bucket>/<key> --remote
```

> **⚠️ Important**: Always use the `--remote` flag when working with production R2 buckets. Without it, operations affect only local development storage.

---

## 📝 Checkpoint

Before proceeding, ensure you have:

- [ ] Created an R2 bucket
- [ ] Bound R2 to a Worker
- [ ] Implemented upload, download, list, and delete operations
- [ ] Understood the difference between local and remote R2 operations
- [ ] Completed the File Upload API exercise

---

## Next Steps

Excellent work! Now let's set up automated deployments with GitHub.

**Continue to** → [Module 6: GitHub Integration & CI/CD](./06-github-integration.md)
