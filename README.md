# Cloudflare Workers Workshop

Build your own **AI Chatbot** with image/video storage. Complete in **2 hours**.

---

## What You'll Build

A chatbot application that:
- 🤖 Uses AI to answer questions (Workers AI)
- 🖼️ Stores and displays images/videos (R2 Storage)
- 🌍 Runs globally on Cloudflare's edge network

---

## Workshop Modules

| # | Module | Time | What You'll Build |
|---|--------|------|-------------------|
| 1 | [Setup Your Computer](./docs/01-prerequisites.md) | 20 min | Install required software |
| 2 | [Your First Worker](./docs/02-hello-world.md) | 20 min | Hello World app |
| 3 | [AI Chatbot](./docs/03-ai-chatbot.md) | 40 min | LLM-powered chatbot |
| 4 | [Add Image Storage](./docs/04-r2-storage.md) | 30 min | Store images & videos |
| 5 | [Deploy to Production](./docs/05-deploy.md) | 10 min | Go live! |

**Total Time: ~2 hours**

---

## What You Need

- Windows 10 or 11
- Internet connection
- Free Cloudflare account

---

## Quick Start

**Step 1:** Go to [Module 1: Setup](./docs/01-prerequisites.md)

**Step 2:** Follow each step exactly as shown

**Step 3:** Copy and paste the code - no typing needed!

---

## Quick Reference

| What You Want to Do | Command |
|---------------------|---------|
| Create new project | `npm create cloudflare@latest -- project-name` |
| Run locally | `npm run dev` |
| Deploy to internet | `npm run deploy` |
| Create storage bucket | `npx wrangler r2 bucket create bucket-name` |
| Check if logged in | `wrangler whoami` |

---

**Ready?** [Start Module 1 →](./docs/01-prerequisites.md)
