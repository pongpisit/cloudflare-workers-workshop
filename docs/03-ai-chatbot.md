# Module 3: Build an AI Chatbot

In this module, you will create an AI-powered chatbot using Cloudflare Workers AI.

**Time needed: 40 minutes**

---

## What is Workers AI?

Workers AI lets you run AI models directly on Cloudflare's servers. You can:
- Chat with AI (like ChatGPT)
- Generate images
- Translate text
- And more!

**Best part:** It's included free with your Cloudflare account!

---

## Step 1: Create a New Project

**Open PowerShell and run:**

```powershell
cd $HOME\Documents\cloudflare-projects
```

```powershell
npm create cloudflare@latest -- my-chatbot
```

**Answer the questions:**
- What would you like to start with? → **Hello World example**
- Which template? → **Hello World Worker**
- Which language? → **JavaScript**
- Use git? → **yes**
- Deploy? → **no**

**Go into the project:**
```powershell
cd my-chatbot
```

**Open in VS Code:**
```powershell
code .
```

---

## Step 2: Enable Workers AI

**In VS Code, open `wrangler.jsonc`**

**Replace ALL the content with this:**

```json
{
  "name": "my-chatbot",
  "main": "src/index.js",
  "compatibility_date": "2024-11-01",
  "ai": {
    "binding": "AI"
  }
}
```

**Save the file (Ctrl + S)**

---

## Step 3: Create the Chatbot Code

**Open `src/index.js` and replace ALL the code with this:**

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

      // Call the AI
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

    return new Response("Not found", { status: 404 });
  }
};

// The chat page HTML
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
      height: 400px;
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
    .chat-input {
      display: flex;
      padding: 20px;
      background: white;
      border-top: 1px solid #e2e8f0;
    }
    .chat-input input {
      flex: 1;
      padding: 15px;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 16px;
      outline: none;
    }
    .chat-input input:focus {
      border-color: #667eea;
    }
    .chat-input button {
      margin-left: 10px;
      padding: 15px 25px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      cursor: pointer;
    }
    .chat-input button:hover {
      background: #5a67d8;
    }
    .chat-input button:disabled {
      background: #a0aec0;
      cursor: not-allowed;
    }
    .typing {
      color: #718096;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="chat-container">
    <div class="chat-header">
      <h1>🤖 My AI Chatbot</h1>
      <p>Powered by Cloudflare Workers AI</p>
    </div>
    <div class="chat-messages" id="messages">
      <div class="message bot-message">
        Hello! I'm your AI assistant. How can I help you today?
      </div>
    </div>
    <div class="chat-input">
      <input type="text" id="userInput" placeholder="Type your message..." onkeypress="if(event.key==='Enter')sendMessage()">
      <button onclick="sendMessage()" id="sendBtn">Send</button>
    </div>
  </div>

  <script>
    async function sendMessage() {
      const input = document.getElementById('userInput');
      const messages = document.getElementById('messages');
      const sendBtn = document.getElementById('sendBtn');
      const message = input.value.trim();
      
      if (!message) return;
      
      // Show user message
      messages.innerHTML += '<div class="message user-message">' + message + '</div>';
      input.value = '';
      
      // Show typing indicator
      messages.innerHTML += '<div class="message bot-message typing" id="typing">Thinking...</div>';
      messages.scrollTop = messages.scrollHeight;
      
      // Disable button
      sendBtn.disabled = true;
      
      try {
        // Send to AI
        const response = await fetch('/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        document.getElementById('typing').remove();
        
        // Show AI response
        messages.innerHTML += '<div class="message bot-message">' + data.reply + '</div>';
      } catch (error) {
        document.getElementById('typing').remove();
        messages.innerHTML += '<div class="message bot-message">Sorry, something went wrong. Please try again.</div>';
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

## Step 4: Test Your Chatbot Locally

**In PowerShell, run:**
```powershell
npm run dev -- --remote
```

> **Note:** We use `--remote` because AI models need to run on Cloudflare's servers.

**Open your browser:**
```
http://localhost:8787
```

**Try chatting with your AI!** Type a message and press Enter or click Send.

**Example questions to try:**
- "What is Cloudflare?"
- "Tell me a joke"
- "How do I make pasta?"

---

## Step 5: Customize Your Chatbot

You can change how your chatbot behaves by editing the **system message**.

**In `src/index.js`, find this line:**

```javascript
content: "You are a helpful assistant. Keep your answers short and friendly."
```

**Change it to make your chatbot unique! Examples:**

**Customer Support Bot:**
```javascript
content: "You are a customer support agent for a tech company. Be helpful and professional."
```

**Coding Assistant:**
```javascript
content: "You are a coding assistant. Help users write and debug code. Use code examples."
```

**Fun Chatbot:**
```javascript
content: "You are a fun and witty chatbot. Use emojis and be entertaining!"
```

**Save and refresh your browser to see the changes!**

---

## Step 6: Deploy Your Chatbot

**Stop the local server** (press Ctrl + C)

**Deploy to the internet:**
```powershell
npm run deploy
```

**You'll see:**
```
Published my-chatbot (1.23 sec)
  https://my-chatbot.yourname.workers.dev
```

**Open the URL in your browser - your chatbot is now live!**

🎉 **Share this URL with friends and family!**

---

## ✅ What You Learned

| Skill | ✓ |
|-------|---|
| Enable Workers AI | ☐ |
| Call an AI model | ☐ |
| Build a chat interface | ☐ |
| Customize AI behavior | ☐ |
| Deploy an AI app | ☐ |

---

## Quick Reference

| AI Model | Use Case |
|----------|----------|
| `@cf/meta/llama-3.1-8b-instruct` | Chat & text generation |
| `@cf/meta/llama-3.2-11b-vision-instruct` | Image understanding |
| `@cf/stabilityai/stable-diffusion-xl-base-1.0` | Image generation |

---

## Next Module

**Awesome!** You've built an AI chatbot!

**Next:** [Module 4: Add Image Storage →](./04-r2-storage.md)
