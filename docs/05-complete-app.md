# Module 5: Complete App - All-in-One

This module combines everything from Modules 02-04 into one complete app with navigation!

**Time needed: 15 minutes**

---

## What You Get

A complete app combining all workshop modules:

| Feature | From Module | Description |
|---------|-------------|-------------|
| **Profile Page** | Module 02 | Personal Linktree-style profile |
| **Photo Gallery** | Module 03 | R2 image storage with captions |
| **AI Chat** | Module 04 | Multi-model chatbot |
| **Image Generator** | Module 04 | Text-to-image AI |

**All apps accessible from one navigation menu!**

---

## Option A: Quick Deploy (Fastest)

### Step 1: Clone the Project

**Open PowerShell:**

```powershell
cd $HOME\Documents\cloudflare-projects
```

```powershell
git clone https://github.com/pongpisit/cloudflare-workers-workshop.git
```

```powershell
cd cloudflare-workers-workshop/complete-app
```

### Step 2: Install Dependencies

```powershell
npm install
```

### Step 3: Create R2 Bucket

```powershell
npx wrangler r2 bucket create my-app-media
```

### Step 4: Deploy

```powershell
npm run deploy
```

**Done!** Open the URL shown and enjoy your app!

---

## Option B: Create From Scratch (Learn More)

### Step 1: Create New Project

```powershell
cd $HOME\Documents\cloudflare-projects
```

```powershell
npm create cloudflare@latest -- my-complete-app
```

**Answer the questions:**
- Start with → Hello World example
- Template → Worker only
- Language → JavaScript
- Git → no
- Deploy → no

```powershell
cd my-complete-app
```

### Step 2: Create R2 Bucket

```powershell
npx wrangler r2 bucket create my-app-media
```

### Step 3: Update Configuration

**Open VS Code:**
```powershell
code .
```

**File to edit: `wrangler.jsonc`**

This file is in the root of your project folder.

**Delete everything in the file and paste this code:**

```json
{
  "name": "my-complete-app",
  "main": "src/index.js",
  "compatibility_date": "2024-11-01",
  "ai": {
    "binding": "AI"
  },
  "r2_buckets": [
    {
      "binding": "MEDIA",
      "bucket_name": "my-app-media"
    }
  ]
}
```

**Save (Ctrl + S)**

### Step 4: Add the Complete Code

**File to edit: `src/index.js`**

This file is inside the `src` folder.

**Delete everything in the file and paste this code:**

> **Note:** The complete code is available in the `complete-app/src/index.js` file in the workshop repository. You can copy it from there or from below.

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ===== PAGE ROUTES =====
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(getHomePage(), { headers: { "content-type": "text/html" } });
    }
    if (url.pathname === "/profile") {
      return new Response(getProfilePage(), { headers: { "content-type": "text/html" } });
    }
    if (url.pathname === "/gallery") {
      return new Response(getGalleryPage(), { headers: { "content-type": "text/html" } });
    }
    if (url.pathname === "/chat") {
      return new Response(getChatPage(), { headers: { "content-type": "text/html" } });
    }
    if (url.pathname === "/image-gen") {
      return new Response(getImageGenPage(), { headers: { "content-type": "text/html" } });
    }

    // ===== API ROUTES =====
    
    // AI Chat API
    if (url.pathname === "/api/chat" && request.method === "POST") {
      const { message, model } = await request.json();
      try {
        const response = await env.AI.run(model || "@cf/meta/llama-3.1-8b-instruct", {
          messages: [
            { role: "system", content: "You are a helpful assistant. Keep answers short and clear." },
            { role: "user", content: message }
          ]
        });
        return Response.json({ reply: response.response, model });
      } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
      }
    }

    // Image Generation API
    if (url.pathname === "/api/generate-image" && request.method === "POST") {
      const { prompt } = await request.json();
      try {
        const response = await env.AI.run("@cf/stabilityai/stable-diffusion-xl-base-1.0", {
          prompt: prompt
        });
        return new Response(response, { headers: { "content-type": "image/png" } });
      } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
      }
    }

    // Upload media
    if (url.pathname === "/api/upload" && request.method === "POST") {
      const formData = await request.formData();
      const file = formData.get("file");
      const caption = formData.get("caption") || "";
      if (!file) return Response.json({ error: "No file" }, { status: 400 });
      
      const filename = Date.now() + "-" + file.name;
      await env.MEDIA.put(filename, file.stream(), {
        httpMetadata: { contentType: file.type },
        customMetadata: { caption: caption }
      });
      return Response.json({ success: true, filename });
    }

    // List media
    if (url.pathname === "/api/media" && request.method === "GET") {
      const list = await env.MEDIA.list();
      const files = await Promise.all(list.objects.map(async (o) => {
        const obj = await env.MEDIA.head(o.key);
        return { 
          name: o.key, 
          url: "/media/" + o.key,
          caption: obj?.customMetadata?.caption || ""
        };
      }));
      return Response.json(files);
    }

    // Delete media
    if (url.pathname.startsWith("/api/delete/") && request.method === "POST") {
      const filename = url.pathname.replace("/api/delete/", "");
      await env.MEDIA.delete(filename);
      return Response.json({ success: true });
    }

    // Serve media files
    if (url.pathname.startsWith("/media/")) {
      const file = await env.MEDIA.get(url.pathname.replace("/media/", ""));
      if (!file) return new Response("Not found", { status: 404 });
      return new Response(file.body, {
        headers: { "content-type": file.httpMetadata?.contentType || "application/octet-stream" }
      });
    }

    return new Response("Not found", { status: 404 });
  }
};

// ===== SHARED STYLES =====
const NAV_STYLE = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #0f172a; color: white; min-height: 100vh; }
  nav { background: #1e293b; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
  .logo { font-size: 20px; font-weight: bold; color: #f97316; text-decoration: none; }
  .nav-links { display: flex; gap: 5px; flex-wrap: wrap; }
  .nav-links a { color: #94a3b8; text-decoration: none; padding: 8px 15px; border-radius: 8px; font-size: 14px; }
  .nav-links a:hover { background: #334155; color: white; }
  .nav-links a.active { background: #f97316; color: white; }
  .container { max-width: 800px; margin: 0 auto; padding: 20px; }
  h1 { margin-bottom: 10px; }
  .subtitle { color: #64748b; margin-bottom: 30px; }
`;

function getNavHtml(active) {
  return `
  <nav>
    <a href="/" class="logo">My App</a>
    <div class="nav-links">
      <a href="/" class="${active === 'home' ? 'active' : ''}">Home</a>
      <a href="/profile" class="${active === 'profile' ? 'active' : ''}">Profile</a>
      <a href="/gallery" class="${active === 'gallery' ? 'active' : ''}">Gallery</a>
      <a href="/chat" class="${active === 'chat' ? 'active' : ''}">AI Chat</a>
      <a href="/image-gen" class="${active === 'image-gen' ? 'active' : ''}">Image Gen</a>
    </div>
  </nav>`;
}

// ===== PAGE FUNCTIONS =====
// Each page is a function that returns HTML
// See complete-app/src/index.js for full implementation

function getHomePage() {
  return `<!DOCTYPE html>
<html><head><title>My Complete App</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>${NAV_STYLE}
  .hero { text-align: center; padding: 60px 20px; }
  .hero h1 { font-size: 48px; margin-bottom: 20px; }
  .hero p { font-size: 20px; color: #64748b; margin-bottom: 40px; }
  .apps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; max-width: 800px; margin: 0 auto; padding: 0 20px; }
  .app-card { background: #1e293b; border-radius: 12px; padding: 25px; text-align: center; text-decoration: none; color: white; transition: transform 0.2s; }
  .app-card:hover { transform: translateY(-5px); }
  .app-card .icon { font-size: 40px; margin-bottom: 15px; font-weight: bold; color: #f97316; }
  .app-card h3 { margin-bottom: 10px; }
  .app-card p { color: #64748b; font-size: 14px; }
  .module-tag { background: #334155; padding: 4px 8px; border-radius: 4px; font-size: 11px; color: #94a3b8; margin-top: 10px; display: inline-block; }
</style></head>
<body>
  ${getNavHtml('home')}
  <div class="hero">
    <h1>Welcome!</h1>
    <p>Your complete Cloudflare Workers app</p>
  </div>
  <div class="apps">
    <a href="/profile" class="app-card"><div class="icon">01</div><h3>Profile</h3><p>Personal page</p><span class="module-tag">Module 02</span></a>
    <a href="/gallery" class="app-card"><div class="icon">02</div><h3>Gallery</h3><p>Photo gallery</p><span class="module-tag">Module 03</span></a>
    <a href="/chat" class="app-card"><div class="icon">03</div><h3>AI Chat</h3><p>Multi-model chat</p><span class="module-tag">Module 04</span></a>
    <a href="/image-gen" class="app-card"><div class="icon">04</div><h3>Image Gen</h3><p>Text to image</p><span class="module-tag">Module 04</span></a>
  </div>
</body></html>`;
}

function getProfilePage() {
  return `<!DOCTYPE html>
<html><head><title>My Profile</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>${NAV_STYLE}
  .profile { max-width: 400px; margin: 40px auto; text-align: center; padding: 0 20px; }
  .avatar { width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, #f97316, #ec4899); margin: 0 auto 20px; }
  .name { font-size: 28px; margin-bottom: 5px; }
  .bio { color: #64748b; margin-bottom: 30px; }
  .links { display: flex; flex-direction: column; gap: 12px; }
  .link { background: #1e293b; padding: 15px 20px; border-radius: 10px; color: white; text-decoration: none; display: flex; align-items: center; gap: 12px; }
  .link:hover { background: #334155; }
  .link-icon { font-size: 14px; background: #334155; padding: 5px 8px; border-radius: 4px; }
</style></head>
<body>
  ${getNavHtml('profile')}
  <div class="profile">
    <div class="avatar"></div>
    <h1 class="name">Your Name</h1>
    <p class="bio">Developer | Creator | Learner</p>
    <div class="links">
      <a href="https://github.com" class="link" target="_blank"><span class="link-icon">GH</span> GitHub</a>
      <a href="https://twitter.com" class="link" target="_blank"><span class="link-icon">TW</span> Twitter</a>
      <a href="https://linkedin.com" class="link" target="_blank"><span class="link-icon">LI</span> LinkedIn</a>
      <a href="mailto:you@example.com" class="link"><span class="link-icon">EM</span> Email Me</a>
    </div>
  </div>
</body></html>`;
}

// getGalleryPage(), getChatPage(), getImageGenPage() - see complete-app/src/index.js
```

**The full code is too long to display here. Copy the complete code from:**
- `complete-app/src/index.js` in the workshop repository

**Save (Ctrl + S)**

### Step 5: Test Locally

```powershell
npm run dev -- --remote
```

**Open:** http://localhost:8787

### Step 6: Deploy

**Stop server (Ctrl + C), then:**

```powershell
npm run deploy
```

**Done!**

---

## What's Included

| Page | Route | Features |
|------|-------|----------|
| **Home** | `/` | Navigation hub with links to all apps |
| **Profile** | `/profile` | Linktree-style personal page (Module 02) |
| **Gallery** | `/gallery` | Photo upload with captions, R2 storage (Module 03) |
| **AI Chat** | `/chat` | Multi-model chatbot (Module 04) |
| **Image Gen** | `/image-gen` | Text-to-image AI generation (Module 04) |

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Send message to AI model |
| `/api/generate-image` | POST | Generate image from text |
| `/api/upload` | POST | Upload photo with caption |
| `/api/media` | GET | List all photos |
| `/api/delete/:filename` | POST | Delete a photo |
| `/media/:filename` | GET | Serve photo file |

---

## Customization Ideas

### Change Your Profile

**File to edit: `src/index.js`**

Find `PROFILE_PAGE` and update:
- Your name
- Your bio
- Your social links

### Add More AI Models

Find the `CHAT_PAGE` section and add more model buttons:
```html
<button class="model-btn" data-model="@cf/google/gemma-7b-it-lora">Gemma 7B</button>
```

### Change the App Name

In `wrangler.jsonc`, change:
```json
"name": "my-complete-app"
```

### Change Colors

Find the CSS and change `#f97316` (orange) to your color:
```css
.nav-links a.active { background: #3b82f6; } /* Blue */
```

---

## Troubleshooting

### "Bucket not found"

Make sure you created the bucket:
```powershell
npx wrangler r2 bucket create my-app-media
```

### "AI error"

Make sure you're using `--remote` flag:
```powershell
npm run dev -- --remote
```

### "Not logged in"

Run:
```powershell
wrangler login
```

---

## Checklist

| Step | Done |
|------|------|
| Clone or create project | |
| Create R2 bucket | |
| Update wrangler.jsonc | |
| Add the code to src/index.js | |
| Test locally with `--remote` | |
| Test all 5 pages work | |
| Deploy | |

---

## Congratulations!

You now have a complete Cloudflare app combining everything from the workshop:

| Feature | Module | Status |
|---------|--------|--------|
| Profile Page | Module 02 | Included |
| Photo Gallery with R2 | Module 03 | Included |
| AI Chatbot | Module 04 | Included |
| Image Generation | Module 04 | Included |
| Navigation between apps | Module 05 | New! |

**Share your app URL with everyone!**

---

## Quick Reference

| Command | What It Does |
|---------|--------------|
| `npm run dev -- --remote` | Run locally with AI |
| `npm run deploy` | Deploy to internet |
| `wrangler tail` | View live logs |
| `npx wrangler r2 bucket list` | List your buckets |

---

## Thank You!

Thank you for completing this workshop!

**Workshop Repository:** https://github.com/pongpisit/cloudflare-workers-workshop
