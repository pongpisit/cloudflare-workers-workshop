# Module 1: Prerequisites & Setup for Windows

This module will help you set up everything you need on your Windows computer. Follow each step exactly as shown.

**Time needed: 30 minutes**

---

## What You Will Do

1. Create a free Cloudflare account
2. Install Node.js (required software)
3. Install Wrangler (Cloudflare's tool)
4. Connect Wrangler to your Cloudflare account
5. Install VS Code (code editor)

---

## Step 1: Create a Cloudflare Account

### 1.1 Open the Sign-Up Page

**Copy this link and paste it in your browser:**
```
https://dash.cloudflare.com/sign-up/workers-and-pages
```

### 1.2 Fill in Your Details

1. Enter your **email address**
2. Create a **password**
3. Click the **Create Account** button

### 1.3 Verify Your Email

1. Open your email inbox
2. Find the email from Cloudflare
3. Click the **verification link** in the email

### 1.4 Log In to Dashboard

**Copy this link and paste it in your browser:**
```
https://dash.cloudflare.com/
```

You should see the Cloudflare Dashboard. Look for **"Workers & Pages"** in the left menu.

> **Done!** You now have a Cloudflare account.

---

## Step 2: Install Node.js

Node.js is required software that Wrangler needs to work.

### 2.1 Download Node.js

**Copy this link and paste it in your browser:**
```
https://nodejs.org/
```

### 2.2 Click the Download Button

1. Click the green **"LTS"** button (this downloads the recommended version)
2. Wait for the download to complete

### 2.3 Install Node.js

1. **Double-click** the downloaded file (it looks like `node-v20.x.x-x64.msi`)
2. Click **Next** on the welcome screen
3. **Check the box** to accept the license agreement, then click **Next**
4. Keep the default installation location, click **Next**
5. Keep the default features, click **Next**
6. **Important:** Check the box that says **"Automatically install the necessary tools"**
7. Click **Next**, then click **Install**
8. Wait for installation to complete
9. Click **Finish**

### 2.4 Restart Your Computer

**Important:** Restart your computer now to complete the installation.

### 2.5 Verify Node.js is Installed

After restarting:

1. Press **Windows key + R** on your keyboard
2. Type `powershell` and press **Enter**
3. A blue window will open (this is PowerShell)

**Copy and paste this command, then press Enter:**
```powershell
node --version
```

**You should see something like:**
```
v20.10.0
```

> **Done!** Node.js is installed. The number might be different, that's OK.

---

## Step 3: Install Wrangler

Wrangler is Cloudflare's tool for creating and managing Workers.

### 3.1 Open CMD or PowerShell

1. Press **Windows key + R** on your keyboard
2. Type `cmd` or `powershell` and press **Enter**

### 3.2 Install Wrangler

**Copy and paste this command, then press Enter:**
```powershell
npm install -g wrangler@latest
```

**Wait for it to finish.** You'll see some text scrolling. When it's done, you'll see a new line starting with `PS`.

### 3.3 Verify Wrangler is Installed

**Copy and paste this command, then press Enter:**
```powershell
wrangler --version
```

**You should see something like:**
```
 wrangler 3.99.0
```

> **Done!** Wrangler is installed.

---

## Step 4: Connect Wrangler to Cloudflare

Now we need to connect Wrangler to your Cloudflare account.

### 4.1 Run the Login Command

**In PowerShell, copy and paste this command, then press Enter:**
```powershell
wrangler login
```

### 4.2 Authorize in Your Browser

1. A browser window will **automatically open**
2. If asked, **log in** to your Cloudflare account
3. Click the **"Allow"** button to authorize Wrangler
4. You should see a message: **"Successfully logged in"**

### 4.3 Verify the Connection

**Go back to PowerShell. Copy and paste this command, then press Enter:**
```powershell
wrangler whoami
```

**You should see your email address and account name:**
```
 You are logged in with an OAuth Token, associated with the email your-email@example.com!
```

> **Done!** Wrangler is connected to your Cloudflare account.

---

## Step 5: Install VS Code (Code Editor)

VS Code is a free code editor that makes writing code easier.

### 5.1 Download VS Code

**Copy this link and paste it in your browser:**
```
https://code.visualstudio.com/
```

### 5.2 Install VS Code

1. Click the **"Download for Windows"** button
2. **Double-click** the downloaded file
3. Accept the license agreement
4. **Important:** Check these boxes:
   - Add "Open with Code" action to Windows Explorer file context menu
   - Add "Open with Code" action to Windows Explorer directory context menu
   - Add to PATH
5. Click **Next**, then **Install**
6. Click **Finish**

> **Done!** VS Code is installed.

---

## Step 6: Create Your Project Folder

### 6.1 Create a Folder

1. Open **File Explorer** (press Windows key + E)
2. Go to your **Documents** folder
3. **Right-click** in an empty area
4. Select **New** → **Folder**
5. Name the folder: `cloudflare-projects`

### 6.2 Remember This Location

Your project folder is now at:
```
C:\Users\YourName\Documents\cloudflare-projects
```

(Replace "YourName" with your Windows username)

> **Done!** You have a folder for your projects.

---

## Final Checklist

Before moving to the next module, make sure you have completed:

| Step | Status |
|------|--------|
| Created Cloudflare account | |
| Installed Node.js | |
| Installed Wrangler | |
| Connected Wrangler to Cloudflare | |
| Installed VS Code | |
| Created project folder | |

---

## Having Problems?

Expand the details below for solutions to common problems. 

Otherwise, you may proceed to [Module 2 > Step 4: Change the Response Text](./02-hello-world.md#step-4-change-the-response-text) where you will complete your project via Cloudflare's dashboard instead. 

<details>

<summary>Expand for details</summary>


### Problem: "node is not recognized"

**Solution:** Restart your computer and try again.

### Problem: "npm install" shows errors

**Solution:** 
1. Close PowerShell
2. Right-click on PowerShell
3. Select **"Run as administrator"**
4. Try the command again

### Problem: Wrangler login doesn't open browser

**Solution:** Copy and paste this command instead:
```powershell
wrangler login --browser=false
```
Then copy the URL it shows and paste it in your browser manually.

### Problem: "Execution policy" error

**Solution:** 
1. Close PowerShell
2. Right-click on PowerShell
3. Select **"Run as administrator"**
4. Copy and paste this command:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
5. Type `Y` and press Enter
6. Try again

</details>

---

## Next Module

**Congratulations!** Your computer is ready for Cloudflare Workers development.

**Next:** [Module 2: Create Your First Worker →](./02-hello-world.md)
