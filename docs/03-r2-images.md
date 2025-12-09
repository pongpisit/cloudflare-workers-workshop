# Module 3: Image Storage with R2

In this module, you will learn how to store and serve images using Cloudflare R2.

**Time needed: 30 minutes**

---

## What You Will Learn

- Create an R2 storage bucket
- Connect R2 to your Worker
- Upload files to R2
- Download files from R2
- List files in R2
- Delete files from R2
- Build an image gallery

---

## What is R2?

R2 is Cloudflare's object storage service. You can store files like:
- Images (jpg, png, gif)
- Videos (mp4, webm)
- Documents (pdf, txt)
- Any other files

---

## Step 1: Create a New Project

> [!NOTE]  
> For those following alone via Clouddflare dashboard, you may create a new application.

**Open PowerShell:**

```powershell
cd $HOME\Documents\cloudflare-projects
```

```powershell
npm create cloudflare@latest -- my-gallery
```

**Answer the questions:**
- Start with → Hello World example
- Template → Worker only
- Language → JavaScript
- Git → no
- Deploy → no

**Go into the project:**
```powershell
cd my-gallery
```

---

## Step 2: Create a Storage Bucket

**Run this command to create storage for your photos:**

```powershell
npx wrangler r2 bucket create my-photos
```

You should see: `Created bucket 'my-photos'`

> [!NOTE]  
> Alternatively, you can create a bucket via Cloudflare dashboard. 
> From the sidebar, go to: *Storage & databases* > *R2 object storage* > *Overview**Create bucket*.

---

## Step 3: Connect R2 to Your Worker

### 3.1 Steps for via VS Code

**Open VS Code:**
```powershell
code .
```

**File to edit: `wrangler.jsonc`**

This file is in the root of your project folder (not inside src/).

**Delete everything in the file and paste this code:**

```json
{
  "name": "my-gallery",
  "main": "src/index.js",
  "compatibility_date": "2024-11-01",
  "r2_buckets": [
    {
      "binding": "BUCKET",
      "bucket_name": "my-photos"
    }
  ]
}
```

**What does this do?**

| Part | Meaning |
|------|---------|
| `binding` | The name you use in your code to access R2 |
| `bucket_name` | The actual bucket name you created |


**Save the file (Ctrl + S)**

### 3.2 Steps for via Cloudflare dashboard

**Go to: Workers & Pages > my-gallery > Bindings > Add binding > R2 bucket > Add Binding**

**Fill in the form:**
- Variable name: `BUCKET`
- Bucket name: `my-photos`

**Deploy :rocket:**

---

## Step 4: Learn Basic R2 Operations

**File to edit: `src/index.js`**

This file is inside the `src` folder.

**Delete everything in the file and paste this code:**

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Home - show instructions
    if (path === "/") {
      return new Response(`
R2 Storage API

Upload:   PUT  /files/filename.txt
Download: GET  /files/filename.txt
List:     GET  /files
Delete:   DELETE /files/filename.txt
      `);
    }

    // List all files
    if (path === "/files" && request.method === "GET") {
      const list = await env.BUCKET.list();
      const files = list.objects.map(obj => ({
        name: obj.key,
        size: obj.size,
        uploaded: obj.uploaded
      }));
      return Response.json(files);
    }

    // Upload a file
    if (path.startsWith("/files/") && request.method === "PUT") {
      const key = path.replace("/files/", "");
      await env.BUCKET.put(key, request.body);
      return Response.json({ success: true, message: "File uploaded: " + key });
    }

    // Download a file
    if (path.startsWith("/files/") && request.method === "GET") {
      const key = path.replace("/files/", "");
      const object = await env.BUCKET.get(key);
      
      if (!object) {
        return new Response("File not found", { status: 404 });
      }
      
      return new Response(object.body);
    }

    // Delete a file
    if (path.startsWith("/files/") && request.method === "DELETE") {
      const key = path.replace("/files/", "");
      await env.BUCKET.delete(key);
      return Response.json({ success: true, message: "File deleted: " + key });
    }

    return new Response("Not found", { status: 404 });
  }
};
```

**Save the file (Ctrl + S)**

---

## Step 5: Test R2 Operations

**Start the local server:**
```powershell
npm run dev
```

**Open your browser:**
```
http://localhost:8787
```

You should see the API instructions.

---

## Step 6: Test Upload and Download

**Open a new PowerShell window and test:**

**Upload a text file:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8787/files/hello.txt" -Method PUT -Body "Hello from R2!"
```

**List all files:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8787/files" -Method GET
```

**Download the file:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8787/files/hello.txt" -Method GET
```

**Delete the file:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8787/files/hello.txt" -Method DELETE
```

---

## Step 7: Build an Image Gallery

Now let's build a web page to upload and view images.

**File to edit: `src/index.js`**

**Delete everything in the file and paste this code:**

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Home page - show gallery
    if (url.pathname === "/") {
      return showGallery(env);
    }

    // Upload image
    if (url.pathname === "/upload" && request.method === "POST") {
      const formData = await request.formData();
      const file = formData.get("image");
      if (!file) return new Response("No file", { status: 400 });

      const filename = Date.now() + "-" + file.name;
      await env.BUCKET.put(filename, file.stream(), {
        httpMetadata: { contentType: file.type }
      });

      return Response.redirect(new URL("/", request.url).toString(), 302);
    }

    // Serve image
    if (url.pathname.startsWith("/image/")) {
      const key = url.pathname.replace("/image/", "");
      const object = await env.BUCKET.get(key);
      if (!object) return new Response("Not found", { status: 404 });

      return new Response(object.body, {
        headers: { "content-type": object.httpMetadata?.contentType || "image/jpeg" }
      });
    }

    // Delete image
    if (url.pathname.startsWith("/delete/") && request.method === "POST") {
      const key = url.pathname.replace("/delete/", "");
      await env.BUCKET.delete(key);
      return Response.redirect(new URL("/", request.url).toString(), 302);
    }

    // API - list images
    if (url.pathname === "/api/images") {
      const list = await env.BUCKET.list();
      return Response.json(list.objects.map(obj => ({
        name: obj.key,
        url: "/image/" + obj.key
      })));
    }

    return new Response("Not found", { status: 404 });
  }
};

async function showGallery(env) {
  const list = await env.BUCKET.list();
  
  let imagesHtml = "";
  if (list.objects.length === 0) {
    imagesHtml = '<p class="empty">No images yet. Upload your first image!</p>';
  } else {
    for (const obj of list.objects) {
      imagesHtml += `
        <div class="image-card">
          <img src="/image/${obj.key}" alt="${obj.key}">
          <div class="image-actions">
            <span>${obj.key}</span>
            <form action="/delete/${obj.key}" method="POST">
              <button type="submit" onclick="return confirm('Delete this image?')">Delete</button>
            </form>
          </div>
        </div>`;
    }
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Image Gallery</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    h1 { text-align: center; margin-bottom: 20px; color: #333; }
    
    .upload-form {
      max-width: 500px;
      margin: 0 auto 30px;
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .upload-form input { margin: 10px 0; }
    .upload-form button {
      background: #f38020;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .gallery {
      max-width: 900px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }
    
    .image-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }
    .image-card img {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }
    .image-actions {
      padding: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .image-actions span {
      font-size: 12px;
      color: #666;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 60%;
    }
    .image-actions button {
      background: #dc3545;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    
    .empty {
      grid-column: 1 / -1;
      text-align: center;
      padding: 40px;
      color: #888;
    }
  </style>
</head>
<body>
  <h1>Image Gallery</h1>
  
  <div class="upload-form">
    <h3>Upload Image</h3>
    <form action="/upload" method="POST" enctype="multipart/form-data">
      <input type="file" name="image" accept="image/*" required>
      <br>
      <button type="submit">Upload</button>
    </form>
  </div>

  <div class="gallery">
    ${imagesHtml}
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { "content-type": "text/html" }
  });
}
```

**Save the file (Ctrl + S)**

---

## Step 8: Test the Image Gallery

**Refresh your browser:**
```
http://localhost:8787
```

**Try these:**
1. Click "Choose File" and select an image
2. Click "Upload"
3. See your image in the gallery
4. Upload more images
5. Click "Delete" to remove an image

---

## Step 9: Test the API

**Open in browser:**
```
http://localhost:8787/api/images
```

You will see JSON data of all your images.

---

## Step 10: Deploy Your Gallery

**Stop the local server** (Ctrl + C)

**Deploy:**
```powershell
npm run deploy
```

Your image gallery is now live on the internet!

---

## Real World Example: Instagram-Style Photo App with Captions

Now let's build an Instagram-style app with captions using D1 database.

**IMPORTANT: Follow each step carefully. Do not skip any step.**

---

### Step 1: Stop the Server

If your server is running, press **Ctrl + C** to stop it.

---

### Step 2: Create a D1 Database

#### 2.1 Steps for via VS Code

**Run this command in PowerShell:**
```powershell
npx wrangler d1 create my-photos-db
```

**You will see output like this:**
```
Successfully created DB 'my-photos-db'

[[d1_databases]]
binding = "MY_PHOTOS_DB"
database_name = "my-photos-db"
database_id = "abc12345-1234-5678-abcd-1234567890ab"
```

**IMPORTANT: Copy your `database_id` value. You will need it in the next step.**

Your database_id will be different from the example above.

#### 2.2 Steps for via Cloudflare dashboard

**Create D1 database. Go to: Storage & databases* >D1 SQL database > Create Databse >**

**Add binding to your worker. Go to Workers & Pages > my-gallery > Bindings > Add binding > D1 database > Add Binding**
- Variable name: `DB`
- Database name: `my-photos-db`

---

### Step 3: Update wrangler.jsonc

**Open `wrangler.jsonc` in VS Code.**

**Delete everything and paste this code:**

```json
{
  "name": "my-gallery",
  "main": "src/index.js",
  "compatibility_date": "2024-11-01",
  "r2_buckets": [
    {
      "binding": "BUCKET",
      "bucket_name": "my-photos"
    }
  ],
  "d1_databases": [
    {
      "binding": "MY_PHOTOS_DB",
      "database_name": "my-photos-db",
      "database_id": "PASTE_YOUR_DATABASE_ID_HERE"
    }
  ]
}
```

**IMPORTANT: Replace `PASTE_YOUR_DATABASE_ID_HERE` with your actual database_id from Step 2.**

For example, if your database_id was `abc12345-1234-5678-abcd-1234567890ab`, your file should look like:

```json
{
  "name": "my-gallery",
  "main": "src/index.js",
  "compatibility_date": "2024-11-01",
  "r2_buckets": [
    {
      "binding": "BUCKET",
      "bucket_name": "my-photos"
    }
  ],
  "d1_databases": [
    {
      "binding": "MY_PHOTOS_DB",
      "database_name": "my-photos-db",
      "database_id": "abc12345-1234-5678-abcd-1234567890ab"
    }
  ]
}
```

**Save the file (Ctrl + S)**

---

### Step 4: Update the Code

**File to edit: `src/index.js`**

This file is inside the `src` folder.

**Delete everything in the file and paste this code:**

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Auto-initialize database table on every request
    try {
      await env.MY_PHOTOS_DB.prepare(`
        CREATE TABLE IF NOT EXISTS photos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filename TEXT NOT NULL,
          caption TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
    } catch (e) {
      // Table already exists, ignore error
    }

    if (url.pathname === "/") return showFeed(env);
    
    if (url.pathname === "/upload" && request.method === "POST") {
      const formData = await request.formData();
      const file = formData.get("image");
      const caption = formData.get("caption") || "";
      
      if (!file) return new Response("No file", { status: 400 });
      
      const filename = Date.now() + "-" + file.name;
      await env.BUCKET.put(filename, file.stream(), {
        httpMetadata: { contentType: file.type }
      });
      
      await env.MY_PHOTOS_DB.prepare("INSERT INTO photos (filename, caption) VALUES (?, ?)")
        .bind(filename, caption)
        .run();
      
      return Response.redirect(new URL("/", request.url).toString(), 302);
    }
    
    if (url.pathname.startsWith("/image/")) {
      const object = await env.BUCKET.get(url.pathname.replace("/image/", ""));
      if (!object) return new Response("Not found", { status: 404 });
      return new Response(object.body, {
        headers: { "content-type": object.httpMetadata?.contentType || "image/jpeg" }
      });
    }
    
    if (url.pathname.startsWith("/delete/") && request.method === "POST") {
      const id = url.pathname.replace("/delete/", "");
      const photo = await env.MY_PHOTOS_DB.prepare("SELECT filename FROM photos WHERE id = ?").bind(id).first();
      if (photo) {
        await env.BUCKET.delete(photo.filename);
        await env.MY_PHOTOS_DB.prepare("DELETE FROM photos WHERE id = ?").bind(id).run();
      }
      return Response.redirect(new URL("/", request.url).toString(), 302);
    }
    
    if (url.pathname === "/api/photos") {
      const { results } = await env.MY_PHOTOS_DB.prepare("SELECT * FROM photos ORDER BY created_at DESC").all();
      return Response.json(results);
    }
    
    return new Response("Not found", { status: 404 });
  }
};

async function showFeed(env) {
  const { results: photos } = await env.MY_PHOTOS_DB.prepare(
    "SELECT * FROM photos ORDER BY created_at DESC"
  ).all();
  
  let postsHtml = "";
  if (photos.length === 0) {
    postsHtml = '<p class="empty">No posts yet. Share your first photo!</p>';
  } else {
    for (const photo of photos) {
      const date = new Date(photo.created_at).toLocaleDateString();
      postsHtml += `
        <article class="post">
          <img src="/image/${photo.filename}" alt="">
          <div class="post-content">
            <p class="caption">${photo.caption || ""}</p>
            <p class="date">${date}</p>
            <form action="/delete/${photo.id}" method="POST" class="delete-form">
              <button type="submit" onclick="return confirm('Delete this post?')">Delete</button>
            </form>
          </div>
        </article>`;
    }
  }

  return new Response(`<!DOCTYPE html>
<html>
<head>
  <title>PhotoGram</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #fafafa; min-height: 100vh; }
    
    header { background: white; border-bottom: 1px solid #dbdbdb; padding: 12px 20px; position: sticky; top: 0; z-index: 100; }
    .header-content { max-width: 600px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 24px; font-weight: 600; font-style: italic; }
    
    .new-post-btn { background: #0095f6; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .new-post-btn:hover { background: #1877f2; }
    
    .feed { max-width: 600px; margin: 20px auto; padding: 0 20px; }
    
    .post { background: white; border: 1px solid #dbdbdb; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }
    .post img { width: 100%; aspect-ratio: 1; object-fit: cover; }
    .post-content { padding: 15px; }
    .caption { font-size: 14px; line-height: 1.5; margin-bottom: 8px; }
    .date { font-size: 12px; color: #8e8e8e; margin-bottom: 10px; }
    .delete-form button { background: none; border: none; color: #ed4956; cursor: pointer; font-size: 12px; }
    .delete-form button:hover { text-decoration: underline; }
    
    .modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200; justify-content: center; align-items: center; }
    .modal.active { display: flex; }
    .modal-box { background: white; border-radius: 12px; padding: 20px; width: 90%; max-width: 400px; }
    .modal-box h2 { margin-bottom: 15px; font-size: 18px; }
    .modal-box input[type="file"] { margin-bottom: 15px; }
    .modal-box textarea { width: 100%; height: 80px; border: 1px solid #dbdbdb; border-radius: 8px; padding: 10px; resize: none; font-family: inherit; margin-bottom: 15px; }
    .modal-box button[type="submit"] { width: 100%; background: #0095f6; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .close-btn { position: absolute; top: 15px; right: 20px; background: none; border: none; color: white; font-size: 30px; cursor: pointer; }
    
    .empty { text-align: center; padding: 60px 20px; color: #8e8e8e; }
  </style>
</head>
<body>
  <header>
    <div class="header-content">
      <div class="logo">PhotoGram</div>
      <button class="new-post-btn" onclick="document.getElementById('modal').classList.add('active')">New Post</button>
    </div>
  </header>
  
  <div id="modal" class="modal" onclick="if(event.target===this)this.classList.remove('active')">
    <button class="close-btn" onclick="document.getElementById('modal').classList.remove('active')">&times;</button>
    <div class="modal-box">
      <h2>Create New Post</h2>
      <form action="/upload" method="POST" enctype="multipart/form-data">
        <input type="file" name="image" accept="image/*" required>
        <textarea name="caption" placeholder="Write a caption..."></textarea>
        <button type="submit">Share</button>
      </form>
    </div>
  </div>
  
  <div class="feed">${postsHtml}</div>
</body>
</html>`, { headers: { "content-type": "text/html" } });
}
```

**Save the file (Ctrl + S)**

---

### Step 5: Test the App

**Make sure you completed Steps 1-4 before continuing.**

**Checklist before testing:**
- [ ] Created D1 database with `npx wrangler d1 create my-photos-db`
- [ ] Updated `wrangler.jsonc` with your database_id
- [ ] Updated `src/index.js` with the new code
- [ ] Saved both files

**Start the local server:**
```powershell
npm run dev
```

**Open your browser:**
```
http://localhost:8787
```

**You should see the PhotoGram app.**

**Try these features:**
1. Click "New Post"
2. Select a photo from your computer
3. Write a caption (e.g., "My first post!")
4. Click "Share"
5. See your post with caption in the feed

---

### Step 6: Deploy

**Stop the server (Ctrl + C)**

**Step 6a: Create the database table on remote**

First, create a file called `schema.sql` in your project folder with this content:

```sql
CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  caption TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Run this command to create the table on the remote database:**
```powershell
npx wrangler d1 execute my-photos-db --remote --file=schema.sql
```

You should see: `Executed 1 command`

**Step 6b: Deploy the Worker**

```powershell
npm run deploy
```

Your app is now live on the internet!

---

### Troubleshooting

**Error: Cannot read properties of undefined (reading 'exec')**

This means `env.MY_PHOTOS_DB` is not defined. Check these:

1. Did you create the D1 database? Run: `npx wrangler d1 create my-photos-db`
2. Did you add `d1_databases` to `wrangler.jsonc`?
3. Did you replace `PASTE_YOUR_DATABASE_ID_HERE` with your actual database_id?
4. Did you save `wrangler.jsonc`?
5. Did you restart the server after saving?

**Error: no such table: photos**

The database table was not created. This should auto-create, but if it doesn't:
1. Stop the server (Ctrl + C)
2. Restart with `npm run dev`
3. Refresh the browser

---

## What You Learned

| Skill | Done |
|-------|------|
| Create R2 bucket | |
| Connect R2 to Worker | |
| Upload files to R2 | |
| Download files from R2 | |
| List files in R2 | |
| Delete files from R2 | |
| Build image gallery | |
| Create D1 database | |
| Store captions in D1 | |
| Build Instagram-style app | |

---

## Key Operations

**R2 (File Storage):**

| Operation | Code |
|-----------|------|
| Upload | `await env.BUCKET.put(key, data)` |
| Download | `await env.BUCKET.get(key)` |
| List | `await env.BUCKET.list()` |
| Delete | `await env.BUCKET.delete(key)` |

**D1 (Database):**

| Operation | Code |
|-----------|------|
| Insert | `await env.MY_PHOTOS_DB.prepare("INSERT...").bind(...).run()` |
| Select | `await env.MY_PHOTOS_DB.prepare("SELECT...").all()` |
| Delete | `await env.MY_PHOTOS_DB.prepare("DELETE...").bind(...).run()` |

---

## Quick Reference

| Command | What It Does |
|---------|--------------|
| `npx wrangler r2 bucket create name` | Create R2 bucket |
| `npx wrangler d1 create name` | Create D1 database |
| `npx wrangler d1 execute name --local --file=schema.sql` | Run SQL locally |
| `npx wrangler d1 execute name --remote --file=schema.sql` | Run SQL on production |

---

## Next Module

You now know how to store files with R2 and data with D1!

**Next:** [Module 4: AI Chatbot](./04-ai-chatbot.md)
