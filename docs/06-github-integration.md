# Module 6: GitHub Integration & CI/CD

This module teaches you how to set up automated deployments for your Cloudflare Workers using GitHub integration.

## 📋 Table of Contents

1. [Overview of CI/CD Options](#overview-of-cicd-options)
2. [Method 1: Cloudflare Workers Builds (Native)](#method-1-cloudflare-workers-builds-native)
3. [Method 2: GitHub Actions](#method-2-github-actions)
4. [Managing Secrets in CI/CD](#managing-secrets-in-cicd)
5. [Branch Deployments & Preview URLs](#branch-deployments--preview-urls)
6. [Hands-on Exercise](#hands-on-exercise)

---

## Overview of CI/CD Options

Cloudflare provides two main ways to automate Worker deployments:

| Method | Description | Best For |
|--------|-------------|----------|
| **Workers Builds** | Native Cloudflare integration | Simple projects, quick setup |
| **GitHub Actions** | Custom CI/CD workflows | Complex builds, custom testing |

### Comparison

| Feature | Workers Builds | GitHub Actions |
|---------|---------------|----------------|
| Setup complexity | Simple | Moderate |
| Build customization | Limited | Full control |
| Testing integration | Basic | Full control |
| Secrets management | Cloudflare Dashboard | GitHub Secrets |
| Build logs | Cloudflare Dashboard | GitHub Actions |
| Cost | Free (included) | GitHub Actions minutes |

---

## Method 1: Cloudflare Workers Builds (Native)

Workers Builds is Cloudflare's native CI/CD system that automatically builds and deploys your Worker when you push to GitHub.

### Prerequisites

- A GitHub account
- A Worker project with a `wrangler.jsonc` or `wrangler.toml` file
- The project pushed to a GitHub repository

### Step 1: Push Your Project to GitHub

If you haven't already, create a GitHub repository and push your code:

```powershell
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/your-repo.git

# Push to main branch
git branch -M main
git push -u origin main
```

### Step 2: Connect Repository via Dashboard

1. Log in to the Cloudflare Dashboard: **https://dash.cloudflare.com/**

2. Navigate to **Workers & Pages**

3. Click **Create**

4. Select **Import a repository** (under "Get started")

5. Click **Connect to GitHub**

6. Authorize the Cloudflare Workers & Pages GitHub App

7. Select your repository from the list

8. Configure your project:
   - **Project name**: Your Worker name
   - **Production branch**: `main`
   - **Build command**: `npm run build` (or leave empty if no build needed)
   - **Deploy command**: `npx wrangler deploy`

9. Click **Save and Deploy**

### Step 3: Verify Automatic Deployments

1. Make a change to your Worker code

2. Commit and push to GitHub:

```powershell
git add .
git commit -m "Update Worker"
git push
```

3. Go to your Worker in the Cloudflare Dashboard

4. Click on **Deployments** to see the build progress

5. Once complete, your changes are live!

### Connect an Existing Worker

If you already have a deployed Worker:

1. Go to **Workers & Pages** in the Dashboard

2. Click on your existing Worker

3. Go to **Settings** → **Builds**

4. Click **Connect** and follow the prompts

> **⚠️ Important**: The Worker name in the Dashboard must match the `name` in your `wrangler.jsonc` file.

---

## Method 2: GitHub Actions

For more control over your CI/CD pipeline, use GitHub Actions with the official Wrangler action.

### Step 1: Create API Token

1. Go to the Cloudflare Dashboard

2. Click on your profile icon → **My Profile**

3. Go to **API Tokens**

4. Click **Create Token**

5. Use the **Edit Cloudflare Workers** template, or create a custom token with:
   - **Account** → **Workers Scripts** → **Edit**
   - **Account** → **Workers KV Storage** → **Edit**
   - **Account** → **Workers R2 Storage** → **Edit**
   - **Account** → **D1** → **Edit**

6. Click **Continue to summary** → **Create Token**

7. **Copy the token** (you won't see it again!)

### Step 2: Add Secrets to GitHub

1. Go to your GitHub repository

2. Click **Settings** → **Secrets and variables** → **Actions**

3. Click **New repository secret**

4. Add the following secrets:

| Secret Name | Value |
|-------------|-------|
| `CLOUDFLARE_API_TOKEN` | Your API token from Step 1 |
| `CLOUDFLARE_ACCOUNT_ID` | Your account ID (found in Dashboard URL or Workers overview) |

### Step 3: Create GitHub Actions Workflow

Create the workflow file:

**.github/workflows/deploy.yml:**
```yaml
name: Deploy Worker

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests (optional)
        run: npm test --if-present

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          # For pull requests, deploy as preview
          command: ${{ github.event_name == 'pull_request' && 'versions upload' || 'deploy' }}
```

### Step 4: Advanced Workflow with Multiple Environments

**.github/workflows/deploy.yml:**
```yaml
name: Deploy Worker

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main

env:
  NODE_VERSION: '20'

jobs:
  # Run tests on all pushes and PRs
  test:
    runs-on: ubuntu-latest
    name: Test
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint --if-present
      
      - name: Run tests
        run: npm test --if-present

  # Deploy to staging on develop branch
  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
    runs-on: ubuntu-latest
    name: Deploy to Staging
    environment: staging
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Deploy to Staging
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy --env staging

  # Deploy to production on main branch
  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    name: Deploy to Production
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Deploy to Production
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy

  # Preview deployment for PRs
  deploy-preview:
    needs: test
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    name: Deploy Preview
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Deploy Preview
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: versions upload
```

### Step 5: Workflow with D1 Migrations

If your project uses D1, include migration steps:

```yaml
name: Deploy with Migrations

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run D1 Migrations
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: d1 migrations apply my-database --remote
      
      - name: Deploy Worker
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy
```

---

## Managing Secrets in CI/CD

### Using Wrangler Secrets in GitHub Actions

For Worker secrets (like API keys), you can set them during deployment:

```yaml
- name: Set Worker Secrets
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    secrets: |
      API_KEY
      DATABASE_URL
  env:
    API_KEY: ${{ secrets.API_KEY }}
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Environment-Specific Secrets

For different environments, use GitHub Environments:

1. Go to **Settings** → **Environments**

2. Create environments: `staging`, `production`

3. Add environment-specific secrets

4. Reference in workflow:

```yaml
deploy-production:
  environment: production
  steps:
    - name: Deploy
      uses: cloudflare/wrangler-action@v3
      with:
        apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        secrets: |
          API_KEY
      env:
        API_KEY: ${{ secrets.PRODUCTION_API_KEY }}
```

---

## Branch Deployments & Preview URLs

### Automatic Preview Deployments

With Workers Builds, you can enable preview deployments for pull requests:

1. Go to your Worker → **Settings** → **Builds**

2. Enable **Preview deployments**

3. Each PR will get a unique preview URL

### Manual Preview with GitHub Actions

```yaml
deploy-preview:
  if: github.event_name == 'pull_request'
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    
    - name: Deploy Preview
      id: deploy
      uses: cloudflare/wrangler-action@v3
      with:
        apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        command: versions upload
    
    - name: Comment PR with Preview URL
      uses: actions/github-script@v7
      with:
        script: |
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: '🚀 Preview deployed! Check the Cloudflare Dashboard for the preview URL.'
          })
```

---

## Hands-on Exercise

### Exercise: Set Up Complete CI/CD Pipeline

1. **Create a new Worker project:**

```powershell
npm create cloudflare@latest -- cicd-demo
cd cicd-demo
```

2. **Initialize Git and push to GitHub:**

```powershell
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/cicd-demo.git
git branch -M main
git push -u origin main
```

3. **Create the GitHub Actions workflow:**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Worker

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test --if-present

  deploy:
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

4. **Add secrets to GitHub:**
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

5. **Commit and push:**

```powershell
git add .
git commit -m "Add GitHub Actions workflow"
git push
```

6. **Verify deployment:**
   - Go to GitHub → Actions tab
   - Watch the workflow run
   - Check your Worker is deployed

7. **Test the pipeline:**
   - Make a code change
   - Push to main
   - Watch automatic deployment

---

## Troubleshooting

### Common Issues

**Issue: "Authentication error"**
- Verify your API token has correct permissions
- Check the token hasn't expired
- Ensure `CLOUDFLARE_ACCOUNT_ID` is correct

**Issue: "Worker name mismatch"**
- The `name` in `wrangler.jsonc` must match the Worker name in Dashboard
- Update one to match the other

**Issue: "Build failed"**
- Check the build logs in GitHub Actions
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

**Issue: "D1 migrations failed"**
- Ensure database exists
- Check migration SQL syntax
- Verify database binding in `wrangler.jsonc`

---

## 📝 Checkpoint

Before proceeding, ensure you have:

- [ ] Pushed your Worker to GitHub
- [ ] Set up either Workers Builds or GitHub Actions
- [ ] Added necessary secrets to GitHub
- [ ] Successfully deployed via CI/CD
- [ ] Tested automatic deployments on push

---

## Next Steps

Great job setting up CI/CD! Now let's explore Cloudflare's templates.

**Continue to** → [Module 7: Using Cloudflare Templates](./07-templates.md)
