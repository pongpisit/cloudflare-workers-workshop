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
        httpMetadata: { contentType: file.type }
      });
      
      // Store caption in D1
      await env.my_app_db.prepare("INSERT INTO photos (filename, caption) VALUES (?, ?)")
        .bind(filename, caption)
        .run();
      
      return Response.json({ success: true, filename });
    }

    // List media
    if (url.pathname === "/api/media" && request.method === "GET") {
      const { results } = await env.my_app_db.prepare(
        "SELECT * FROM photos ORDER BY created_at DESC"
      ).all();
      
      const files = results.map(photo => ({
        id: photo.id,
        name: photo.filename,
        url: "/media/" + photo.filename,
        caption: photo.caption || ""
      }));
      return Response.json(files);
    }

    // Delete media
    if (url.pathname.startsWith("/api/delete/") && request.method === "POST") {
      const filename = url.pathname.replace("/api/delete/", "");
      await env.MEDIA.delete(filename);
      await env.my_app_db.prepare("DELETE FROM photos WHERE filename = ?").bind(filename).run();
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
  body { font-family: system-ui, sans-serif; background: #000000; color: #FFFFFF; min-height: 100vh; }
  nav { background: #1a1a1a; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; border-bottom: 2px solid #F6821F; }
  .logo { font-size: 20px; font-weight: bold; color: #F6821F; text-decoration: none; }
  .nav-links { display: flex; gap: 5px; flex-wrap: wrap; }
  .nav-links a { color: #999999; text-decoration: none; padding: 8px 15px; border-radius: 8px; font-size: 14px; }
  .nav-links a:hover { background: #333333; color: #FFFFFF; }
  .nav-links a.active { background: #F6821F; color: #FFFFFF; }
  .container { max-width: 800px; margin: 0 auto; padding: 20px; }
  h1 { margin-bottom: 10px; color: #FFFFFF; }
  .subtitle { color: #999999; margin-bottom: 30px; }
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

// ===== HOME PAGE =====
function getHomePage() {
  return `<!DOCTYPE html>
<html><head><title>My Complete App</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  ${NAV_STYLE}
  .hero { text-align: center; padding: 60px 20px; }
  .hero h1 { font-size: 48px; margin-bottom: 20px; color: #FFFFFF; }
  .hero p { font-size: 20px; color: #999999; margin-bottom: 40px; }
  .apps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; max-width: 800px; margin: 0 auto; padding: 0 20px; }
  .app-card { background: #1a1a1a; border-radius: 12px; padding: 25px; text-align: center; text-decoration: none; color: #FFFFFF; transition: transform 0.2s, box-shadow 0.2s; border: 1px solid #333333; }
  .app-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(246,130,31,0.2); border-color: #F6821F; }
  .app-card .icon { font-size: 40px; margin-bottom: 15px; font-weight: bold; color: #F6821F; }
  .app-card h3 { margin-bottom: 10px; color: #FFFFFF; }
  .app-card p { color: #999999; font-size: 14px; }
  .module-tag { background: #333333; padding: 4px 8px; border-radius: 4px; font-size: 11px; color: #FBAD41; margin-top: 10px; display: inline-block; }
</style></head>
<body>
  ${getNavHtml('home')}
  <div class="hero">
    <h1>Welcome!</h1>
    <p>Your complete Cloudflare Workers app</p>
  </div>
  <div class="apps">
    <a href="/profile" class="app-card">
      <div class="icon">01</div>
      <h3>Profile</h3>
      <p>Personal Linktree-style page</p>
      <span class="module-tag">Module 02</span>
    </a>
    <a href="/gallery" class="app-card">
      <div class="icon">02</div>
      <h3>Gallery</h3>
      <p>Photo gallery with R2 storage</p>
      <span class="module-tag">Module 03</span>
    </a>
    <a href="/chat" class="app-card">
      <div class="icon">03</div>
      <h3>AI Chat</h3>
      <p>Chat with multiple AI models</p>
      <span class="module-tag">Module 04</span>
    </a>
    <a href="/image-gen" class="app-card">
      <div class="icon">04</div>
      <h3>Image Gen</h3>
      <p>Generate images from text</p>
      <span class="module-tag">Module 04</span>
    </a>
  </div>
</body></html>`;
}

// ===== PROFILE PAGE (Module 02) =====
function getProfilePage() {
  return `<!DOCTYPE html>
<html><head><title>My Profile</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  ${NAV_STYLE}
  .profile { max-width: 400px; margin: 40px auto; text-align: center; padding: 0 20px; }
  .avatar { width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, #FF6633, #F6821F, #FBAD41); margin: 0 auto 20px; }
  .name { font-size: 28px; margin-bottom: 5px; color: #FFFFFF; }
  .bio { color: #999999; margin-bottom: 30px; }
  .links { display: flex; flex-direction: column; gap: 12px; }
  .link { background: #1a1a1a; padding: 15px 20px; border-radius: 10px; color: #FFFFFF; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: all 0.2s; border: 1px solid #333333; }
  .link:hover { background: #333333; border-color: #F6821F; }
  .link-icon { font-size: 14px; background: #F6821F; color: #FFFFFF; padding: 5px 8px; border-radius: 4px; }
</style></head>
<body>
  ${getNavHtml('profile')}
  <div class="profile">
    <div class="avatar"></div>
    <h1 class="name">Your Name</h1>
    <p class="bio">Developer | Creator | Learner</p>
    <div class="links">
      <a href="https://github.com" class="link" target="_blank">
        <span class="link-icon">GH</span> GitHub
      </a>
      <a href="https://twitter.com" class="link" target="_blank">
        <span class="link-icon">TW</span> Twitter
      </a>
      <a href="https://linkedin.com" class="link" target="_blank">
        <span class="link-icon">LI</span> LinkedIn
      </a>
      <a href="mailto:you@example.com" class="link">
        <span class="link-icon">EM</span> Email Me
      </a>
    </div>
  </div>
</body></html>`;
}

// ===== GALLERY PAGE (Module 03) =====
function getGalleryPage() {
  return `<!DOCTYPE html>
<html><head><title>Photo Gallery</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  ${NAV_STYLE}
  .upload-box { background: #1a1a1a; border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #333333; }
  .upload-box h3 { margin-bottom: 15px; color: #FFFFFF; }
  .upload-form { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
  .upload-form input[type="file"] { flex: 1; min-width: 200px; color: #FFFFFF; }
  .upload-form input[type="text"] { flex: 2; min-width: 200px; padding: 10px; border: 1px solid #333333; border-radius: 8px; background: #000000; color: #FFFFFF; }
  .upload-form input[type="text"]:focus { border-color: #F6821F; outline: none; }
  .upload-btn { padding: 10px 25px; background: #F6821F; color: #FFFFFF; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
  .upload-btn:hover { background: #FF6633; }
  .upload-btn:disabled { background: #333333; color: #666666; }
  .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
  .photo-card { background: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #333333; }
  .photo-card img { width: 100%; height: 200px; object-fit: cover; }
  .photo-info { padding: 15px; }
  .photo-caption { margin-bottom: 10px; color: #FFFFFF; }
  .delete-btn { background: none; border: none; color: #FF6633; cursor: pointer; font-size: 12px; }
  .delete-btn:hover { text-decoration: underline; }
  .empty { text-align: center; padding: 60px; color: #999999; }
</style></head>
<body>
  ${getNavHtml('gallery')}
  <div class="container">
    <h1>Photo Gallery</h1>
    <p class="subtitle">Upload and share your photos (stored in R2)</p>
    
    <div class="upload-box">
      <h3>Upload New Photo</h3>
      <div class="upload-form">
        <input type="file" id="fileInput" accept="image/*">
        <input type="text" id="captionInput" placeholder="Add a caption...">
        <button class="upload-btn" onclick="uploadPhoto()" id="uploadBtn">Upload</button>
      </div>
    </div>
    
    <div class="gallery" id="gallery"></div>
  </div>
  <script>
    async function loadGallery() {
      const gallery = document.getElementById('gallery');
      try {
        const res = await fetch('/api/media');
        const photos = await res.json();
        if (photos.length === 0) {
          gallery.innerHTML = '<div class="empty">No photos yet. Upload your first photo!</div>';
          return;
        }
        gallery.innerHTML = photos.map(p => 
          '<div class="photo-card">' +
            '<img src="' + p.url + '" alt="">' +
            '<div class="photo-info">' +
              '<p class="photo-caption">' + (p.caption || 'No caption') + '</p>' +
              '<button class="delete-btn" onclick="deletePhoto(\\'' + p.name + '\\')">Delete</button>' +
            '</div>' +
          '</div>'
        ).join('');
      } catch (e) {
        gallery.innerHTML = '<div class="empty">Failed to load photos</div>';
      }
    }
    
    async function uploadPhoto() {
      const file = document.getElementById('fileInput').files[0];
      const caption = document.getElementById('captionInput').value;
      const btn = document.getElementById('uploadBtn');
      if (!file) return alert('Please select a photo');
      
      btn.disabled = true;
      btn.textContent = 'Uploading...';
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caption', caption);
      
      try {
        await fetch('/api/upload', { method: 'POST', body: formData });
        document.getElementById('fileInput').value = '';
        document.getElementById('captionInput').value = '';
        loadGallery();
      } catch (e) {
        alert('Upload failed');
      }
      btn.disabled = false;
      btn.textContent = 'Upload';
    }
    
    async function deletePhoto(name) {
      if (!confirm('Delete this photo?')) return;
      await fetch('/api/delete/' + name, { method: 'POST' });
      loadGallery();
    }
    
    loadGallery();
  </script>
</body></html>`;
}

// ===== AI CHAT PAGE (Module 04) =====
function getChatPage() {
  return `<!DOCTYPE html>
<html><head><title>AI Chat</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  ${NAV_STYLE}
  .chat-container { background: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #333333; }
  .models { display: flex; flex-wrap: wrap; gap: 8px; padding: 15px; background: #000000; border-bottom: 1px solid #333333; }
  .model-btn { padding: 8px 15px; background: #333333; border: 2px solid transparent; color: #999999; border-radius: 8px; cursor: pointer; font-size: 13px; }
  .model-btn:hover { border-color: #F6821F; color: #F6821F; }
  .model-btn.active { background: #F6821F; color: #FFFFFF; border-color: #F6821F; }
  .messages { height: 400px; overflow-y: auto; padding: 20px; background: #1a1a1a; }
  .msg { margin-bottom: 15px; padding: 12px 16px; border-radius: 12px; max-width: 80%; }
  .user { background: #F6821F; color: #FFFFFF; margin-left: auto; }
  .bot { background: #333333; color: #FFFFFF; }
  .model-tag { font-size: 10px; color: #FBAD41; margin-top: 5px; }
  .input-area { display: flex; gap: 10px; padding: 15px; background: #000000; border-top: 1px solid #333333; }
  .input-area input { flex: 1; padding: 12px; border: 1px solid #333333; border-radius: 8px; background: #1a1a1a; color: #FFFFFF; font-size: 16px; }
  .input-area input:focus { border-color: #F6821F; outline: none; }
  .input-area button { padding: 12px 25px; background: #F6821F; color: #FFFFFF; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
  .input-area button:hover { background: #FF6633; }
</style></head>
<body>
  ${getNavHtml('chat')}
  <div class="container">
    <h1>AI Chat</h1>
    <p class="subtitle">Chat with different AI models</p>
    
    <div class="chat-container">
      <div class="models">
        <button class="model-btn active" data-model="@cf/meta/llama-3.1-8b-instruct">Llama 3.1 8B</button>
        <button class="model-btn" data-model="@cf/meta/llama-3.2-3b-instruct">Llama 3.2 3B</button>
        <button class="model-btn" data-model="@cf/meta/llama-3.2-1b-instruct">Llama 3.2 1B</button>
        <button class="model-btn" data-model="@cf/mistral/mistral-7b-instruct-v0.1">Mistral 7B</button>
      </div>
      <div class="messages" id="messages">
        <div class="msg bot">Hello! Choose a model and start chatting!</div>
      </div>
      <div class="input-area">
        <input type="text" id="chatInput" placeholder="Type your message..." onkeypress="if(event.key==='Enter')sendChat()">
        <button onclick="sendChat()">Send</button>
      </div>
    </div>
  </div>
  <script>
    let currentModel = "@cf/meta/llama-3.1-8b-instruct";
    
    document.querySelectorAll('.model-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentModel = btn.dataset.model;
        const messages = document.getElementById('messages');
        messages.innerHTML += '<div class="msg bot">Switched to ' + btn.textContent + '</div>';
        messages.scrollTop = messages.scrollHeight;
      };
    });
    
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
        const res = await fetch('/api/chat', {
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
  </script>
</body></html>`;
}

// ===== IMAGE GENERATION PAGE (Module 04) =====
function getImageGenPage() {
  return `<!DOCTYPE html>
<html><head><title>Image Generator</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  ${NAV_STYLE}
  .gen-box { background: #1a1a1a; border-radius: 12px; padding: 25px; border: 1px solid #333333; }
  .gen-box h3 { margin-bottom: 15px; color: #FFFFFF; }
  .gen-box textarea { width: 100%; height: 100px; padding: 15px; border: 1px solid #333333; border-radius: 8px; background: #000000; color: #FFFFFF; font-size: 14px; resize: none; margin-bottom: 15px; }
  .gen-box textarea:focus { border-color: #F6821F; outline: none; }
  .examples { margin-bottom: 15px; }
  .examples p { color: #999999; font-size: 12px; margin-bottom: 8px; }
  .example-btn { background: #333333; border: none; color: #999999; padding: 8px 12px; border-radius: 6px; cursor: pointer; margin: 4px; font-size: 12px; }
  .example-btn:hover { background: #F6821F; color: #FFFFFF; }
  .gen-btn { width: 100%; padding: 15px; background: #FF6633; color: #FFFFFF; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; }
  .gen-btn:hover { background: #F6821F; }
  .gen-btn:disabled { background: #333333; color: #666666; }
  .result { margin-top: 25px; text-align: center; }
  .result img { max-width: 100%; border-radius: 12px; box-shadow: 0 10px 30px rgba(246,130,31,0.3); }
  .result p { color: #999999; margin-top: 10px; font-size: 12px; }
</style></head>
<body>
  ${getNavHtml('image-gen')}
  <div class="container">
    <h1>Image Generator</h1>
    <p class="subtitle">Generate images from text using AI</p>
    
    <div class="gen-box">
      <h3>Describe your image:</h3>
      <textarea id="prompt" placeholder="A beautiful sunset over mountains with purple and orange sky..."></textarea>
      
      <div class="examples">
        <p>Try these examples:</p>
        <button class="example-btn" onclick="setPrompt('A cute robot playing guitar in a neon city')">Robot + Guitar</button>
        <button class="example-btn" onclick="setPrompt('A magical forest with glowing mushrooms at night')">Magic Forest</button>
        <button class="example-btn" onclick="setPrompt('A cozy coffee shop interior with warm lighting')">Coffee Shop</button>
        <button class="example-btn" onclick="setPrompt('A futuristic car flying over a cyberpunk city')">Flying Car</button>
      </div>
      
      <button class="gen-btn" onclick="generateImage()" id="genBtn">Generate Image</button>
      <div class="result" id="result"></div>
    </div>
  </div>
  <script>
    function setPrompt(text) {
      document.getElementById('prompt').value = text;
    }
    
    async function generateImage() {
      const prompt = document.getElementById('prompt').value.trim();
      const btn = document.getElementById('genBtn');
      const result = document.getElementById('result');
      
      if (!prompt) return alert('Please enter a description');
      
      btn.disabled = true;
      btn.textContent = 'Generating... (10-30 seconds)';
      result.innerHTML = '<p>Creating your image...</p>';
      
      try {
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          result.innerHTML = '<img src="' + url + '" alt="Generated image"><p>Prompt: ' + prompt + '</p>';
        } else {
          const data = await res.json();
          result.innerHTML = '<p style="color:#ef4444">Error: ' + (data.error || 'Failed') + '</p>';
        }
      } catch (e) {
        result.innerHTML = '<p style="color:#ef4444">Error: ' + e.message + '</p>';
      }
      
      btn.disabled = false;
      btn.textContent = 'Generate Image';
    }
  </script>
</body></html>`;
}
