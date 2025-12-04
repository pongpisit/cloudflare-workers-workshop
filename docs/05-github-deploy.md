# Module 5: Deploy with GitHub (Automatic Deployments)

In this module, you will connect your project to GitHub for automatic deployments.

**Time needed: 20 minutes**

---

## What You'll Learn

When you push code to GitHub, Cloudflare will automatically deploy your Worker.

---

## Step 1: Create a GitHub Repository

**Open your browser and go to:**
```
https://github.com/new
```

**Fill in:**
- Repository name: `my-cloudflare-worker`
- Keep it **Public**
- Do NOT check any boxes
- Click **Create repository**

**Keep this page open - you'll need the commands shown.**

---

## Step 2: Push Your Code to GitHub

**Open PowerShell and go to your project:**
```powershell
cd $HOME\Documents\cloudflare-projects\my-first-worker
```

**Run these commands one by one (replace YOUR-USERNAME with your GitHub username):**

```powershell
git add .
```

```powershell
git commit -m "My first worker"
```

```powershell
git branch -M main
```

```powershell
git remote add origin https://github.com/YOUR-USERNAME/my-cloudflare-worker.git
```

```powershell
git push -u origin main
```

**If asked for credentials, enter your GitHub username and password (or token).**

---

## Step 3: Connect Cloudflare to GitHub

**Open Cloudflare Dashboard:**
```
https://dash.cloudflare.com/
```

1. Click **Workers & Pages** in the left menu
2. Click **Create**
3. Click **Import a repository**
4. Click **Connect to GitHub**
5. Authorize Cloudflare to access your GitHub
6. Select your repository: `my-cloudflare-worker`
7. Click **Begin setup**

---

## Step 4: Configure the Build

**Set these options:**
- Project name: `my-cloudflare-worker`
- Production branch: `main`
- Build command: `npm run deploy`

**Click Save and Deploy**

---

## Step 5: Test Automatic Deployment

**Make a change to your code in VS Code.**

**Open `src/index.js` and change the message.**

**Save the file.**

**In PowerShell, run:**
```powershell
git add .
git commit -m "Updated message"
git push
```

**Go to Cloudflare Dashboard → Workers & Pages → your project**

**Watch the deployment happen automatically!**

---

## ✅ What You Learned

| Skill | ✓ |
|-------|---|
| Push code to GitHub | ☐ |
| Connect Cloudflare to GitHub | ☐ |
| Automatic deployments | ☐ |

---

## 🎉 Workshop Complete!

**Congratulations!** You have completed the Cloudflare Workers Workshop!

You learned how to:
- ✅ Create Cloudflare Workers
- ✅ Connect to D1 databases
- ✅ Store files in R2
- ✅ Deploy automatically with GitHub

---

## What's Next?

**Explore more:**
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [R2 Storage Docs](https://developers.cloudflare.com/r2/)

**Try templates:**
```powershell
npm create cloudflare@latest
```
Then select different templates to explore!

---

## Quick Reference Card

| Task | Command |
|------|---------|
| Create new project | `npm create cloudflare@latest -- project-name` |
| Run locally | `npm run dev` |
| Deploy | `npm run deploy` |
| Create database | `npx wrangler d1 create db-name` |
| Run SQL locally | `npx wrangler d1 execute db-name --local --file=schema.sql` |
| Run SQL production | `npx wrangler d1 execute db-name --remote --file=schema.sql` |
| Create storage bucket | `npx wrangler r2 bucket create bucket-name` |
| Check login | `wrangler whoami` |
| Login | `wrangler login` |
