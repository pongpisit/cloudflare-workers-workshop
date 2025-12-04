# Module 4: AI Chatbot

In this module, you will learn how to use Workers AI to build a chatbot.

**Time needed: 40 minutes**

---

## What You Will Learn

- Enable Workers AI in your project
- Call AI models from your Worker
- Build a chat interface
- Switch between different AI models
- Compare how different models respond

---

## What is Workers AI?

Workers AI lets you run AI models on Cloudflare's servers. You can:
- Chat with AI (like ChatGPT)
- Generate text
- Summarize content
- And more

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

---

## Step 2: Enable Workers AI

**Open `wrangler.jsonc` and replace ALL content with:**

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

---

## Step 3: Create the AI Chatbot Code

**Open `src/index.js` and replace ALL the code with:**

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

    return new Response("Not found", { status: 404 });
  }
};

const HTML_PAGE = `
<!DOCTYPE html>
<html>
<head>
  <title>AI Chatbot - Try Different Models</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      color: white;
      text-align: center;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #888;
      text-align: center;
      margin-bottom: 20px;
    }
    
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
    .model-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
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
    .model-btn:hover {
      border-color: #f38020;
      color: #f38020;
    }
    .model-btn.active {
      background: #f38020;
      border-color: #f38020;
      color: white;
    }
    .model-info {
      color: #6b7280;
      font-size: 12px;
      margin-top: 10px;
    }

    /* Chat Area */
    .chat-box {
      background: #1f2937;
      border-radius: 10px;
      overflow: hidden;
    }
    .messages {
      height: 400px;
      overflow-y: auto;
      padding: 20px;
    }
    .message {
      margin-bottom: 15px;
      padding: 12px 16px;
      border-radius: 10px;
      max-width: 85%;
    }
    .user-msg {
      background: #f38020;
      color: white;
      margin-left: auto;
    }
    .bot-msg {
      background: #374151;
      color: white;
    }
    .model-tag {
      font-size: 10px;
      color: #9ca3af;
      margin-top: 5px;
    }
    .typing {
      color: #9ca3af;
      font-style: italic;
    }

    /* Input Area */
    .input-area {
      display: flex;
      padding: 15px;
      background: #111827;
      gap: 10px;
    }
    .input-area input {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 8px;
      background: #374151;
      color: white;
      font-size: 16px;
    }
    .input-area input::placeholder {
      color: #6b7280;
    }
    .input-area button {
      padding: 12px 24px;
      background: #f38020;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
    }
    .input-area button:hover {
      background: #e06f10;
    }
    .input-area button:disabled {
      background: #4b5563;
      cursor: not-allowed;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>AI Chatbot</h1>
    <p class="subtitle">Try different AI models and see how they respond!</p>

    <div class="model-selector">
      <label>Choose an AI Model:</label>
      <div class="model-buttons">
        <button class="model-btn active" data-model="@cf/meta/llama-3.1-8b-instruct">
          Llama 3.1 8B
        </button>
        <button class="model-btn" data-model="@cf/meta/llama-3.2-3b-instruct">
          Llama 3.2 3B (Fast)
        </button>
        <button class="model-btn" data-model="@cf/meta/llama-3.2-1b-instruct">
          Llama 3.2 1B (Fastest)
        </button>
        <button class="model-btn" data-model="@cf/mistral/mistral-7b-instruct-v0.1">
          Mistral 7B
        </button>
        <button class="model-btn" data-model="@cf/google/gemma-7b-it-lora">
          Gemma 7B
        </button>
        <button class="model-btn" data-model="@cf/qwen/qwen1.5-7b-chat-awq">
          Qwen 1.5 7B
        </button>
      </div>
      <p class="model-info">
        💡 Different models have different strengths. Try asking the same question to different models!
      </p>
    </div>

    <div class="chat-box">
      <div class="messages" id="messages">
        <div class="message bot-msg">
          Hello! I'm an AI assistant. Choose a model above and start chatting!
          <div class="model-tag">System</div>
        </div>
      </div>
      <div class="input-area">
        <input type="text" id="userInput" placeholder="Type your message..." onkeypress="if(event.key==='Enter')sendMessage()">
        <button onclick="sendMessage()" id="sendBtn">Send</button>
      </div>
    </div>
  </div>

  <script>
    let currentModel = "@cf/meta/llama-3.1-8b-instruct";

    // Model selection
    document.querySelectorAll('.model-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentModel = btn.dataset.model;
        
        // Add message about model change
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

      // Show user message
      messages.innerHTML += '<div class="message user-msg">' + message + '</div>';
      input.value = '';

      // Show typing indicator
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
        
        // Remove typing indicator
        document.getElementById(typingId).remove();

        if (data.error) {
          messages.innerHTML += '<div class="message bot-msg">Error: ' + data.error + '<div class="model-tag">Error</div></div>';
        } else {
          // Get model display name
          const modelName = currentModel.split('/').pop();
          messages.innerHTML += '<div class="message bot-msg">' + data.reply + '<div class="model-tag">' + modelName + '</div></div>';
        }
      } catch (error) {
        document.getElementById(typingId).remove();
        messages.innerHTML += '<div class="message bot-msg">Sorry, something went wrong. Please try again.<div class="model-tag">Error</div></div>';
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

## Step 4: Test Your AI Chatbot

**In PowerShell, run:**
```powershell
npm run dev -- --remote
```

> **Note:** We use `--remote` because AI models run on Cloudflare's servers.

**Open your browser:**
```
http://localhost:8787
```

---

## Step 5: Try Different Models!

**Experiment with different AI models:**

1. **Ask a question** with the default model (Llama 3.1 8B)
2. **Click a different model** (like "Mistral 7B")
3. **Ask the same question** and compare the answers!

**Try these questions:**
- "What is Cloudflare?"
- "Write a haiku about coding"
- "Explain quantum computing in simple terms"
- "Tell me a joke"

**Notice how different models:**
- Give different answers
- Have different response speeds
- Have different "personalities"

---

## Step 6: Deploy Your Chatbot

**Stop the local server** (press Ctrl + C)

**Deploy:**
```powershell
npm run deploy
```

**Share the URL with friends!**

---

## Available AI Models

Here are some models you can try:

| Model | Size | Speed | Best For |
|-------|------|-------|----------|
| `@cf/meta/llama-3.1-8b-instruct` | 8B | Medium | General chat |
| `@cf/meta/llama-3.2-3b-instruct` | 3B | Fast | Quick responses |
| `@cf/meta/llama-3.2-1b-instruct` | 1B | Fastest | Simple tasks |
| `@cf/mistral/mistral-7b-instruct-v0.1` | 7B | Medium | Creative writing |
| `@cf/google/gemma-7b-it-lora` | 7B | Medium | Instructions |
| `@cf/qwen/qwen1.5-7b-chat-awq` | 7B | Medium | Multilingual |

**See all models:** https://developers.cloudflare.com/workers-ai/models/

---

## Bonus: Add More Models

Want to add more models? Edit the HTML in `src/index.js`:

Find the `model-buttons` section and add more buttons:

```html
<button class="model-btn" data-model="@cf/google/gemma-7b-it-lora">
  Google Gemma
</button>
```

---

## What You Learned

| Skill | Done |
|-------|------|
| Enable Workers AI | |
| Call AI models | |
| Build chat interface | |
| Switch between models | |
| Compare model responses | |

---

## Key Concepts

| Concept | Description |
|---------|-------------|
| `env.AI.run(model, options)` | Call an AI model |
| `messages` | Array of conversation messages |
| `role: "system"` | Instructions for the AI |
| `role: "user"` | User's message |

---

## Quick Reference

| Command | What It Does |
|---------|--------------|
| `npm run dev -- --remote` | Run locally with AI |
| `npm run deploy` | Deploy to internet |

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
