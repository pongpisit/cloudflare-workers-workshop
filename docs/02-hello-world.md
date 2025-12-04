# Module 2: Build Your Personal Profile Page

In this module, you will build a **personal profile page** - like a mini Linktree!

**Time needed: 25 minutes**

---

## What You'll Build

A personal profile page with:
- Your name and bio
- Links to your social media
- Beautiful design
- Multiple pages (Home, About)

---

## Step 1: Create a New Project

**Open PowerShell:**

1. Press **Windows key + R**
2. Type `powershell` and press **Enter**

**Run these commands:**

```powershell
cd $HOME\Documents\cloudflare-projects
```

```powershell
npm create cloudflare@latest -- my-profile
```

**Answer the questions:**
- Start with → **Hello World example**
- Template → **Hello World Worker**
- Language → **JavaScript**
- Git → **yes**
- Deploy → **no**

**Go into the project:**
```powershell
cd my-profile
```

**Open in VS Code:**
```powershell
code .
```

---

## Step 2: Create Your Profile Page

**Open `src/index.js` and replace ALL the code with:**

```javascript
export default {
  async fetch(request) {
    return new Response(HTML, {
      headers: { "content-type": "text/html" }
    });
  }
};

const HTML = `<!DOCTYPE html>
<html>
<head>
  <title>My Profile</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 50px;
    }
    h1 { color: #333; margin-bottom: 10px; }
    .title { color: #666; margin-bottom: 20px; }
    .bio { color: #555; line-height: 1.6; margin-bottom: 30px; }
    .links { display: flex; flex-direction: column; gap: 10px; }
    .link {
      display: block;
      padding: 12px 20px;
      background: #f5f5f5;
      border-radius: 10px;
      color: #333;
      text-decoration: none;
      transition: all 0.2s;
    }
    .link:hover {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
    }
    .footer { margin-top: 30px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="avatar">👤</div>
    <h1>Your Name</h1>
    <p class="title">Web Developer | Designer</p>
    <p class="bio">
      Hello! I'm learning to build apps with Cloudflare Workers. 
      This is my personal profile page running on the edge!
    </p>
    <div class="links">
      <a href="https://github.com" class="link">🐙 GitHub</a>
      <a href="https://linkedin.com" class="link">💼 LinkedIn</a>
      <a href="https://twitter.com" class="link">🐦 Twitter</a>
      <a href="mailto:hello@example.com" class="link">📧 Email Me</a>
    </div>
    <p class="footer">Powered by Cloudflare Workers ⚡</p>
  </div>
</body>
</html>`;
```

**Save the file (Ctrl + S)**

---

## Step 3: Test Your Profile Page

**In PowerShell, run:**
```powershell
npm run dev
```

**Open your browser:**
```
http://localhost:8787
```

You should see your beautiful profile page!

---

## Step 4: Customize Your Profile

**Edit the HTML in `src/index.js` to personalize:**

### Change Your Name
```html
<h1>Your Name</h1>
```

### Change Your Title
```html
<p class="title">Web Developer | Designer</p>
```

### Change Your Links
```html
<a href="https://github.com/YOUR-USERNAME" class="link">🐙 GitHub</a>
```

### Change Your Avatar Emoji
Find `<div class="avatar">👤</div>` and change to:
- 👨‍💻 (developer)
- 👩‍💼 (professional)
- 🧑‍🎨 (designer)

**Save and refresh your browser!**

---

## Step 5: Deploy Your Profile

**Stop the local server** (Ctrl + C)

**Deploy to the internet:**
```powershell
npm run deploy
```

🎉 **Your profile page is now live!** Share the URL with friends!

---

## ✅ What You Learned

| Skill | ✓ |
|-------|---|
| Create a Worker project | ☐ |
| Build HTML pages | ☐ |
| Style with CSS | ☐ |
| Deploy to the internet | ☐ |

---

## Quick Reference

| Command | What It Does |
|---------|--------------|
| `npm create cloudflare@latest -- name` | Create project |
| `npm run dev` | Run locally |
| `npm run deploy` | Deploy to internet |
| `Ctrl + C` | Stop server |

---

## Next Module

**Awesome!** You've built a real profile page!

**Next:** [Module 3: Photo Sharing App →](./03-r2-images.md)
