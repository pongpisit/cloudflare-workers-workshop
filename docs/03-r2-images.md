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

---

## Step 3: Connect R2 to Your Worker

**Open VS Code:**
```powershell
code .
```

**Open `wrangler.jsonc` and replace ALL content with:**

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

---

## Step 4: Learn Basic R2 Operations

**Open `src/index.js` and replace ALL the code with:**

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

**Replace ALL the code in `src/index.js` with:**

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

## Real World Example: Photo Sharing App

Now let's enhance the gallery into a photo sharing app with a better UI.

**Replace ALL the code in `src/index.js` with:**

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") return showGallery(env);
    if (url.pathname === "/upload" && request.method === "POST") {
      const formData = await request.formData();
      const file = formData.get("image");
      if (!file) return new Response("No file", { status: 400 });
      await env.BUCKET.put(Date.now() + "-" + file.name, file.stream(), {
        httpMetadata: { contentType: file.type }
      });
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
      await env.BUCKET.delete(url.pathname.replace("/delete/", ""));
      return Response.redirect(new URL("/", request.url).toString(), 302);
    }
    return new Response("Not found", { status: 404 });
  }
};

async function showGallery(env) {
  const list = await env.BUCKET.list();
  let images = "";
  
  if (list.objects.length === 0) {
    images = '<p class="empty">No photos yet. Upload your first photo!</p>';
  } else {
    for (const obj of list.objects.sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded))) {
      images += `
        <div class="photo">
          <img src="/image/${obj.key}" onclick="this.parentElement.classList.toggle('expanded')">
          <div class="overlay">
            <form action="/delete/${obj.key}" method="POST">
              <button type="submit" onclick="return confirm('Delete this photo?')">Delete</button>
            </form>
          </div>
        </div>`;
    }
  }

  return new Response(`<!DOCTYPE html>
<html>
<head>
  <title>Photo Sharing</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #111; color: white; min-height: 100vh; }
    
    header { background: #000; padding: 15px 20px; border-bottom: 1px solid #333; }
    .header-content { max-width: 1000px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    h1 { font-size: 20px; }
    
    .upload-btn { background: #0095f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
    .upload-btn:hover { background: #1877f2; }
    
    .modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 100; justify-content: center; align-items: center; }
    .modal.active { display: flex; }
    .modal-box { background: #222; padding: 30px; border-radius: 12px; text-align: center; }
    .modal-box h2 { margin-bottom: 20px; }
    .modal-box input { margin: 10px 0; }
    .modal-box button { background: #0095f6; color: white; border: none; padding: 10px 30px; border-radius: 6px; cursor: pointer; margin-top: 10px; }
    .close { position: absolute; top: 20px; right: 20px; background: none; border: none; color: white; font-size: 30px; cursor: pointer; }
    
    .gallery { max-width: 1000px; margin: 20px auto; padding: 0 10px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
    @media (max-width: 600px) { .gallery { grid-template-columns: repeat(2, 1fr); } }
    
    .photo { position: relative; aspect-ratio: 1; overflow: hidden; cursor: pointer; }
    .photo img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .photo:hover img { transform: scale(1.05); }
    .overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.2s; }
    .photo:hover .overlay { opacity: 1; }
    .overlay button { background: #e74c3c; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
    
    .photo.expanded { position: fixed; inset: 0; z-index: 50; aspect-ratio: auto; background: rgba(0,0,0,0.95); display: flex; justify-content: center; align-items: center; }
    .photo.expanded img { width: auto; height: auto; max-width: 95%; max-height: 95%; object-fit: contain; }
    .photo.expanded .overlay { display: none; }
    
    .empty { grid-column: 1 / -1; text-align: center; padding: 60px; color: #666; }
  </style>
</head>
<body>
  <header>
    <div class="header-content">
      <h1>Photo Sharing</h1>
      <button class="upload-btn" onclick="document.getElementById('modal').classList.add('active')">Upload Photo</button>
    </div>
  </header>
  
  <div id="modal" class="modal" onclick="if(event.target===this)this.classList.remove('active')">
    <button class="close" onclick="document.getElementById('modal').classList.remove('active')">&times;</button>
    <div class="modal-box">
      <h2>Upload Photo</h2>
      <form action="/upload" method="POST" enctype="multipart/form-data">
        <input type="file" name="image" accept="image/*" required><br>
        <button type="submit">Upload</button>
      </form>
    </div>
  </div>
  
  <div class="gallery">${images}</div>
</body>
</html>`, { headers: { "content-type": "text/html" } });
}
```

**Save and test:**
```powershell
npm run dev
```

**Open:** http://localhost:8787

This photo sharing app includes:
- Dark theme UI
- Click to expand photos full screen
- Hover to show delete button
- Modal for uploading
- Responsive grid layout

**Deploy when ready:**
```powershell
npm run deploy
```

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
| Build photo sharing app | |

---

## Key R2 Operations

| Operation | Code |
|-----------|------|
| Upload | `await env.BUCKET.put(key, data)` |
| Download | `await env.BUCKET.get(key)` |
| List | `await env.BUCKET.list()` |
| Delete | `await env.BUCKET.delete(key)` |

---

## Quick Reference

| Command | What It Does |
|---------|--------------|
| `npx wrangler r2 bucket create name` | Create bucket |
| `npx wrangler r2 bucket list` | List buckets |
| `npx wrangler r2 bucket delete name` | Delete bucket |

---

## Next Module

You now know how to store and serve files with R2!

**Next:** [Module 4: AI Chatbot](./04-ai-chatbot.md)
