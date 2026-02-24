# Azure Deployment Guide - OpsTower V2 Backend

This guide covers deploying the OpsTower V2 backend to Azure using Container Apps and Azure Database for PostgreSQL.

---

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Azure                                │
│  ┌─────────────────────┐    ┌──────────────────────────┐   │
│  │  Container App      │    │  PostgreSQL Flexible     │   │
│  │  (Fastify API)      │───▶│  Server                  │   │
│  │                     │    │                          │   │
│  │  - Auto-scaling     │    │  - Azure-managed DB      │   │
│  │  - HTTPS ingress    │    │  - Automated backups     │   │
│  │  - Health probes    │    │  - Private network       │   │
│  └─────────────────────┘    └──────────────────────────┘   │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────────┐    ┌──────────────────────────┐   │
│  │  Container Registry │    │  Application Insights    │   │
│  │  (ACR)              │    │  (Monitoring)            │   │
│  └─────────────────────┘    └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Deploy (5 minutes)

### Prerequisites
- Azure CLI installed: `az --version`
- Docker installed: `docker --version`
- Azure subscription with permissions

### 1. Login to Azure
```bash
az login
az account set --subscription "Your Subscription Name"
```

### 2. Run Deployment Script
```bash
cd infrastructure/azure
chmod +x deploy.sh
./deploy.sh prod
```

### 3. Set Environment Variables
The script will prompt for:
- `POSTGRES_ADMIN_PASSWORD` - Database admin password
- `JWT_SECRET` - Secret for JWT signing

---

## 🔧 Manual Deployment

### Step 1: Create Resource Group
```bash
az group create \
  --name opstower-v2-rg \
  --location southeastasia \
  --tags environment=prod application=opstower
```

### Step 2: Deploy Infrastructure (Bicep)
```bash
az deployment group create \
  --resource-group opstower-v2-rg \
  --template-file infrastructure/azure/main.bicep \
  --parameters \
    appName=opstower-v2 \
    environment=prod \
    postgresAdminPassword="YOUR_STRONG_PASSWORD" \
    jwtSecret="YOUR_JWT_SECRET"
```

### Step 3: Build and Push Docker Image
```bash
# Get ACR name
ACR_NAME=$(az acr list --resource-group opstower-v2-rg --query "[0].name" -o tsv)
az acr login --name $ACR_NAME

# Build and push
cd backend
docker build -t $ACR_NAME.azurecr.io/opstower-backend:latest .
docker push $ACR_NAME.azurecr.io/opstower-backend:latest
```

### Step 4: Run Database Migrations
```bash
# Get PostgreSQL FQDN
PG_FQDN=$(az postgres flexible-server list --resource-group opstower-v2-rg --query "[0].fullyQualifiedDomainName" -o tsv)

# Set connection string
export DATABASE_URL="postgresql://opstoweradmin:YOUR_PASSWORD@$PG_FQDN:5432/opstower?schema=public"

# Run migrations
cd backend
npx prisma migrate deploy
```

### Step 5: Update Container App
```bash
CONTAINER_APP_NAME=$(az containerapp list --resource-group opstower-v2-rg --query "[?contains(name, 'backend')].name" -o tsv)

az containerapp update \
  --name $CONTAINER_APP_NAME \
  --resource-group opstower-v2-rg \
  --image $ACR_NAME.azurecr.io/opstower-backend:latest
```

### Step 6: Configure Frontend
Update the frontend `.env` file to point to the deployed backend:

```bash
# Get the backend URL
BACKEND_URL=$(az containerapp show \
  --name $CONTAINER_APP_NAME \
  --resource-group opstower-v2-rg \
  --query 'properties.configuration.ingress.fqdn' -o tsv)

# Update frontend configuration
echo "VITE_BACKEND_URL=https://$BACKEND_URL" >> ../.env.production
```

Or manually update `.env`:
```env
VITE_BACKEND_URL=https://<your-backend-url>.azurecontainerapps.io
```

Then rebuild the frontend:
```bash
cd ..
npm run build
```

---

## 🔐 GitHub Actions Deployment

### 1. Create Azure Service Principal
```bash
az ad sp create-for-rbac \
  --name "opstower-github-actions" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/opstower-v2-rg \
  --sdk-auth
```

### 2. Add GitHub Secrets
Go to GitHub Repo → Settings → Secrets and Variables → Actions

Add these secrets:
```
AZURE_CREDENTIALS          # JSON output from step 1
AZURE_SUBSCRIPTION_ID      # Your subscription ID
POSTGRES_ADMIN_PASSWORD    # PostgreSQL admin password
POSTGRES_ADMIN_USERNAME    # opstoweradmin
JWT_SECRET                 # Your JWT secret
ACR_PASSWORD               # ACR admin password (optional)
```

### 3. Deploy via GitHub Actions
Push to `main` or `feature/port-all-features` branch - deployment happens automatically!

Or manually trigger:
- Go to Actions → Deploy Backend to Azure
- Click "Run workflow"

---

## 📊 Azure Resources Created

| Resource | Purpose | Cost Tier |
|----------|---------|-----------|
| Container App | Backend API hosting | Consumption (pay-per-use) |
| PostgreSQL Flexible | Database | Burstable B1ms (~$12/mo) |
| Container Registry | Docker image storage | Basic (~$5/mo) |
| Log Analytics | Logging | Pay-per-GB |
| Application Insights | Monitoring | Free tier available |

**Estimated Monthly Cost: $20-50** (depending on usage)

---

## 🔍 Monitoring & Logs

### View Container Logs
```bash
CONTAINER_APP_NAME=$(az containerapp list --resource-group opstower-v2-rg --query "[?contains(name, 'backend')].name" -o tsv)

az containerapp logs show \
  --name $CONTAINER_APP_NAME \
  --resource-group opstower-v2-rg \
  --follow
```

### Application Insights
1. Go to Azure Portal → Application Insights
2. Select your resource
3. View Live Metrics, Failures, Performance

### Log Analytics Queries
```kusto
// View recent logs
ContainerAppConsoleLogs_CL
| where ContainerAppName_s contains "backend"
| order by TimeGenerated desc
| take 50
```

---

## 🔄 Updating the Backend

### Method 1: GitHub Actions (Recommended)
Just push to main branch - CI/CD handles everything!

### Method 2: Azure CLI
```bash
# Build new image
docker build -t $ACR_NAME.azurecr.io/opstower-backend:v1.1 ./backend
docker push $ACR_NAME.azurecr.io/opstower-backend:v1.1

# Update container app
az containerapp update \
  --name opstower-v2-prod-backend \
  --resource-group opstower-v2-rg \
  --image $ACR_NAME.azurecr.io/opstower-backend:v1.1
```

### Method 3: Azure Portal
1. Go to Container Apps
2. Select your app
3. Revision management → New revision
4. Update image tag

---

## 🛠️ Troubleshooting

### Container Won't Start
```bash
# Check logs
az containerapp logs show --name APP_NAME --resource-group opstower-v2-rg

# Check events
az containerapp show --name APP_NAME --resource-group opstower-v2-rg --query properties.latestRevisionProperties
```

### Database Connection Issues
```bash
# Test PostgreSQL connection
PG_FQDN=$(az postgres flexible-server list --resource-group opstower-v2-rg --query "[0].fullyQualifiedDomainName" -o tsv)
psql "postgresql://opstoweradmin:PASSWORD@$PG_FQDN:5432/opstower"

# Check firewall rules
az postgres flexible-server firewall-rule list --resource-group opstower-v2-rg --server-name SERVER_NAME
```

### 502 Bad Gateway
- Check if container is healthy: Review health probe settings
- Check logs for startup errors
- Verify port configuration (8080)

---

## 🔒 Security Best Practices

### 1. Use Managed Identities
Update Bicep to use Azure AD authentication instead of passwords.

### 2. Private Networking
Place PostgreSQL in a private subnet with VNet integration.

### 3. HTTPS Only
Container App ingress is HTTPS-only by default.

### 4. Secrets Management
Use Azure Key Vault for storing secrets instead of env vars.

---

## 🌍 Environment Variables

| Variable | Description | Source |
|----------|-------------|--------|
| `DATABASE_URL` | PostgreSQL connection string | Azure PostgreSQL |
| `JWT_SECRET` | JWT signing secret | GitHub Secret |
| `NODE_ENV` | production | Hardcoded |
| `PORT` | 8080 | Hardcoded |
| `LOG_LEVEL` | info | Configurable |

---

## 📚 Additional Resources

- [Azure Container Apps Docs](https://docs.microsoft.com/en-us/azure/container-apps/)
- [Azure PostgreSQL Docs](https://docs.microsoft.com/en-us/azure/postgresql/)
- [Bicep Language](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment/)

---

## 💬 Support

For deployment issues:
1. Check logs: `az containerapp logs show`
2. Review Application Insights
3. Check GitHub Actions logs
4. Consult Azure status page
