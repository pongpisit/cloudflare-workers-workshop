# Module 4: Add Image & Video Storage to Your Chatbot

In this module, you will add image and video sharing to your AI chatbot using R2 storage.

**Time needed: 30 minutes**

---

## What is R2?

R2 is Cloudflare's file storage. You can store images, videos, and any files. Users can upload and share media in your chatbot!

---

## Step 1: Create a Storage Bucket

**Open PowerShell and go to your chatbot project:**

```powershell
cd $HOME\Documents\cloudflare-projects\my-chatbot
```

**Create a storage bucket:**
```powershell
npx wrangler r2 bucket create chatbot-media
```

You should see: `✅ Created bucket 'chatbot-media'`

---

## Step 2: Connect R2 to Your Chatbot

**Open VS Code (if not already open):**
```powershell
code .
```

**Open `wrangler.jsonc` and replace ALL the content with:**

```json
{
  "name": "my-chatbot",
  "main": "src/index.js",
  "compatibility_date": "2024-11-01",
  "ai": {
    "binding": "AI"
  },
  "r2_buckets": [
    {
      "binding": "MEDIA",
      "bucket_name": "chatbot-media"
    }
  ]
}
```

**Save the file (Ctrl + S)**

---

## Step 3: Update Your Chatbot Code

**Open `src/index.js` and replace ALL the code with:**

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Serve the chat page
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(HTML_PAGE, {
        headers: { "content-type": "text/html" }
      });
    }

    // Handle chat messages
    if (url.pathname === "/chat" && request.method === "POST") {
      const { message } = await request.json();

      const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        messages: [
          { 
            role: "system", 
            content: "You are a helpful assistant. Keep your answers short and friendly." 
          },
          { 
            role: "user", 
            content: message 
          }
        ]
      });

      return new Response(JSON.stringify({ 
        reply: response.response 
      }), {
        headers: { "content-type": "application/json" }
      });
    }

    // Upload image/video
    if (url.pathname === "/upload" && request.method === "POST") {
      const formData = await request.formData();
      const file = formData.get("file");
      
      if (!file) {
        return new Response(JSON.stringify({ error: "No file provided" }), { 
          status: 400,
          headers: { "content-type": "application/json" }
        });
      }

      const filename = Date.now() + "-" + file.name;
      await env.MEDIA.put(filename, file.stream(), {
        httpMetadata: { contentType: file.type }
      });

      return new Response(JSON.stringify({ 
        success: true,
        filename: filename,
        url: "/media/" + filename
      }), {
        headers: { "content-type": "application/json" }
      });
    }

    // List all media files
    if (url.pathname === "/media" && request.method === "GET") {
      const list = await env.MEDIA.list();
      const files = list.objects.map(obj => ({
        name: obj.key,
        size: obj.size,
        url: "/media/" + obj.key
      }));
      return new Response(JSON.stringify(files), {
        headers: { "content-type": "application/json" }
      });
    }

    // Serve media files
    if (url.pathname.startsWith("/media/")) {
      const filename = url.pathname.replace("/media/", "");
      const file = await env.MEDIA.get(filename);
      
      if (!file) {
        return new Response("File not found", { status: 404 });
      }
      
      return new Response(file.body, {
        headers: { 
          "content-type": file.httpMetadata?.contentType || "application/octet-stream",
          "cache-control": "public, max-age=31536000"
        }
      });
    }

    return new Response("Not found", { status: 404 });
  }
};

// The chat page HTML with image upload
const HTML_PAGE = `
<!DOCTYPE html>
<html>
<head>
  <title>My AI Chatbot</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .chat-container {
      width: 100%;
      max-width: 600px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .chat-header {
      background: #4a5568;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .chat-header h1 { font-size: 1.5rem; }
    .chat-messages {
      height: 350px;
      overflow-y: auto;
      padding: 20px;
      background: #f7fafc;
    }
    .message {
      margin-bottom: 15px;
      padding: 12px 16px;
      border-radius: 15px;
      max-width: 80%;
      word-wrap: break-word;
    }
    .user-message {
      background: #667eea;
      color: white;
      margin-left: auto;
      border-bottom-right-radius: 5px;
    }
    .bot-message {
      background: white;
      color: #2d3748;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 5px;
    }
    .message img, .message video {
      max-width: 100%;
      border-radius: 10px;
      margin-top: 10px;
    }
    .chat-input {
      display: flex;
      flex-wrap: wrap;
      padding: 15px;
      background: white;
      border-top: 1px solid #e2e8f0;
      gap: 10px;
    }
    .chat-input input[type="text"] {
      flex: 1;
      min-width: 200px;
      padding: 12px;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 16px;
      outline: none;
    }
    .chat-input input[type="text"]:focus {
      border-color: #667eea;
    }
    .chat-input button {
      padding: 12px 20px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      cursor: pointer;
    }
    .chat-input button:hover { background: #5a67d8; }
    .chat-input button:disabled { background: #a0aec0; cursor: not-allowed; }
    .upload-btn {
      background: #48bb78 !important;
    }
    .upload-btn:hover { background: #38a169 !important; }
    .typing { color: #718096; font-style: italic; }
    .media-gallery {
      padding: 10px 20px;
      background: #edf2f7;
      border-top: 1px solid #e2e8f0;
    }
    .media-gallery h3 { font-size: 14px; color: #718096; margin-bottom: 10px; }
    .media-thumbs {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 10px;
    }
    .media-thumbs img, .media-thumbs video {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
      cursor: pointer;
    }
    input[type="file"] { display: none; }
  </style>
</head>
<body>
  <div class="chat-container">
    <div class="chat-header">
      <h1>🤖 My AI Chatbot</h1>
      <p>Chat with AI • Share Images & Videos</p>
    </div>
    <div class="chat-messages" id="messages">
      <div class="message bot-message">
        Hello! I'm your AI assistant. You can chat with me or share images and videos!
      </div>
    </div>
    <div class="media-gallery">
      <h3>📸 Shared Media</h3>
      <div class="media-thumbs" id="mediaThumbs">
        <span style="color:#a0aec0;font-size:12px;">No media shared yet</span>
      </div>
    </div>
    <div class="chat-input">
      <input type="text" id="userInput" placeholder="Type your message..." onkeypress="if(event.key==='Enter')sendMessage()">
      <button onclick="sendMessage()" id="sendBtn">Send</button>
      <input type="file" id="fileInput" accept="image/*,video/*" onchange="uploadFile()">
      <button class="upload-btn" onclick="document.getElementById('fileInput').click()">📷 Upload</button>
    </div>
  </div>

  <script>
    // Load existing media on page load
    loadMedia();

    async function loadMedia() {
      try {
        const response = await fetch('/media');
        const files = await response.json();
        const thumbs = document.getElementById('mediaThumbs');
        
        if (files.length === 0) {
          thumbs.innerHTML = '<span style="color:#a0aec0;font-size:12px;">No media shared yet</span>';
          return;
        }
        
        thumbs.innerHTML = files.map(file => {
          if (file.name.match(/\\.(jpg|jpeg|png|gif|webp)$/i)) {
            return '<img src="' + file.url + '" onclick="showInChat(\\'' + file.url + '\\', \\'image\\')" title="' + file.name + '">';
          } else if (file.name.match(/\\.(mp4|webm|mov)$/i)) {
            return '<video src="' + file.url + '" onclick="showInChat(\\'' + file.url + '\\', \\'video\\')" title="' + file.name + '"></video>';
          }
          return '';
        }).join('');
      } catch (e) {
        console.error('Failed to load media:', e);
      }
    }

    function showInChat(url, type) {
      const messages = document.getElementById('messages');
      if (type === 'image') {
        messages.innerHTML += '<div class="message user-message"><img src="' + url + '"></div>';
      } else {
        messages.innerHTML += '<div class="message user-message"><video src="' + url + '" controls></video></div>';
      }
      messages.scrollTop = messages.scrollHeight;
    }

    async function uploadFile() {
      const fileInput = document.getElementById('fileInput');
      const file = fileInput.files[0];
      if (!file) return;

      const messages = document.getElementById('messages');
      messages.innerHTML += '<div class="message bot-message typing">Uploading ' + file.name + '...</div>';
      messages.scrollTop = messages.scrollHeight;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/upload', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        
        // Remove uploading message
        const typingMsg = document.querySelector('.typing');
        if (typingMsg) typingMsg.remove();

        if (data.success) {
          // Show uploaded file in chat
          if (file.type.startsWith('image/')) {
            messages.innerHTML += '<div class="message user-message"><img src="' + data.url + '"></div>';
          } else {
            messages.innerHTML += '<div class="message user-message"><video src="' + data.url + '" controls></video></div>';
          }
          messages.innerHTML += '<div class="message bot-message">Nice! I received your ' + (file.type.startsWith('image/') ? 'image' : 'video') + '! 📸</div>';
          
          // Refresh media gallery
          loadMedia();
        }
      } catch (error) {
        const typingMsg = document.querySelector('.typing');
        if (typingMsg) typingMsg.remove();
        messages.innerHTML += '<div class="message bot-message">Sorry, upload failed. Please try again.</div>';
      }

      fileInput.value = '';
      messages.scrollTop = messages.scrollHeight;
    }

    async function sendMessage() {
      const input = document.getElementById('userInput');
      const messages = document.getElementById('messages');
      const sendBtn = document.getElementById('sendBtn');
      const message = input.value.trim();
      
      if (!message) return;
      
      messages.innerHTML += '<div class="message user-message">' + message + '</div>';
      input.value = '';
      messages.innerHTML += '<div class="message bot-message typing" id="typing">Thinking...</div>';
      messages.scrollTop = messages.scrollHeight;
      sendBtn.disabled = true;
      
      try {
        const response = await fetch('/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
        const data = await response.json();
        document.getElementById('typing').remove();
        messages.innerHTML += '<div class="message bot-message">' + data.reply + '</div>';
      } catch (error) {
        document.getElementById('typing').remove();
        messages.innerHTML += '<div class="message bot-message">Sorry, something went wrong.</div>';
      }
      
      sendBtn.disabled = false;
      messages.scrollTop = messages.scrollHeight;
    }
  </script>
</body>
</html>
`;
```

**Save the file (Ctrl + S)**

---

## Step 4: Test Your Updated Chatbot

**In PowerShell, run:**
```powershell
npm run dev -- --remote
```

**Open your browser:**
```
http://localhost:8787
```

**Try these features:**
1. **Chat with AI** - Type a message and press Enter
2. **Upload an image** - Click the 📷 Upload button
3. **Upload a video** - Click Upload and select a video file
4. **View shared media** - See thumbnails in the gallery
5. **Click a thumbnail** - Shows it in the chat

---

## Step 5: Deploy Your Complete Chatbot

**Stop the local server** (press Ctrl + C)

**Deploy:**
```powershell
npm run deploy
```

**Your chatbot with media sharing is now live!**

---

## ✅ What You Learned

| Skill | ✓ |
|-------|---|
| Create R2 storage bucket | ☐ |
| Upload images and videos | ☐ |
| Display media in chat | ☐ |
| Build a media gallery | ☐ |
| Combine AI + Storage | ☐ |

---

## Quick Reference

| What You Want to Do | Command |
|---------------------|---------|
| Create a bucket | `npx wrangler r2 bucket create bucket-name` |
| List buckets | `npx wrangler r2 bucket list` |
| Delete a bucket | `npx wrangler r2 bucket delete bucket-name` |

---

## Next Module

**Amazing!** You've built a complete AI chatbot with media sharing!

**Next:** [Module 5: Deploy to Production →](./05-deploy.md)
