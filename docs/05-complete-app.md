# Module 5: Complete App - Clone and Deploy

Want everything in one app? Just clone this code and deploy!

**Time needed: 10 minutes**

---

## What You Get

A complete app with:
- Image Gallery (R2 storage)
- AI Chatbot (multiple models)
- Beautiful UI
- Ready to deploy

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

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Home page
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(HTML_PAGE, { headers: { "content-type": "text/html" } });
    }

    // AI Chat
    if (url.pathname === "/chat" && request.method === "POST") {
      const { message, model } = await request.json();
      try {
        const response = await env.AI.run(model || "@cf/meta/llama-3.1-8b-instruct", {
          messages: [
            { role: "system", content: "You are a helpful assistant. Keep answers short." },
            { role: "user", content: message }
          ]
        });
        return Response.json({ reply: response.response, model });
      } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
      }
    }

    // Upload media
    if (url.pathname === "/upload" && request.method === "POST") {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!file) return Response.json({ error: "No file" }, { status: 400 });
      
      const filename = Date.now() + "-" + file.name;
      await env.MEDIA.put(filename, file.stream(), {
        httpMetadata: { contentType: file.type }
      });
      return Response.json({ success: true, url: "/media/" + filename });
    }

    // List media
    if (url.pathname === "/media" && request.method === "GET") {
      const list = await env.MEDIA.list();
      return Response.json(list.objects.map(o => ({ name: o.key, url: "/media/" + o.key })));
    }

    // Serve media
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

const HTML_PAGE = `<!DOCTYPE html>
<html>
<head>
  <title>My Cloudflare App</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #0f172a; color: white; min-height: 100vh; }
    .container { max-width: 900px; margin: 0 auto; padding: 20px; }
    h1 { text-align: center; margin-bottom: 10px; }
    .subtitle { text-align: center; color: #64748b; margin-bottom: 30px; }
    
    /* Tabs */
    .tabs { display: flex; gap: 10px; margin-bottom: 20px; }
    .tab { flex: 1; padding: 15px; background: #1e293b; border: none; color: #94a3b8; border-radius: 10px; cursor: pointer; font-size: 16px; }
    .tab:hover { background: #334155; }
    .tab.active { background: #f97316; color: white; }
    
    /* Panels */
    .panel { display: none; }
    .panel.active { display: block; }
    
    /* Chat */
    .chat-box { background: #1e293b; border-radius: 10px; overflow: hidden; }
    .messages { height: 300px; overflow-y: auto; padding: 15px; }
    .msg { margin-bottom: 10px; padding: 10px 15px; border-radius: 10px; max-width: 80%; }
    .user { background: #f97316; margin-left: auto; }
    .bot { background: #334155; }
    .model-tag { font-size: 10px; color: #64748b; margin-top: 5px; }
    .chat-input { display: flex; gap: 10px; padding: 15px; background: #0f172a; }
    .chat-input input { flex: 1; padding: 12px; border: none; border-radius: 8px; background: #334155; color: white; }
    .chat-input button { padding: 12px 20px; background: #f97316; color: white; border: none; border-radius: 8px; cursor: pointer; }
    
    /* Model selector */
    .models { display: flex; flex-wrap: wrap; gap: 8px; padding: 15px; background: #0f172a; }
    .model-btn { padding: 8px 12px; background: #334155; border: 2px solid transparent; color: #94a3b8; border-radius: 6px; cursor: pointer; font-size: 12px; }
    .model-btn:hover { border-color: #f97316; }
    .model-btn.active { background: #f97316; color: white; }
    
    /* Gallery */
    .upload-area { background: #1e293b; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px; }
    .upload-area input { margin: 10px; }
    .upload-btn { padding: 10px 20px; background: #f97316; color: white; border: none; border-radius: 8px; cursor: pointer; }
    .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; }
    .gallery-item { background: #1e293b; border-radius: 10px; overflow: hidden; }
    .gallery-item img, .gallery-item video { width: 100%; height: 120px; object-fit: cover; }
    .gallery-item p { padding: 8px; font-size: 11px; color: #64748b; word-break: break-all; }
    .empty { color: #64748b; text-align: center; padding: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>My Cloudflare App</h1>
    <p class="subtitle">AI Chat + Image Gallery</p>
    
    <div class="tabs">
      <button class="tab active" onclick="showTab('chat')">AI Chat</button>
      <button class="tab" onclick="showTab('gallery')">Gallery</button>
    </div>
    
    <!-- Chat Panel -->
    <div id="chat" class="panel active">
      <div class="chat-box">
        <div class="models">
          <button class="model-btn active" data-model="@cf/meta/llama-3.1-8b-instruct">Llama 3.1 8B</button>
          <button class="model-btn" data-model="@cf/meta/llama-3.2-3b-instruct">Llama 3.2 3B</button>
          <button class="model-btn" data-model="@cf/meta/llama-3.2-1b-instruct">Llama 3.2 1B</button>
          <button class="model-btn" data-model="@cf/mistral/mistral-7b-instruct-v0.1">Mistral 7B</button>
          <button class="model-btn" data-model="@cf/google/gemma-7b-it-lora">Gemma 7B</button>
        </div>
        <div class="messages" id="messages">
          <div class="msg bot">Hello! Choose a model and start chatting!</div>
        </div>
        <div class="chat-input">
          <input type="text" id="chatInput" placeholder="Type a message..." onkeypress="if(event.key==='Enter')sendChat()">
          <button onclick="sendChat()">Send</button>
        </div>
      </div>
    </div>
    
    <!-- Gallery Panel -->
    <div id="gallery" class="panel">
      <div class="upload-area">
        <h3>Upload Image or Video</h3>
        <input type="file" id="fileInput" accept="image/*,video/*">
        <button class="upload-btn" onclick="uploadFile()">Upload</button>
      </div>
      <div class="gallery" id="galleryGrid"></div>
    </div>
  </div>

  <script>
    let currentModel = "@cf/meta/llama-3.1-8b-instruct";
    
    // Tab switching
    function showTab(tab) {
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.getElementById(tab).classList.add('active');
      event.target.classList.add('active');
      if (tab === 'gallery') loadGallery();
    }
    
    // Model selection
    document.querySelectorAll('.model-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentModel = btn.dataset.model;
      };
    });
    
    // Chat
    async function sendChat() {
      const input = document.getElementById('chatInput');
      const messages = document.getElementById('messages');
      const msg = input.value.trim();
      if (!msg) return;
      
      messages.innerHTML += '<div class="msg user">' + msg + '</div>';
      input.value = '';
      messages.innerHTML += '<div class="msg bot" id="typing">Thinking...</div>';
      messages.scrollTop = messages.scrollHeight;
      
      try {
        const res = await fetch('/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, model: currentModel })
        });
        const data = await res.json();
        document.getElementById('typing').remove();
        const modelName = currentModel.split('/').pop();
        messages.innerHTML += '<div class="msg bot">' + (data.reply || data.error) + '<div class="model-tag">' + modelName + '</div></div>';
      } catch (e) {
        document.getElementById('typing').remove();
        messages.innerHTML += '<div class="msg bot">Error: ' + e.message + '</div>';
      }
      messages.scrollTop = messages.scrollHeight;
    }
    
    // Gallery
    async function loadGallery() {
      const grid = document.getElementById('galleryGrid');
      try {
        const res = await fetch('/media');
        const files = await res.json();
        if (files.length === 0) {
          grid.innerHTML = '<div class="empty">No media yet. Upload some!</div>';
          return;
        }
        grid.innerHTML = files.map(f => {
          const isVideo = f.name.match(/\\.(mp4|webm|mov)$/i);
          return '<div class="gallery-item">' + 
            (isVideo ? '<video src="' + f.url + '" controls></video>' : '<img src="' + f.url + '">') +
            '<p>' + f.name + '</p></div>';
        }).join('');
      } catch (e) {
        grid.innerHTML = '<div class="empty">Failed to load gallery</div>';
      }
    }
    
    async function uploadFile() {
      const file = document.getElementById('fileInput').files[0];
      if (!file) return alert('Please select a file');
      
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const res = await fetch('/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          document.getElementById('fileInput').value = '';
          loadGallery();
          alert('Uploaded!');
        }
      } catch (e) {
        alert('Upload failed');
      }
    }
    
    // Load gallery on start
    loadGallery();
  </script>
</body>
</html>`;
```

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

| Feature | How It Works |
|---------|--------------|
| **AI Chat** | Uses Workers AI with 5 models to choose from |
| **Image Upload** | Stores in R2, displays in gallery |
| **Video Upload** | Stores in R2, plays in gallery |
| **Tab Navigation** | Switch between Chat and Gallery |
| **Model Switching** | Click to change AI models |

---

## Customization Ideas

### Change the App Name

In `wrangler.jsonc`, change:
```json
"name": "my-complete-app"
```

### Add More AI Models

Find this section in the HTML and add more buttons:
```html
<button class="model-btn" data-model="@cf/google/gemma-7b-it-lora">Google Gemma</button>
```

### Change Colors

Find the CSS and change `#f97316` (orange) to your color:
```css
.tab.active { background: #3b82f6; } /* Blue */
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
| Test locally | |
| Deploy | |

---

## Congratulations!

You now have a complete Cloudflare app with:
- AI Chatbot with multiple models
- Image and Video Gallery
- Beautiful responsive UI
- Deployed globally on Cloudflare

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

Thank you for completing this workshop! 🙏

**Workshop Repository:** https://github.com/pongpisit/cloudflare-workers-workshop
