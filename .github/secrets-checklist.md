# GitHub Secrets Checklist

Add these secrets to your GitHub repository:
**Settings → Secrets and Variables → Actions → New Repository Secret**

---

## ✅ All Secrets Added

| Category | Secret Name | Status |
|----------|-------------|--------|
| **Azure** | `AZURE_CREDENTIALS` | ✅ |
| **Azure** | `AZURE_SUBSCRIPTION_ID` | ✅ |
| **Azure** | `POSTGRES_ADMIN_PASSWORD` | ✅ |
| **Azure** | `JWT_SECRET` | ✅ |
| **Azure** | `ACR_PASSWORD` | ✅ |
| **Vercel** | `VERCEL_TOKEN` | ✅ |
| **Vercel** | `VERCEL_ORG_ID` | ✅ |
| **Vercel** | `VERCEL_PROJECT_ID` | ✅ |
| **App** | `VITE_BACKEND_URL` | ✅ |
| **App** | `VITE_MAPBOX_TOKEN` | ✅ |

---

## 🔑 How to Generate Secrets (for reference)

### AZURE_CREDENTIALS
```bash
az ad sp create-for-rbac \
  --name "opstower-github-actions" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/opstower-v2-rg \
  --sdk-auth
```

### ACR_PASSWORD
```bash
az acr credential show \
  --name YOUR_ACR_NAME \
  --resource-group opstower-v2-rg \
  --query "passwords[0].value" -o tsv
```

### JWT_SECRET
```bash
openssl rand -base64 64
```

### VERCEL_TOKEN
```bash
vercel tokens create
```

---

## 🚀 CI/CD Status

All workflows are configured and ready!
