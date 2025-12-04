# Cloudflare Workers Workshop

A hands-on workshop for learning Cloudflare Workers. Complete in **2 hours**.

---

## Workshop Modules

| # | Module | Time | What You'll Build |
|---|--------|------|-------------------|
| 1 | [Setup Your Computer](./docs/01-prerequisites.md) | 30 min | Install required software |
| 2 | [Create Your First Worker](./docs/02-hello-world.md) | 30 min | Hello World app |
| 3 | [Connect to Database (D1)](./docs/03-d1-database.md) | 30 min | Todo list API |
| 4 | [File Storage (R2)](./docs/04-r2-storage.md) | 20 min | File upload API |
| 5 | [Deploy with GitHub](./docs/05-github-deploy.md) | 10 min | Automatic deployments |

**Total Time: ~2 hours**

---

## What You Need

- Windows 10 or 11
- Internet connection
- Free Cloudflare account
- Free GitHub account

---

## Quick Start

**Step 1:** Go to [Module 1: Setup](./docs/01-prerequisites.md)

**Step 2:** Follow each step exactly as shown

**Step 3:** Copy and paste the code - no typing needed!

---

## What You'll Learn

By the end of this workshop, you will be able to:

- ✅ Create and deploy Cloudflare Workers
- ✅ Build APIs that read/write to a database
- ✅ Upload and download files
- ✅ Set up automatic deployments from GitHub

---

## Useful Links

- [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [Workers Documentation](https://developers.cloudflare.com/workers/)
- [D1 Database Documentation](https://developers.cloudflare.com/d1/)
- [R2 Storage Documentation](https://developers.cloudflare.com/r2/)

---

## Quick Reference Card

| What You Want to Do | Command |
|---------------------|---------|
| Create new project | `npm create cloudflare@latest -- project-name` |
| Run locally | `npm run dev` |
| Deploy to internet | `npm run deploy` |
| Create database | `npx wrangler d1 create db-name` |
| Create storage bucket | `npx wrangler r2 bucket create bucket-name` |
| Check if logged in | `wrangler whoami` |
| Log in to Cloudflare | `wrangler login` |

---

**Ready?** [Start Module 1 →](./docs/01-prerequisites.md)
