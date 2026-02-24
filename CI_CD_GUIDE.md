# CI/CD Guide - OpsTower V2

Complete continuous integration and deployment setup for OpsTower V2.

---

## 🔄 Workflow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Actions                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   CI Tests   │  │   Frontend   │  │   Backend (Azure)    │  │
│  │              │  │   (Vercel)   │  │                      │  │
│  │  - Frontend  │  │              │  │  - Build & Push      │  │
│  │  - Backend   │  │  - Preview   │  │  - Infrastructure    │  │
│  │  - Docker    │  │  - Prod      │  │  - Migrations        │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Workflows

### 1. CI - Build and Test (`ci.yml`)
**Triggers:** Push/PR to `main`, `feature/port-all-features`, `develop`

| Job | Description |
|-----|-------------|
| `test-frontend` | Lint, test, and build frontend |
| `test-backend` | Type check and build backend |
| `docker-build-test` | Verify Docker image builds |

### 2. Deploy Frontend (`deploy-frontend.yml`)
**Triggers:** Changes to frontend code on `main` or PRs

| Job | Trigger | Description |
|-----|---------|-------------|
| `build-and-test` | Always | Build and test the application |
| `deploy-preview` | PR only | Deploy preview URL for testing |
| `deploy-production` | Push to `main` | Deploy to production |

### 3. Deploy Backend (`deploy-azure.yml`)
**Triggers:** Changes to backend code or manual dispatch

| Job | Dependencies | Description |
|-----|--------------|-------------|
| `build-and-push` | - | Build and push Docker image to ACR |
| `deploy-infrastructure` | build-and-push | Deploy Bicep templates |
| `run-migrations` | infrastructure | Run Prisma migrations |
| `deploy-container-app` | migrations | Update Container App with new image |

---

## 🔐 Required Secrets

### GitHub Secrets (Settings → Secrets and Variables → Actions)

#### For Azure Backend Deployment
| Secret | Description | How to Get |
|--------|-------------|------------|
| `AZURE_CREDENTIALS` | Azure Service Principal JSON | `az ad sp create-for-rbac` |
| `AZURE_SUBSCRIPTION_ID` | Azure Subscription ID | Azure Portal → Subscriptions |
| `POSTGRES_ADMIN_PASSWORD` | PostgreSQL admin password | Set during first deployment |
| `JWT_SECRET` | Secret for JWT signing | Generate random string |
| `ACR_PASSWORD` | Container Registry password | Azure Portal → ACR → Access Keys |

#### For Vercel Frontend Deployment
| Secret | Description | How to Get |
|--------|-------------|------------|
| `VERCEL_TOKEN` | Vercel API token | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel Organization ID | `vercel whoami` or `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Vercel Project ID | `.vercel/project.json` |

#### For Application
| Secret | Description |
|--------|-------------|
| `VITE_BACKEND_URL` | Production backend URL |
| `VITE_MAPBOX_TOKEN` | Mapbox API token |
| `VITE_TRAKSOLID_*` | Traksolid API credentials |

---

## 🚀 Setup Instructions

### 1. Setup Azure Service Principal

```bash
# Login to Azure
az login

# Create service principal
az ad sp create-for-rbac \
  --name "opstower-github-actions" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/opstower-v2-rg \
  --sdk-auth

# Copy the JSON output and add as AZURE_CREDENTIALS secret
```

### 2. Setup Vercel Project

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project (from repo root)
vercel link

# Get project info
cat .vercel/project.json
# Add orgId and projectId as GitHub secrets

# Create token
vercel tokens create
# Add token as VERCEL_TOKEN secret
```

### 3. Add GitHub Secrets

Go to GitHub Repo → Settings → Secrets and Variables → Actions → New Repository Secret

Add all secrets from the table above.

---

## 📊 Deployment Flow

### Frontend Deployment (Vercel)

```
Push to main branch
        ↓
Run tests & build
        ↓
Deploy to Vercel Production
        ↓
https://opstower-v2.vercel.app
```

### Backend Deployment (Azure)

```
Push to main (backend/** changes)
        ↓
Build Docker image → Push to ACR
        ↓
Deploy Bicep infrastructure
        ↓
Run database migrations
        ↓
Update Container App
        ↓
Health check
        ↓
https://opstower-v2-prod-backend...azurecontainerapps.io
```

---

## 🧪 Pull Request Workflow

### For Frontend PRs:
1. Push to feature branch
2. Create PR to `main`
3. CI runs tests
4. Preview deployment created
5. Comment posted with preview URL
6. Review and merge
7. Auto-deploy to production

### For Backend PRs:
1. Push to feature branch
2. Create PR to `main`
3. CI runs tests + Docker build test
4. Review and merge
5. Full deployment to Azure

---

## 🚨 Troubleshooting

### Workflow Not Triggering
- Check branch filters in workflow files
- Verify file path filters match your changes
- Check if secrets are properly set

### Azure Deployment Fails
```bash
# Check Azure credentials are valid
az login --service-principal \
  --username $(echo $AZURE_CREDENTIALS | jq -r .clientId) \
  --password $(echo $AZURE_CREDENTIALS | jq -r .clientSecret) \
  --tenant $(echo $AZURE_CREDENTIALS | jq -r .tenantId)

# Verify resource group exists
az group show --name opstower-v2-rg
```

### Vercel Deployment Fails
```bash
# Verify token
vercel whoami

# Test local build
vercel build

# Deploy manually
vercel --prod
```

### Database Migration Fails
- Check PostgreSQL firewall rules
- Verify password in secrets
- Check DATABASE_URL format

---

## 📈 Monitoring

### GitHub Actions
- Go to Actions tab in GitHub repo
- View workflow runs and logs
- Check job status and artifacts

### Azure Resources
```bash
# View Container App logs
az containerapp logs show \
  --name opstower-v2-prod-backend \
  --resource-group opstower-v2-rg \
  --follow

# Check Container App status
az containerapp show \
  --name opstower-v2-prod-backend \
  --resource-group opstower-v2-rg
```

### Vercel Dashboard
- Go to vercel.com/dashboard
- View deployments and analytics
- Check build logs

---

## 🔧 Manual Deployment

If CI/CD fails, you can deploy manually:

### Frontend
```bash
vercel --prod
```

### Backend
```bash
cd infrastructure/azure
./deploy.sh prod
```

---

## 📝 Notes

- **Infrastructure as Code**: All Azure resources defined in Bicep
- **Immutable Deployments**: Each deployment gets unique image tag
- **Database Safety**: Migrations run before app deployment
- **Health Checks**: Backend health verified before marking successful
- **Rollbacks**: Use Container App revision management in Azure Portal
