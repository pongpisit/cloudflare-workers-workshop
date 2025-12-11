# Module 4: AI Chatbot

In this module, you will learn how to use Workers AI to build a chatbot.

**Time needed: 45 minutes** (+ 20 minutes for Bonus Challenge)

---

## What You Will Learn

- Enable Workers AI in your project
- Call AI models from your Worker
- Build a chat interface
- Switch between different AI models
- Compare how different models respond
- Generate images with text-to-image AI

---

## Why Workers AI is Amazing

Building AI apps used to be hard. You needed:
- Expensive GPU servers
- Complex setup and configuration
- API keys from multiple providers
- Worry about scaling and costs

**With Cloudflare Workers AI, it's incredibly simple:**

| Traditional AI | Workers AI |
|----------------|------------|
| Rent GPU servers ($100+/month) | Free tier included |
| Install ML frameworks | Just add `"ai": { "binding": "AI" }` |
| Manage API keys | Already authenticated |
| Complex deployment | One command: `npx wrangler deploy` |
| Worry about scaling | Auto-scales globally |

**The magic line of code:**
```javascript
const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
  messages: [{ role: "user", content: "Hello!" }]
});
```

That's it! One line to call a powerful AI model. No API keys, no setup, no servers.

---

## What is Workers AI?

Workers AI lets you run AI models on Cloudflare's servers. You can:
- Chat with AI (like ChatGPT)
- Generate text
- Summarize content
- Describe images (vision models)
- **Generate images from text** (Stable Diffusion)
- Translate languages
- And much more!

**In this module, you will build an app with BOTH chat AND image generation!**

---

## Step 1: Create a New Project

**Open PowerShell:**

```powershell
cd $HOME\Documents\cloudflare-projects
```

```powershell
npm create cloudflare@latest -- my-ai-chat
```

**Answer the questions:**
- Start with → Hello World example
- Template → Worker only
- Language → JavaScript
- Git → no
- Deploy → no

**Go into the project:**
```powershell
cd my-ai-chat
```

**Open in VS Code:**
```powershell
code .
```

> [!NOTE]  
> For those following alone via Clouddflare dashboard, you may create a new application.

---

## Step 2: Enable Workers AI

### 2.1 Steps for via VS Code

**File to edit: `wrangler.jsonc`**

This file is in the root of your project folder (not inside src/).

**Delete everything in the file and paste this code:**

```json
{
  "name": "my-ai-chat",
  "main": "src/index.js",
  "compatibility_date": "2024-11-01",
  "ai": {
    "binding": "AI"
  }
}
```

**Save the file (Ctrl + S)**

### 2.2 Steps for via Cloudflare dashboard

> **Important:** You must deploy your Worker first before it appears in the dashboard. Run `npx wrangler deploy` first, then follow these steps.

**Go to: Workers & Pages > my-ai-chat > Settings > Bindings > Add > Workers AI**
- Variable name: `AI`

**Click Save**

---

## Step 3: Create the AI Chatbot Code

**File to edit: `src/index.js`**

This file is inside the `src` folder.

**Delete everything in the file and paste this code:**

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Serve the chat page
    if (url.pathname === "/") {
      return new Response(HTML_PAGE, {
        headers: { "content-type": "text/html" }
      });
    }

    // Handle chat API
    if (url.pathname === "/chat" && request.method === "POST") {
      const { message, model } = await request.json();

      try {
        const response = await env.AI.run(model, {
          messages: [
            { 
              role: "system", 
              content: "You are a helpful assistant. Keep answers short and clear." 
            },
            { 
              role: "user", 
              content: message 
            }
          ]
        });

        return new Response(JSON.stringify({ 
          reply: response.response,
          model: model
        }), {
          headers: { "content-type": "application/json" }
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          error: "Failed to get response from " + model,
          details: error.message
        }), {
          status: 500,
          headers: { "content-type": "application/json" }
        });
      }
    }

    // Handle image generation API
    if (url.pathname === "/generate-image" && request.method === "POST") {
      const { prompt } = await request.json();

      try {
        const response = await env.AI.run("@cf/stabilityai/stable-diffusion-xl-base-1.0", {
          prompt: prompt
        });

        return new Response(response, {
          headers: { "content-type": "image/png" }
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          error: "Failed to generate image",
          details: error.message
        }), {
          status: 500,
          headers: { "content-type": "application/json" }
        });
      }
    }

    return new Response("Not found", { status: 404 });
  }
};

const HTML_PAGE = `
<!DOCTYPE html>
<html>
<head>
  <title>AI Studio - Chat & Image Generation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { color: white; text-align: center; margin-bottom: 10px; }
    .subtitle { color: #888; text-align: center; margin-bottom: 20px; }
    
    /* Mode Tabs */
    .mode-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      justify-content: center;
    }
    .mode-tab {
      padding: 12px 30px;
      border: 2px solid #374151;
      background: transparent;
      color: #9ca3af;
      border-radius: 25px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      transition: all 0.2s;
    }
    .mode-tab:hover { border-color: #f38020; color: #f38020; }
    .mode-tab.active { background: #f38020; border-color: #f38020; color: white; }
    
    /* Model Selector */
    .model-selector {
      background: #1f2937;
      padding: 15px;
      border-radius: 10px;
      margin-bottom: 20px;
    }
    .model-selector label {
      color: white;
      display: block;
      margin-bottom: 10px;
      font-weight: bold;
    }
    .model-buttons { display: flex; flex-wrap: wrap; gap: 10px; }
    .model-btn {
      padding: 10px 15px;
      border: 2px solid #374151;
      background: transparent;
      color: #9ca3af;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    .model-btn:hover { border-color: #f38020; color: #f38020; }
    .model-btn.active { background: #f38020; border-color: #f38020; color: white; }
    .model-info { color: #6b7280; font-size: 12px; margin-top: 10px; }

    /* Chat Area */
    .chat-box { background: #1f2937; border-radius: 10px; overflow: hidden; }
    .messages { height: 400px; overflow-y: auto; padding: 20px; }
    .message { margin-bottom: 15px; padding: 12px 16px; border-radius: 10px; max-width: 85%; }
    .user-msg { background: #f38020; color: white; margin-left: auto; }
    .bot-msg { background: #374151; color: white; }
    .bot-msg img { max-width: 100%; border-radius: 8px; margin-top: 10px; }
    .model-tag { font-size: 10px; color: #9ca3af; margin-top: 5px; }
    .typing { color: #9ca3af; font-style: italic; }

    /* Input Area */
    .input-area { display: flex; padding: 15px; background: #111827; gap: 10px; }
    .input-area input {
      flex: 1; padding: 12px; border: none; border-radius: 8px;
      background: #374151; color: white; font-size: 16px;
    }
    .input-area input::placeholder { color: #6b7280; }
    .input-area button {
      padding: 12px 24px; background: #f38020; color: white;
      border: none; border-radius: 8px; cursor: pointer; font-size: 16px;
    }
    .input-area button:hover { background: #e06f10; }
    .input-area button:disabled { background: #4b5563; cursor: not-allowed; }
    
    /* Image Generation Panel */
    .image-panel { background: #1f2937; border-radius: 10px; padding: 20px; display: none; }
    .image-panel.active { display: block; }
    .image-panel textarea {
      width: 100%; height: 100px; padding: 12px; border: none; border-radius: 8px;
      background: #374151; color: white; font-size: 14px; resize: none; margin-bottom: 15px;
    }
    .image-panel textarea::placeholder { color: #6b7280; }
    .generate-btn {
      width: 100%; padding: 15px; background: #8b5cf6; color: white;
      border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;
    }
    .generate-btn:hover { background: #7c3aed; }
    .generate-btn:disabled { background: #4b5563; cursor: not-allowed; }
    .image-result { margin-top: 20px; text-align: center; }
    .image-result img { max-width: 100%; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
    .prompt-examples { margin-top: 15px; }
    .prompt-examples p { color: #9ca3af; font-size: 12px; margin-bottom: 8px; }
    .example-prompt {
      background: #374151; border: none; color: #9ca3af; padding: 8px 12px;
      border-radius: 6px; font-size: 12px; cursor: pointer; margin: 4px;
    }
    .example-prompt:hover { background: #4b5563; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <h1>AI Studio</h1>
    <p class="subtitle">Chat with AI or Generate Images - All powered by Workers AI!</p>

    <div class="mode-tabs">
      <button class="mode-tab active" onclick="switchMode('chat')">Chat Mode</button>
      <button class="mode-tab" onclick="switchMode('image')">Image Generation</button>
    </div>

    <!-- Chat Mode -->
    <div id="chat-mode">
      <div class="model-selector">
        <label>Choose an AI Model:</label>
        <div class="model-buttons">
          <button class="model-btn active" data-model="@cf/meta/llama-3.1-8b-instruct">Llama 3.1 8B</button>
          <button class="model-btn" data-model="@cf/meta/llama-3.2-3b-instruct">Llama 3.2 3B (Fast)</button>
          <button class="model-btn" data-model="@cf/meta/llama-3.2-1b-instruct">Llama 3.2 1B (Fastest)</button>
          <button class="model-btn" data-model="@cf/mistral/mistral-7b-instruct-v0.1">Mistral 7B</button>
          <!-- Bonus: Add more model buttons here! -->
        </div>
        <p class="model-info">Different models have different strengths. Try asking the same question to different models!</p>
      </div>

      <div class="chat-box">
        <div class="messages" id="messages">
          <div class="message bot-msg">Hello! I'm an AI assistant. Choose a model above and start chatting!<div class="model-tag">System</div></div>
        </div>
        <div class="input-area">
          <input type="text" id="userInput" placeholder="Type your message..." onkeypress="if(event.key==='Enter')sendMessage()">
          <button onclick="sendMessage()" id="sendBtn">Send</button>
        </div>
      </div>
    </div>

    <!-- Image Generation Mode -->
    <div id="image-mode" class="image-panel">
      <label style="color:white;font-weight:bold;display:block;margin-bottom:10px;">Describe the image you want to create:</label>
      <textarea id="imagePrompt" placeholder="A beautiful sunset over mountains with purple and orange sky..."></textarea>
      
      <div class="prompt-examples">
        <p>Try these examples:</p>
        <button class="example-prompt" onclick="setPrompt('A cute robot playing guitar in a neon city')">Robot + Guitar</button>
        <button class="example-prompt" onclick="setPrompt('A magical forest with glowing mushrooms at night')">Magic Forest</button>
        <button class="example-prompt" onclick="setPrompt('A futuristic car flying over a cyberpunk city')">Flying Car</button>
        <button class="example-prompt" onclick="setPrompt('A cozy coffee shop interior with warm lighting')">Coffee Shop</button>
      </div>
      
      <button class="generate-btn" onclick="generateImage()" id="generateBtn">Generate Image</button>
      <div class="image-result" id="imageResult"></div>
    </div>
  </div>

  <script>
    let currentModel = "@cf/meta/llama-3.1-8b-instruct";
    let currentMode = "chat";

    function switchMode(mode) {
      currentMode = mode;
      document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
      event.target.classList.add('active');
      
      document.getElementById('chat-mode').style.display = mode === 'chat' ? 'block' : 'none';
      document.getElementById('image-mode').style.display = mode === 'image' ? 'block' : 'none';
      document.getElementById('image-mode').classList.toggle('active', mode === 'image');
    }

    function setPrompt(text) {
      document.getElementById('imagePrompt').value = text;
    }

    // Model selection
    document.querySelectorAll('.model-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentModel = btn.dataset.model;
        const messages = document.getElementById('messages');
        const modelName = btn.textContent.trim();
        messages.innerHTML += '<div class="message bot-msg">Switched to <strong>' + modelName + '</strong>. Try asking me something!<div class="model-tag">System</div></div>';
        messages.scrollTop = messages.scrollHeight;
      });
    });

    async function sendMessage() {
      const input = document.getElementById('userInput');
      const messages = document.getElementById('messages');
      const sendBtn = document.getElementById('sendBtn');
      const message = input.value.trim();
      if (!message) return;

      messages.innerHTML += '<div class="message user-msg">' + message + '</div>';
      input.value = '';
      const typingId = 'typing-' + Date.now();
      messages.innerHTML += '<div class="message bot-msg typing" id="' + typingId + '">Thinking...</div>';
      messages.scrollTop = messages.scrollHeight;
      sendBtn.disabled = true;

      try {
        const response = await fetch('/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, model: currentModel })
        });
        const data = await response.json();
        document.getElementById(typingId).remove();
        if (data.error) {
          messages.innerHTML += '<div class="message bot-msg">Error: ' + data.error + '<div class="model-tag">Error</div></div>';
        } else {
          const modelName = currentModel.split('/').pop();
          messages.innerHTML += '<div class="message bot-msg">' + data.reply + '<div class="model-tag">' + modelName + '</div></div>';
        }
      } catch (error) {
        document.getElementById(typingId).remove();
        messages.innerHTML += '<div class="message bot-msg">Sorry, something went wrong.<div class="model-tag">Error</div></div>';
      }
      sendBtn.disabled = false;
      messages.scrollTop = messages.scrollHeight;
    }

    async function generateImage() {
      const prompt = document.getElementById('imagePrompt').value.trim();
      const btn = document.getElementById('generateBtn');
      const result = document.getElementById('imageResult');
      if (!prompt) { alert('Please enter a description'); return; }

      btn.disabled = true;
      btn.textContent = 'Generating... (this may take 10-30 seconds)';
      result.innerHTML = '<p style="color:#9ca3af">Creating your image...</p>';

      try {
        const response = await fetch('/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          result.innerHTML = '<img src="' + imageUrl + '" alt="Generated image"><p style="color:#6b7280;margin-top:10px;font-size:12px;">Prompt: ' + prompt + '</p>';
        } else {
          const data = await response.json();
          result.innerHTML = '<p style="color:#ef4444">Error: ' + (data.error || 'Failed to generate image') + '</p>';
        }
      } catch (error) {
        result.innerHTML = '<p style="color:#ef4444">Error: ' + error.message + '</p>';
      }
      btn.disabled = false;
      btn.textContent = 'Generate Image';
    }
  </script>
</body>
</html>
`;
```

**Save the file (Ctrl + S)**

---

## Step 4: Test Your AI Chatbot

**In CMD or PowerShell, run:**
```cmd
npx wrangler dev --remote
```

> **Note:** We use `--remote` because AI models run on Cloudflare's servers.

**Open your browser:**
```
http://localhost:8787
```

---

## Step 5: Try Both Modes!

### Chat Mode

**Experiment with different AI models:**

1. **Ask a question** with the default model (Llama 3.1 8B)
2. **Click a different model** (like "Mistral 7B")
3. **Ask the same question** and compare the answers!

**Try these questions:**
- "What is Cloudflare?"
- "Write a haiku about coding"
- "Explain quantum computing in simple terms"
- "Tell me a joke"

### Image Generation Mode

1. **Click "Image Generation"** tab at the top
2. **Type a description** or click an example prompt
3. **Click "Generate Image"** and wait 10-30 seconds
4. **See your AI-generated image!**

**Try these prompts:**
- "A cute robot playing guitar in a neon city"
- "A magical forest with glowing mushrooms at night"
- "A cozy coffee shop interior with warm lighting"

**Notice how different models:**
- Give different answers
- Have different response speeds
- Have different "personalities"

---

## Step 6: Deploy Your Chatbot

**Stop the local server** (press Ctrl + C)

**Deploy:**
```cmd
npx wrangler deploy
```

**Share the URL with friends!**

---

## Available AI Models

### Chat Models

| Model | Size | Speed | Best For |
|-------|------|-------|----------|
| `@cf/meta/llama-3.1-8b-instruct` | 8B | Medium | General chat |
| `@cf/meta/llama-3.2-3b-instruct` | 3B | Fast | Quick responses |
| `@cf/meta/llama-3.2-1b-instruct` | 1B | Fastest | Simple tasks |
| `@cf/mistral/mistral-7b-instruct-v0.1` | 7B | Medium | Creative writing |
| `@cf/google/gemma-3-12b-it` | 12B | Medium | Multimodal, 140+ languages |
| `@cf/qwen/qwen1.5-7b-chat-awq` | 7B | Medium | Multilingual |

### Image Generation Models

| Model | Speed | Best For |
|-------|-------|----------|
| `@cf/stabilityai/stable-diffusion-xl-base-1.0` | 10-30s | High quality images |
| `@cf/bytedance/stable-diffusion-xl-lightning` | 5-10s | Faster generation |

**See all models:** https://developers.cloudflare.com/workers-ai/models/

---

## Bonus: Add More Models

The code includes 4 models. Try adding 2 more yourself!

**File to edit: `src/index.js`**

Find the `model-buttons` section (around line 2XX) and add these buttons after the existing ones:

```html
<button class="model-btn" data-model="@cf/google/gemma-3-12b-it">
  Gemma 3 12B
</button>
<button class="model-btn" data-model="@cf/qwen/qwen1.5-7b-chat-awq">
  Qwen 1.5 7B
</button>
```

**Save the file and refresh your browser to see the new models!**

---

## Bonus Challenge: Image-to-Text App

Want to try something more advanced? Build an app that describes images using AI!

**This challenge shows how easy it is to use vision models with Workers AI.**

### Challenge: Create a New Project

```powershell
cd $HOME\Documents\cloudflare-projects
npm create cloudflare@latest -- my-image-describer
```

**Answer the questions:**
- Start with → Hello World example
- Template → Worker only
- Language → JavaScript
- Git → no
- Deploy → no

```powershell
cd my-image-describer
code .
```

### Challenge Step 1: Update wrangler.jsonc

**File to edit: `wrangler.jsonc`**

```json
{
  "name": "my-image-describer",
  "main": "src/index.js",
  "compatibility_date": "2024-11-01",
  "ai": {
    "binding": "AI"
  }
}
```

### Challenge Step 2: Create the Image Describer

**File to edit: `src/index.js`**

**Delete everything and paste this code:**

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Home page
    if (url.pathname === "/" && request.method === "GET") {
      return new Response(HTML, { headers: { "content-type": "text/html" } });
    }

    // Describe image from URL
    if (url.pathname === "/describe" && request.method === "POST") {
      const { imageUrl } = await request.json();
      
      try {
        // Fetch the image with proper headers
        const imageResponse = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CloudflareWorker)',
            'Accept': 'image/*'
          }
        });
        
        // Check if we got an image
        const contentType = imageResponse.headers.get('content-type') || '';
        if (!contentType.startsWith('image/')) {
          return Response.json({ 
            error: "URL did not return an image. Content-Type: " + contentType,
            success: false 
          }, { status: 400 });
        }
        
        const imageBuffer = await imageResponse.arrayBuffer();
        
        // Check if image is too small (likely an error page)
        if (imageBuffer.byteLength < 1000) {
          return Response.json({ 
            error: "Image too small or invalid. Size: " + imageBuffer.byteLength + " bytes",
            success: false 
          }, { status: 400 });
        }
        
        const imageArray = [...new Uint8Array(imageBuffer)];

        // Use LLaVA model to describe the image
        const response = await env.AI.run("@cf/llava-hf/llava-1.5-7b-hf", {
          image: imageArray,
          prompt: "Describe this image in detail. What do you see?",
          max_tokens: 512
        });

        return Response.json({ 
          description: response.description,
          success: true 
        });
      } catch (error) {
        return Response.json({ 
          error: "Failed to describe image: " + error.message,
          success: false 
        }, { status: 500 });
      }
    }

    return new Response("Not found", { status: 404 });
  }
};

const HTML = `<!DOCTYPE html>
<html>
<head>
  <title>Image Describer - AI Vision</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, sans-serif;
      background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%);
      min-height: 100vh;
      padding: 20px;
      color: white;
    }
    .container { max-width: 600px; margin: 0 auto; }
    h1 { text-align: center; margin-bottom: 10px; }
    .subtitle { text-align: center; color: #888; margin-bottom: 30px; }
    
    .card {
      background: #1f2937;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 20px;
    }
    
    label { display: block; margin-bottom: 8px; font-weight: 500; }
    input {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 8px;
      background: #374151;
      color: white;
      font-size: 14px;
      margin-bottom: 15px;
    }
    input::placeholder { color: #9ca3af; }
    
    button {
      width: 100%;
      padding: 12px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
    }
    button:hover { background: #2563eb; }
    button:disabled { background: #4b5563; cursor: not-allowed; }
    
    .preview { margin-top: 20px; text-align: center; }
    .preview img { max-width: 100%; max-height: 300px; border-radius: 8px; }
    
    .result {
      background: #374151;
      border-radius: 8px;
      padding: 15px;
      margin-top: 20px;
      line-height: 1.6;
    }
    .result h3 { margin-bottom: 10px; color: #3b82f6; }
    
    .loading { text-align: center; color: #9ca3af; }
    .error { color: #ef4444; }
    
    .examples { margin-top: 15px; }
    .examples p { font-size: 12px; color: #9ca3af; margin-bottom: 8px; }
    .example-btn {
      background: #374151;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      margin-right: 8px;
      margin-bottom: 8px;
      display: inline-block;
    }
    .example-btn:hover { background: #4b5563; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Image Describer</h1>
    <p class="subtitle">AI-powered image description using Workers AI</p>
    
    <div class="card">
      <label>Enter an image URL:</label>
      <input type="text" id="imageUrl" placeholder="https://example.com/image.jpg">
      <button onclick="describeImage()" id="btn">Describe Image</button>
      
      <div class="examples">
        <p>Try these examples:</p>
        <button class="example-btn" onclick="setExample('https://cataas.com/cat')">Cat</button>
        <button class="example-btn" onclick="setExample('https://placedog.net/500/400')">Dog</button>
        <button class="example-btn" onclick="setExample('https://picsum.photos/800/600')">Random</button>
      </div>
      
      <div class="preview" id="preview"></div>
      <div id="result"></div>
    </div>
  </div>

  <script>
    function setExample(url) {
      document.getElementById('imageUrl').value = url;
      document.getElementById('preview').innerHTML = '<img src="' + url + '" alt="Preview">';
    }

    async function describeImage() {
      const imageUrl = document.getElementById('imageUrl').value.trim();
      const btn = document.getElementById('btn');
      const result = document.getElementById('result');
      const preview = document.getElementById('preview');
      
      if (!imageUrl) {
        alert('Please enter an image URL');
        return;
      }
      
      // Show preview
      preview.innerHTML = '<img src="' + imageUrl + '" alt="Preview">';
      
      // Show loading
      result.innerHTML = '<div class="loading">Analyzing image with AI...</div>';
      btn.disabled = true;
      
      try {
        const response = await fetch('/describe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl })
        });
        
        const data = await response.json();
        
        if (data.success) {
          result.innerHTML = '<div class="result"><h3>AI Description:</h3>' + data.description + '</div>';
        } else {
          result.innerHTML = '<div class="result error">Error: ' + data.error + '</div>';
        }
      } catch (error) {
        result.innerHTML = '<div class="result error">Error: ' + error.message + '</div>';
      }
      
      btn.disabled = false;
    }
    
    // Preview image when URL changes
    document.getElementById('imageUrl').addEventListener('change', function() {
      const url = this.value.trim();
      if (url) {
        document.getElementById('preview').innerHTML = '<img src="' + url + '" alt="Preview">';
      }
    });
  </script>
</body>
</html>`;
```

### Challenge Step 3: Test It

```cmd
npx wrangler dev --remote
```

Open http://localhost:8787 and try:
1. Click one of the example buttons (Cat, Dog, Landscape)
2. Click "Describe Image"
3. Wait for the AI to analyze and describe the image

### Challenge Step 4: Deploy

```cmd
npx wrangler deploy
```

### What You Built

You just created an AI-powered image description app with:
- Vision AI model (LLaVA)
- Image URL input
- Real-time image preview
- AI-generated descriptions

**All in about 150 lines of code!**

### Other Vision Models to Try

| Model | Description |
|-------|-------------|
| `@cf/llava-hf/llava-1.5-7b-hf` | General image description |
| `@cf/unum/uform-gen2-qwen-500m` | Fast image captioning |

---

## What You Learned

| Skill | Done |
|-------|------|
| Enable Workers AI | |
| Call AI models | |
| Build chat interface | |
| Switch between models | |
| Compare model responses | |
| Generate images from text | |
| Use vision models (Bonus) | |

---

## Key Concepts

| Concept | Description |
|---------|-------------|
| `env.AI.run(model, options)` | Call an AI model |
| `messages` | Array of conversation messages |
| `role: "system"` | Instructions for the AI |
| `role: "user"` | User's message |
| `prompt` | Text description for image generation |

---

## Quick Reference

| Command | What It Does |
|---------|--------------|
| `npx wrangler dev --remote` | Run locally with AI |
| `npx wrangler deploy` | Deploy to internet |

---

## What's Next?

Ideas to explore:
- Combine the image gallery with the chatbot
- Try image generation models
- Add chat history with D1 database

Learn more:
- Workers AI Models: https://developers.cloudflare.com/workers-ai/models/
- Workers Documentation: https://developers.cloudflare.com/workers/

---

## Next Module

**Next:** [Module 5: Complete App - Clone and Deploy](./05-complete-app.md)
