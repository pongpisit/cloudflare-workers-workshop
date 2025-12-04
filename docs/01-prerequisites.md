# Module 1: Prerequisites & Setup for Windows

This module guides you through setting up your Windows development environment for Cloudflare Workers development.

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Create a Cloudflare Account](#1-create-a-cloudflare-account)
3. [Install Node.js](#2-install-nodejs)
4. [Install Wrangler CLI](#3-install-wrangler-cli)
5. [Authenticate Wrangler](#4-authenticate-wrangler)
6. [Install a Code Editor](#5-install-a-code-editor)
7. [Verify Installation](#6-verify-installation)
8. [Troubleshooting](#troubleshooting)

---

## System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| OS | Windows 10 | Windows 11 |
| RAM | 4 GB | 8 GB+ |
| Disk Space | 2 GB free | 5 GB+ free |
| Node.js | 18.0.0 | 20.x LTS |
| Internet | Required | Required |

---

## 1. Create a Cloudflare Account

### Step 1.1: Sign Up

1. Open your web browser and navigate to: **https://dash.cloudflare.com/sign-up/workers-and-pages**

2. Enter your email address and create a password

3. Click **Create Account**

4. Check your email and verify your account by clicking the verification link

### Step 1.2: Access the Dashboard

1. Log in to the Cloudflare Dashboard: **https://dash.cloudflare.com/**

2. You should see the main dashboard with **Workers & Pages** in the left sidebar

![Cloudflare Dashboard](https://developers.cloudflare.com/assets/images/workers-and-pages-dashboard.png)

> **💡 Tip**: The free tier includes 100,000 requests per day, which is more than enough for learning and development.

---

## 2. Install Node.js

Wrangler requires Node.js version **18.0.0 or later**. We recommend using the LTS (Long Term Support) version.

### Option A: Direct Download (Recommended for Beginners)

1. Visit the Node.js website: **https://nodejs.org/**

2. Download the **LTS** version (e.g., 20.x.x LTS)

3. Run the installer:
   - Accept the license agreement
   - Use the default installation path: `C:\Program Files\nodejs\`
   - **Important**: Check the box for "Automatically install the necessary tools"
   - Click **Install**

4. Restart your computer after installation

### Option B: Using Winget (Windows Package Manager)

Open **PowerShell as Administrator** and run:

```powershell
winget install OpenJS.NodeJS.LTS
```

### Option C: Using Node Version Manager (nvm-windows)

For managing multiple Node.js versions:

1. Download nvm-windows from: **https://github.com/coreybutler/nvm-windows/releases**

2. Download and run `nvm-setup.exe`

3. After installation, open a new PowerShell window and run:

```powershell
# Install the latest LTS version
nvm install lts

# Use the installed version
nvm use lts
```

### Verify Node.js Installation

Open **PowerShell** or **Command Prompt** and run:

```powershell
node --version
```

Expected output (version may vary):
```
v20.10.0
```

Also verify npm (Node Package Manager):

```powershell
npm --version
```

Expected output:
```
10.2.3
```

---

## 3. Install Wrangler CLI

Wrangler is Cloudflare's command-line tool for managing Workers projects.

### Install Wrangler Globally

Open **PowerShell** or **Command Prompt** and run:

```powershell
npm install -g wrangler@latest
```

> **📝 Note**: The `-g` flag installs Wrangler globally, making it available from any directory.

### Verify Wrangler Installation

```powershell
npx wrangler --version
```

Expected output (version may vary):
```
⛅️ wrangler 3.99.0
```

### Alternative: Use npx (No Global Install)

You can also use Wrangler without installing it globally by using `npx`:

```powershell
npx wrangler@latest --version
```

This downloads and runs the latest version of Wrangler each time.

---

## 4. Authenticate Wrangler

You need to authenticate Wrangler with your Cloudflare account.

### Step 4.1: Run the Login Command

```powershell
npx wrangler login
```

### Step 4.2: Authorize in Browser

1. A browser window will automatically open

2. Log in to your Cloudflare account if prompted

3. Click **Allow** to authorize Wrangler

4. You should see a success message: "Successfully logged in"

### Step 4.3: Verify Authentication

```powershell
npx wrangler whoami
```

Expected output:
```
⛅️ wrangler 3.99.0
-------------------
Getting User settings...
👋 You are logged in with an OAuth Token, associated with the email your-email@example.com!
┌─────────────────────────────────────┬──────────────────────────────────┐
│ Account Name                        │ Account ID                       │
├─────────────────────────────────────┼──────────────────────────────────┤
│ Your Account Name                   │ xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx │
└─────────────────────────────────────┴──────────────────────────────────┘
```

> **🔐 Security Note**: Your authentication token is stored locally. Never share your API tokens or commit them to version control.

---

## 5. Install a Code Editor

We recommend **Visual Studio Code** for Cloudflare Workers development.

### Install VS Code

1. Download VS Code from: **https://code.visualstudio.com/**

2. Run the installer and follow the prompts

3. **Recommended**: Check these options during installation:
   - Add "Open with Code" action to Windows Explorer file context menu
   - Add "Open with Code" action to Windows Explorer directory context menu
   - Add to PATH

### Recommended VS Code Extensions

After installing VS Code, install these extensions:

1. **Open VS Code**

2. Press `Ctrl+Shift+X` to open Extensions

3. Search and install:

| Extension | Purpose |
|-----------|---------|
| **ESLint** | JavaScript/TypeScript linting |
| **Prettier** | Code formatting |
| **JavaScript and TypeScript Nightly** | Enhanced JS/TS support |
| **Cloudflare Workers** | Cloudflare-specific features |

### Configure VS Code for Workers

Create a workspace settings file for better TypeScript support:

1. Create a new folder for your projects: `C:\Users\YourName\cloudflare-projects`

2. Open this folder in VS Code

3. Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.eol": "\n"
}
```

---

## 6. Verify Installation

Let's verify everything is set up correctly.

### Run the Verification Script

Open PowerShell and run each command:

```powershell
# Check Node.js
Write-Host "Node.js version:" -ForegroundColor Cyan
node --version

# Check npm
Write-Host "`nnpm version:" -ForegroundColor Cyan
npm --version

# Check Wrangler
Write-Host "`nWrangler version:" -ForegroundColor Cyan
npx wrangler --version

# Check Wrangler authentication
Write-Host "`nWrangler authentication:" -ForegroundColor Cyan
npx wrangler whoami
```

### Expected Results

✅ Node.js version: v18.0.0 or higher  
✅ npm version: 8.0.0 or higher  
✅ Wrangler version: 3.0.0 or higher  
✅ Wrangler authenticated with your Cloudflare account

---

## Troubleshooting

### Issue: "node" is not recognized

**Cause**: Node.js is not in your system PATH.

**Solution**:
1. Restart your computer
2. If still not working, manually add Node.js to PATH:
   - Press `Win + X` → System → Advanced system settings
   - Click "Environment Variables"
   - Under "System variables", find "Path" and click "Edit"
   - Add: `C:\Program Files\nodejs\`
   - Click OK and restart PowerShell

### Issue: npm install fails with permission errors

**Cause**: Windows security restrictions.

**Solution**: Run PowerShell as Administrator:
1. Right-click on PowerShell
2. Select "Run as administrator"
3. Run the npm install command again

### Issue: Wrangler login doesn't open browser

**Cause**: Default browser not set or firewall blocking.

**Solution**: Use manual authentication:
```powershell
npx wrangler login --browser=false
```
This will provide a URL to copy and paste into your browser manually.

### Issue: SSL/Certificate errors

**Cause**: Corporate proxy or firewall.

**Solution**: Configure npm to use your proxy:
```powershell
npm config set proxy http://your-proxy:port
npm config set https-proxy http://your-proxy:port
```

### Issue: Execution policy prevents running scripts

**Cause**: Windows PowerShell execution policy.

**Solution**: Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📝 Checkpoint

Before proceeding to the next module, ensure you have:

- [ ] Created a Cloudflare account
- [ ] Installed Node.js (v18+)
- [ ] Installed Wrangler CLI
- [ ] Authenticated Wrangler with your Cloudflare account
- [ ] Installed VS Code with recommended extensions

---

## Next Steps

Congratulations! Your development environment is ready. 

**Continue to** → [Module 2: Your First Worker - Hello World](./02-hello-world.md)
