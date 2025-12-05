# Complete App - All-in-One

This is a complete Cloudflare Workers app combining all workshop modules (02-04) with navigation.

## Features

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Navigation hub with links to all apps |
| Profile | `/profile` | Linktree-style personal page (Module 02) |
| Gallery | `/gallery` | Photo upload with captions, R2 storage (Module 03) |
| AI Chat | `/chat` | Multi-model chatbot (Module 04) |
| Image Gen | `/image-gen` | Text-to-image AI generation (Module 04) |

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

## Local Development

```powershell
npm run dev -- --remote
```

Open: http://localhost:8787

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Send message to AI model |
| `/api/generate-image` | POST | Generate image from text |
| `/api/upload` | POST | Upload photo with caption |
| `/api/media` | GET | List all photos |
| `/api/delete/:filename` | POST | Delete a photo |
| `/media/:filename` | GET | Serve photo file |

## Wrangler Answers

When creating a new project with `npm create cloudflare@latest`:
- Start with: Hello World example
- Template: Worker only
- Language: JavaScript
- Git: no
- Deploy: no
