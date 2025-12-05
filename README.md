# Cloudflare Workers Workshop

Learn to build applications with **Cloudflare Workers** and **AI**. Complete in **2.5 hours**.

---

## What You Will Learn

| Module | Topic |
|--------|-------|
| 1 | Setup your development environment |
| 2 | Create Workers, return text/JSON/HTML, build a profile page |
| 3 | Store images with R2, captions with D1, build Instagram-style app |
| 4 | Build AI chatbot with Workers AI |
| 5 | Complete app with all features |

---

## Workshop Modules

| # | Module | Time | Description |
|---|--------|------|-------------|
| 1 | [Setup](./docs/01-prerequisites.md) | 20 min | Install Node.js, Wrangler, VS Code |
| 2 | [Hello World](./docs/02-hello-world.md) | 30 min | Learn Worker basics, build profile page |
| 3 | [R2 + D1](./docs/03-r2-images.md) | 45 min | Build Instagram-style photo app with captions |
| 4 | [AI Chatbot](./docs/04-ai-chatbot.md) | 40 min | Build AI chat, try different models |
| 5 | [Complete App](./docs/05-complete-app.md) | 10 min | Clone and deploy everything |

**Total Time: ~2.5 hours**

### Want the final app?

Skip to [Module 5: Complete App](./docs/05-complete-app.md) - clone and deploy in 10 minutes.

---

## What You Need

- Windows or macOS
- Internet connection
- Free Cloudflare account

---

## Quick Start

1. Go to [Module 1: Setup](./docs/01-prerequisites.md)
2. Follow each step exactly
3. Copy and paste the code - no typing needed!

---

## Quick Reference

| Command | What It Does |
|---------|--------------|
| `npm create cloudflare@latest -- name` | Create new project |
| `npm run dev` | Run locally |
| `npm run deploy` | Deploy to internet |
| `npx wrangler r2 bucket create name` | Create R2 storage bucket |
| `npx wrangler d1 create name` | Create D1 database |
| `npx wrangler d1 execute name --remote --file=schema.sql` | Run SQL on remote database |
| `npx wrangler whoami` | Check if logged in |

---

**Ready?** [Start Module 1](./docs/01-prerequisites.md)
