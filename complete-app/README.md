# Complete App - Ready to Deploy

This is a complete Cloudflare Workers app with AI Chat and Image/Video Gallery.

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

Done! Open the URL shown in the terminal.

## Features

- AI Chat with multiple models to choose from
- Image and Video Gallery with R2 storage
- Dark theme UI
- Runs globally on Cloudflare edge network

## Local Development

```powershell
npm run dev -- --remote
```

Open: http://localhost:8787

## Wrangler Answers

When creating a new project with `npm create cloudflare@latest`:
- Start with: Hello World example
- Template: Worker only
- Language: JavaScript
- Git: no
- Deploy: no
