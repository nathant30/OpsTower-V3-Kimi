# OpsTower V2 - Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended - 2 minutes)

1. **Push to GitHub first** (see below)
2. Go to https://vercel.com/new
3. Import your GitHub repository: `OpsTower-V2-2026_Kimi`
4. Configure:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables:
   ```
   VITE_BACKEND_URL=https://your-api.com
   VITE_MAPBOX_TOKEN=your_mapbox_token
   ```
6. Click **Deploy**

### Option 2: Netlify (2 minutes)

1. Go to https://app.netlify.com/start
2. Connect to GitHub
3. Select your repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables in Site Settings

### Option 3: AWS Amplify (5 minutes)

1. Go to AWS Amplify Console
2. Click "Create new app"
3. Choose GitHub
4. Select repository
5. Build settings auto-detected from `amplify.yml`

---

## Step-by-Step: Push to GitHub

### 1. Create Repository

Go to https://github.com/new and create:
- **Name**: `OpsTower-V2-2026_Kimi`
- **Visibility**: Private (recommended)
- **DO NOT** check "Initialize with README"

### 2. Push Your Code

```bash
cd /Users/nathan/OpsTower-V2-2026_Kimi

# Configure git identity
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Set remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/OpsTower-V2-2026_Kimi.git

# Push branches
git push -u origin feature/port-all-features
git checkout main
git push -u origin main

# Set main as default
git checkout feature/port-all-features
```

### 3. Set Up GitHub Secrets (for CI/CD)

Go to Settings > Secrets and Variables > Actions:

```
VITE_BACKEND_URL=https://api.xpress.ph
VITE_MAPBOX_TOKEN=your_mapbox_token
# Add other secrets as needed
```

---

## Environment Variables

Create `.env.production` file:

```env
VITE_BACKEND_URL=https://api.xpress.ph
VITE_MAPBOX_TOKEN=pk.your_mapbox_token
VITE_ENABLE_DEBUG=false
```

---

## Development on Cloud

### GitHub Codespaces (Recommended)

1. Go to your GitHub repository
2. Click **Code** > **Codespaces** > **Create codespace**
3. Wait for environment to build
4. Start developing in the browser!

### Gitpod

1. Install Gitpod extension
2. Click Gitpod button on your repo
3. Or go to: `https://gitpod.io/#https://github.com/YOUR_USERNAME/OpsTower-V2-2026_Kimi`

---

## Post-Deployment Checklist

- [ ] Frontend deployed successfully
- [ ] Environment variables configured
- [ ] Backend API accessible from frontend
- [ ] Mapbox token working
- [ ] Authentication working
- [ ] WebSocket (SignalR) connecting
- [ ] All 29 features accessible

---

## Troubleshooting

### Build Fails
```bash
# Check build locally first
npm run build
```

### 404 Errors on Refresh
- Already configured in `vercel.json` with SPA rewrite rules
- For other platforms, ensure SPA fallback is enabled

### Environment Variables Not Working
- Must be prefixed with `VITE_` for Vite
- Restart deployment after adding secrets

---

## Domain Setup

### Vercel Custom Domain
1. Go to Project Settings > Domains
2. Add your domain
3. Update DNS records as instructed

### Netlify Custom Domain
1. Go to Site Settings > Domain Management
2. Add custom domain
3. Configure DNS

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Vite Deployment**: https://vitejs.dev/guide/static-deploy.html
- **OpsTower Issues**: Check `PRODUCTION_READINESS_REPORT.md`
