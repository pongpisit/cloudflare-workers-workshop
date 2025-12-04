# Complete App - Ready to Deploy

This is a complete Cloudflare Workers app with AI Chat and Image Gallery.

## Quick Deploy

### Step 1: Install dependencies
```powershell
npm install
```

### Step 2: Create R2 bucket
```powershell
npx wrangler r2 bucket create my-app-media
```

### Step 3: Deploy
```powershell
npm run deploy
```

Done! Open the URL shown.

## Features

- 🤖 AI Chat with 5 models to choose from
- 🖼️ Image & Video Gallery with R2 storage
- 🎨 Beautiful dark theme UI
- ⚡ Runs globally on Cloudflare

## Local Development

```powershell
npm run dev -- --remote
```

Open: http://localhost:8787
