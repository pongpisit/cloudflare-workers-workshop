# Cloudflare Workers Workshop - Hands-on Training Guide

A comprehensive hands-on workshop for learning Cloudflare Workers from scratch. This guide covers everything from setting up your first "Hello World" Worker to integrating with R2 storage, D1 database, and GitHub CI/CD.

## 📚 Workshop Contents

| Module | Topic | Duration |
|--------|-------|----------|
| 1 | [Prerequisites & Setup](./docs/01-prerequisites.md) | 30 min |
| 2 | [Your First Worker - Hello World](./docs/02-hello-world.md) | 45 min |
| 3 | [Understanding Workers & Wrangler](./docs/03-workers-basics.md) | 30 min |
| 4 | [Integrating with D1 Database](./docs/04-d1-database.md) | 60 min |
| 5 | [Integrating with R2 Storage](./docs/05-r2-storage.md) | 60 min |
| 6 | [GitHub Integration & CI/CD](./docs/06-github-integration.md) | 45 min |
| 7 | [Using Cloudflare Templates](./docs/07-templates.md) | 30 min |
| 8 | [Best Practices & Next Steps](./docs/08-best-practices.md) | 30 min |

**Total Workshop Duration: ~5.5 hours**

## 🎯 Learning Objectives

By the end of this workshop, you will be able to:

- Set up a Windows development environment for Cloudflare Workers
- Create and deploy Workers using both the Dashboard GUI and Wrangler CLI
- Understand the Workers runtime and its capabilities
- Integrate Workers with D1 (serverless SQL database)
- Integrate Workers with R2 (object storage)
- Set up automated deployments with GitHub
- Use official Cloudflare templates to accelerate development

## 🛠️ Prerequisites

- Windows 10/11 operating system
- Administrator access to install software
- A Cloudflare account (free tier is sufficient)
- Basic knowledge of JavaScript/TypeScript
- A GitHub account (for CI/CD module)

## 📖 Quick Start

1. Start with [Module 1: Prerequisites & Setup](./docs/01-prerequisites.md)
2. Follow each module in order
3. Complete the hands-on exercises in each module
4. Use the troubleshooting sections if you encounter issues

## 📁 Workshop Structure

```
cloudflare-workers-workshop/
├── README.md                    # This file
├── docs/                        # Workshop documentation
│   ├── 01-prerequisites.md      # Setup guide for Windows
│   ├── 02-hello-world.md        # First Worker tutorial
│   ├── 03-workers-basics.md     # Workers fundamentals
│   ├── 04-d1-database.md        # D1 integration guide
│   ├── 05-r2-storage.md         # R2 integration guide
│   ├── 06-github-integration.md # CI/CD setup
│   ├── 07-templates.md          # Using templates
│   └── 08-best-practices.md     # Best practices
└── exercises/                   # Hands-on exercise files
    ├── hello-world/
    ├── d1-example/
    └── r2-example/
```

## 🔗 Useful Links

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [D1 Documentation](https://developers.cloudflare.com/d1/)
- [R2 Documentation](https://developers.cloudflare.com/r2/)
- [Cloudflare Dashboard](https://dash.cloudflare.com/)

## 📝 Version Information

- **Last Updated**: December 2024
- **Wrangler Version**: Latest (4.x+)
- **Node.js Version**: 18.x or later recommended

---

**Ready to start?** Begin with [Module 1: Prerequisites & Setup](./docs/01-prerequisites.md) →
