# Module 3: Image Gallery with R2 Storage

In this module, you will store images in R2 and display them in your Worker.

**Time needed: 30 minutes**

---

## What You'll Build

A simple image gallery that:
- Stores images in Cloudflare R2
- Displays images on a webpage
- Lets you upload new images

---

## Step 1: Create a Storage Bucket

**Open PowerShell and go to your project:**

```powershell
cd $HOME\Documents\cloudflare-projects\my-first-worker
```

**Create an R2 bucket to store images:**

```powershell
npx wrangler r2 bucket create my-images
```

You should see: `✅ Created bucket 'my-images'`

---

## Step 2: Connect R2 to Your Worker

**Open VS Code:**
```powershell
code .
```

**Open `wrangler.jsonc` and replace ALL content with:**

```json
{
	"name": "my-first-worker",
	"main": "src/index.js",
	"compatibility_date": "2025-12-02",
	"observability": {
		"enabled": true
	},
	"r2_buckets": [
		{
			"bucket_name": "my-images",
			"binding": "IMAGES"
		}
	]
}
```

**Save the file (Ctrl + S)**

---

## Step 3: Create the Image Gallery Code

**Open `src/index.js` and replace ALL the code with:**

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Home page - show image gallery
    if (url.pathname === "/") {
      return showGallery(env);
    }

    // Upload image
    if (url.pathname === "/upload" && request.method === "POST") {
      return uploadImage(request, env);
    }

    // Serve an image
    if (url.pathname.startsWith("/image/")) {
      return serveImage(url.pathname, env);
    }

    return new Response("Not found", { status: 404 });
  }
};

// Show the image gallery page
async function showGallery(env) {
  // Get list of images from R2
  const list = await env.IMAGES.list();
  
  // Create image HTML
  let imagesHtml = "";
  if (list.objects.length === 0) {
    imagesHtml = "<p>No images yet. Upload some!</p>";
  } else {
    for (const obj of list.objects) {
      imagesHtml += `
        <div class="image-card">
          <img src="/image/${obj.key}" alt="${obj.key}">
          <p>${obj.key}</p>
        </div>
      `;
    }
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>My Image Gallery</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 {
      color: #333;
      text-align: center;
    }
    .upload-form {
      background: white;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      text-align: center;
    }
    .upload-form input[type="file"] {
      margin: 10px;
    }
    .upload-form button {
      background: #f38020;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }
    .upload-form button:hover {
      background: #e06f10;
    }
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }
    .image-card {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .image-card img {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }
    .image-card p {
      padding: 10px;
      margin: 0;
      font-size: 12px;
      color: #666;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <h1>🖼️ My Image Gallery</h1>
  
  <div class="upload-form">
    <h3>Upload a New Image</h3>
    <form action="/upload" method="POST" enctype="multipart/form-data">
      <input type="file" name="image" accept="image/*" required>
      <button type="submit">Upload</button>
    </form>
  </div>

  <div class="gallery">
    ${imagesHtml}
  </div>
</body>
</html>
  `;

  return new Response(html, {
    headers: { "content-type": "text/html" }
  });
}

// Upload an image to R2
async function uploadImage(request, env) {
  const formData = await request.formData();
  const file = formData.get("image");

  if (!file) {
    return new Response("No file uploaded", { status: 400 });
  }

  // Create a unique filename
  const filename = Date.now() + "-" + file.name;

  // Save to R2
  await env.IMAGES.put(filename, file.stream(), {
    httpMetadata: { contentType: file.type }
  });

  // Redirect back to gallery
  return Response.redirect(new URL("/", request.url).toString(), 302);
}

// Serve an image from R2
async function serveImage(pathname, env) {
  const key = pathname.replace("/image/", "");
  const object = await env.IMAGES.get(key);

  if (!object) {
    return new Response("Image not found", { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType || "image/jpeg"
    }
  });
}
```

**Save the file (Ctrl + S)**

---

## Step 4: Test Your Image Gallery

**In PowerShell, run:**
```powershell
npm run dev
```

**Open your browser:**
```
http://localhost:8787
```

**Try it:**
1. Click "Choose File" and select an image from your computer
2. Click "Upload"
3. See your image appear in the gallery!
4. Upload more images

---

## Step 5: Deploy Your Gallery

**Stop the local server** (press Ctrl + C)

**Deploy to the internet:**
```powershell
npm run deploy
```

**Open the URL shown** - your image gallery is now live!

---

## Step 6: Upload Images via Command Line (Optional)

You can also upload images using PowerShell:

```powershell
npx wrangler r2 object put my-images/photo1.jpg --file="C:\Users\YourName\Pictures\photo.jpg" --remote
```

Then refresh your gallery to see the new image!

---

## ✅ What You Learned

| Skill | ✓ |
|-------|---|
| Create R2 storage bucket | ☐ |
| Connect R2 to Worker | ☐ |
| Upload files to R2 | ☐ |
| Display images from R2 | ☐ |
| Build an image gallery | ☐ |

---

## Quick Reference

| Command | What It Does |
|---------|--------------|
| `npx wrangler r2 bucket create name` | Create a bucket |
| `npx wrangler r2 bucket list` | List all buckets |
| `npx wrangler r2 object put bucket/file --file=path --remote` | Upload file |
| `npx wrangler r2 object list bucket --remote` | List files in bucket |

---

## Next Module

**Great!** You've built an image gallery with R2 storage!

**Next:** [Module 4: AI Chatbot →](./04-ai-chatbot.md)
