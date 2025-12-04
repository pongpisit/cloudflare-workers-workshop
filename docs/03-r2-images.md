# Module 3: Build a Photo Sharing App

In this module, you will build a **photo sharing app** - like a mini Instagram!

**Time needed: 30 minutes**

---

## What You'll Build

A photo sharing app where you can:
- Upload photos
- View all photos in a beautiful grid
- Click photos to see them full size
- Delete photos you don't want

---

## Step 1: Create a New Project

**Open PowerShell:**

```powershell
cd $HOME\Documents\cloudflare-projects
```

```powershell
npm create cloudflare@latest -- my-photos
```

**Answer the questions:**
- Start with → **Hello World example**
- Template → **Hello World Worker**
- Language → **JavaScript**
- Git → **yes**
- Deploy → **no**

**Go into the project:**
```powershell
cd my-photos
```

---

## Step 2: Create a Storage Bucket

**Run this command to create storage for your photos:**

```powershell
npx wrangler r2 bucket create my-photos
```

You should see: `✅ Created bucket 'my-photos'`

---

## Step 3: Connect R2 to Your Worker

**Open VS Code:**
```powershell
code .
```

**Open `wrangler.jsonc` and replace ALL content with:**

```json
{
  "name": "my-photos",
  "main": "src/index.js",
  "compatibility_date": "2024-11-01",
  "r2_buckets": [
    {
      "binding": "PHOTOS",
      "bucket_name": "my-photos"
    }
  ]
}
```

**Save the file (Ctrl + S)**

---

## Step 4: Create the Photo Sharing App

**Open `src/index.js` and replace ALL the code with:**

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") return showGallery(env);
    if (url.pathname === "/upload" && request.method === "POST") return uploadPhoto(request, env);
    if (url.pathname.startsWith("/photo/")) return servePhoto(url.pathname, env);
    if (url.pathname.startsWith("/delete/") && request.method === "POST") return deletePhoto(url.pathname, env, request);
    if (url.pathname === "/api/photos") return listPhotos(env);

    return new Response("Not found", { status: 404 });
  }
};

async function showGallery(env) {
  const list = await env.PHOTOS.list();
  
  let photosHtml = "";
  if (list.objects.length === 0) {
    photosHtml = '<p class="empty">No photos yet. Upload your first photo! 📸</p>';
  } else {
    const sorted = list.objects.sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));
    for (const obj of sorted) {
      const name = obj.key.split('-').slice(1).join('-') || obj.key;
      photosHtml += `
        <div class="photo-card">
          <img src="/photo/${obj.key}" alt="${name}" onclick="openModal('/photo/${obj.key}')">
          <div class="photo-info">
            <span>${name}</span>
            <form action="/delete/${obj.key}" method="POST">
              <button type="submit" onclick="return confirm('Delete?')">🗑️</button>
            </form>
          </div>
        </div>`;
    }
  }

  return new Response(HTML.replace('{{PHOTOS}}', photosHtml), {
    headers: { "content-type": "text/html" }
  });
}

async function uploadPhoto(request, env) {
  const formData = await request.formData();
  const file = formData.get("photo");
  if (!file) return new Response("No file", { status: 400 });

  const filename = Date.now() + "-" + file.name;
  await env.PHOTOS.put(filename, file.stream(), {
    httpMetadata: { contentType: file.type }
  });

  return Response.redirect(new URL("/", request.url).toString(), 302);
}

async function servePhoto(pathname, env) {
  const key = pathname.replace("/photo/", "");
  const object = await env.PHOTOS.get(key);
  if (!object) return new Response("Not found", { status: 404 });

  return new Response(object.body, {
    headers: { "content-type": object.httpMetadata?.contentType || "image/jpeg" }
  });
}

async function deletePhoto(pathname, env, request) {
  await env.PHOTOS.delete(pathname.replace("/delete/", ""));
  return Response.redirect(new URL("/", request.url).toString(), 302);
}

async function listPhotos(env) {
  const list = await env.PHOTOS.list();
  return Response.json(list.objects.map(obj => ({
    key: obj.key,
    url: "/photo/" + obj.key
  })));
}

const HTML = `<!DOCTYPE html>
<html>
<head>
  <title>My Photos</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #fafafa; min-height: 100vh; }
    
    header { background: white; border-bottom: 1px solid #ddd; padding: 15px 20px; position: sticky; top: 0; z-index: 100; }
    .header-content { max-width: 900px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 24px; font-weight: bold; }
    
    .upload-btn { background: #0095f6; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .upload-btn:hover { background: #1877f2; }
    
    .modal { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 200; justify-content: center; align-items: center; }
    .modal.active { display: flex; }
    .modal-box { background: white; border-radius: 12px; padding: 30px; width: 90%; max-width: 400px; text-align: center; }
    .modal-box h2 { margin-bottom: 20px; }
    .modal-box input { margin: 15px 0; }
    .modal-box button { background: #0095f6; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; width: 100%; margin-top: 10px; }
    .close-btn { position: absolute; top: 15px; right: 20px; background: none; border: none; font-size: 30px; color: white; cursor: pointer; }
    
    .gallery { max-width: 900px; margin: 30px auto; padding: 0 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    @media (max-width: 600px) { .gallery { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
    
    .photo-card { position: relative; aspect-ratio: 1; overflow: hidden; border-radius: 8px; background: #eee; }
    .photo-card img { width: 100%; height: 100%; object-fit: cover; cursor: pointer; transition: transform 0.2s; }
    .photo-card:hover img { transform: scale(1.05); }
    .photo-info { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); padding: 30px 10px 10px; display: flex; justify-content: space-between; align-items: center; opacity: 0; transition: opacity 0.2s; }
    .photo-card:hover .photo-info { opacity: 1; }
    .photo-info span { color: white; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 70%; }
    .photo-info button { background: none; border: none; cursor: pointer; font-size: 16px; }
    
    .empty { grid-column: 1 / -1; text-align: center; padding: 60px; color: #888; }
    
    .photo-modal { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.95); z-index: 300; justify-content: center; align-items: center; }
    .photo-modal.active { display: flex; }
    .photo-modal img { max-width: 95%; max-height: 90vh; border-radius: 8px; }
  </style>
</head>
<body>
  <header>
    <div class="header-content">
      <div class="logo">📸 My Photos</div>
      <button class="upload-btn" onclick="document.getElementById('uploadModal').classList.add('active')">+ Upload</button>
    </div>
  </header>

  <div id="uploadModal" class="modal" onclick="if(event.target===this)this.classList.remove('active')">
    <button class="close-btn" onclick="document.getElementById('uploadModal').classList.remove('active')">×</button>
    <div class="modal-box">
      <h2>Upload Photo</h2>
      <form action="/upload" method="POST" enctype="multipart/form-data">
        <input type="file" name="photo" accept="image/*" required>
        <button type="submit">Share Photo</button>
      </form>
    </div>
  </div>

  <div id="photoModal" class="photo-modal" onclick="this.classList.remove('active')">
    <button class="close-btn" onclick="document.getElementById('photoModal').classList.remove('active')">×</button>
    <img id="modalImg" src="">
  </div>

  <div class="gallery">{{PHOTOS}}</div>

  <script>
    function openModal(src) {
      document.getElementById('modalImg').src = src;
      document.getElementById('photoModal').classList.add('active');
    }
  </script>
</body>
</html>`;
```

**Save the file (Ctrl + S)**

---

## Step 5: Test Your Photo App

**In PowerShell, run:**
```powershell
npm run dev
```

**Open your browser:**
```
http://localhost:8787
```

**Try these features:**
1. Click **"+ Upload"** button
2. Select a photo from your computer
3. Click **"Share Photo"**
4. See your photo in the gallery!
5. Click a photo to view it full size
6. Hover and click 🗑️ to delete

---

## Step 6: Test the API

Your app has an API! Try:
```
http://localhost:8787/api/photos
```

---

## Step 7: Deploy Your Photo App

**Stop the local server** (Ctrl + C)

**Deploy:**
```powershell
npm run deploy
```

🎉 **Your photo sharing app is live!**

---

## ✅ What You Learned

| Skill | ✓ |
|-------|---|
| Create R2 storage bucket | ☐ |
| Upload files via web form | ☐ |
| Display images from R2 | ☐ |
| Delete files from R2 | ☐ |
| Build a REST API | ☐ |

---

## Quick Reference

| Command | What It Does |
|---------|--------------|
| `npx wrangler r2 bucket create name` | Create bucket |
| `npx wrangler r2 bucket list` | List buckets |

---

## Next Module

**Amazing!** You've built a real photo sharing app!

**Next:** [Module 4: AI Chatbot →](./04-ai-chatbot.md)
