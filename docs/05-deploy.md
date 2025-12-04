# Module 5: Deploy to Production

In this module, you will deploy your AI chatbot to the internet.

**Time needed: 10 minutes**

---

## Step 1: Make Sure You're Logged In

**Open PowerShell and run:**

```powershell
wrangler whoami
```

**You should see your email address.** If not, run:
```powershell
wrangler login
```

---

## Step 2: Go to Your Project

```powershell
cd $HOME\Documents\cloudflare-projects\my-chatbot
```

---

## Step 3: Deploy Your Chatbot

**Run this command:**
```powershell
npm run deploy
```

**You'll see something like:**
```
Published my-chatbot (2.34 sec)
  https://my-chatbot.yourname.workers.dev
```

---

## Step 4: Visit Your Live Chatbot

**Copy the URL** from the output and **paste it in your browser**.

🎉 **Your AI chatbot is now live on the internet!**

---

## Step 5: Share Your Chatbot

You can share your chatbot URL with anyone:

```
https://my-chatbot.yourname.workers.dev
```

They can:
- Chat with your AI
- Upload images and videos
- See shared media

---

## Updating Your Chatbot

Whenever you make changes to your code:

1. **Save your files** in VS Code
2. **Run deploy again:**
   ```powershell
   npm run deploy
   ```

Your changes will be live in seconds!

---

## View Your Chatbot in Cloudflare Dashboard

**Open your browser and go to:**
```
https://dash.cloudflare.com/
```

1. Click **Workers & Pages** in the left menu
2. Click on **my-chatbot**
3. You can see:
   - How many people visited
   - Error logs
   - Settings

---

## 🎉 Congratulations!

**You've completed the workshop!**

You built an AI-powered chatbot that:
- ✅ Runs on Cloudflare's global network
- ✅ Uses AI to answer questions
- ✅ Stores and displays images/videos
- ✅ Is accessible to anyone on the internet

---

## What You Built

| Feature | Technology |
|---------|------------|
| Chat interface | HTML + JavaScript |
| AI responses | Workers AI (Llama 3.1) |
| Image/video storage | R2 Storage |
| Backend API | Cloudflare Workers |

---

## Next Steps

**Ideas to improve your chatbot:**

1. **Custom domain** - Use your own domain name
2. **Different AI models** - Try image generation
3. **Add authentication** - Require login
4. **Save chat history** - Use D1 database

**Learn more:**
- [Workers AI Models](https://developers.cloudflare.com/workers-ai/models/)
- [R2 Storage](https://developers.cloudflare.com/r2/)
- [Workers Documentation](https://developers.cloudflare.com/workers/)

---

## Quick Reference

| What You Want to Do | Command |
|---------------------|---------|
| Deploy | `npm run deploy` |
| Run locally | `npm run dev -- --remote` |
| Check login | `wrangler whoami` |
| Login | `wrangler login` |
| View logs | `wrangler tail` |

---

## Thank You!

Thank you for completing this workshop! 🙏

**Share your chatbot URL with us!**
