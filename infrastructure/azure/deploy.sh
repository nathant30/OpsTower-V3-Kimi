#!/bin/bash

# Azure Deployment Script for OpsTower V2 Backend
# Usage: ./deploy.sh [environment]

set -e

# Configuration
RESOURCE_GROUP="opstower-v2-rg"
LOCATION="southeastasia"
ENVIRONMENT=${1:-prod}
APP_NAME="opstower-v2"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}OpsTower V2 - Azure Deployment${NC}"
echo -e "${GREEN}Environment: $ENVIRONMENT${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}Error: Azure CLI is not installed.${NC}"
    echo "Install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if user is logged in
echo -e "${YELLOW}Checking Azure login...${NC}"
az account show &> /dev/null || {
    echo -e "${YELLOW}Please login to Azure:${NC}"
    az login
}

# Get subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo -e "${GREEN}Using subscription: $SUBSCRIPTION_ID${NC}"

# Create resource group (idempotent - no change if already exists)
echo -e "${YELLOW}Creating resource group (if not exists)...${NC}"
az group create \
    --name $RESOURCE_GROUP \
    --location $LOCATION \
    --tags environment=$ENVIRONMENT application=opstower \
    --output none

echo -e "${GREEN}Resource group ready: $RESOURCE_GROUP${NC}"

# Check for required environment variables
if [ -z "$POSTGRES_ADMIN_PASSWORD" ]; then
    echo -e "${YELLOW}Enter PostgreSQL admin password:${NC}"
    read -s POSTGRES_ADMIN_PASSWORD
    export POSTGRES_ADMIN_PASSWORD
fi

if [ -z "$JWT_SECRET" ]; then
    echo -e "${YELLOW}Enter JWT secret:${NC}"
    read -s JWT_SECRET
    export JWT_SECRET
fi

# Deploy Bicep template (idempotent - no change if resources unchanged)
# First deployment uses placeholder image since ACR is empty
echo -e "${YELLOW}Deploying Azure infrastructure (Phase 1: Infrastructure + Placeholder)...${NC}"
az deployment group create \
    --resource-group $RESOURCE_GROUP \
    --template-file main.bicep \
    --parameters \
        appName=$APP_NAME \
        environment=$ENVIRONMENT \
        postgresAdminPassword="$POSTGRES_ADMIN_PASSWORD" \
        jwtSecret="$JWT_SECRET" \
        usePlaceholderImage=true \
    --only-show-errors \
    --output json > deployment_output.json || {
        echo -e "${RED}Infrastructure deployment failed!${NC}"
        rm -f deployment_output.json
        exit 1
    }

# Extract outputs
echo -e "${YELLOW}Extracting deployment outputs...${NC}"
BACKEND_URL=$(cat deployment_output.json | jq -r '.properties.outputs.backendUrl.value')
POSTGRES_FQDN=$(cat deployment_output.json | jq -r '.properties.outputs.postgresFqdn.value')
ACR_LOGIN_SERVER=$(cat deployment_output.json | jq -r '.properties.outputs.acrLoginServer.value')
ACR_NAME=$(cat deployment_output.json | jq -r '.properties.outputs.acrName.value')

# Store script directory
SCRIPT_DIR=$(pwd)

# Build and push Docker image using ACR Build (no local Docker needed)
echo -e "${YELLOW}Building and pushing Docker image...${NC}"

# Generate image tag from timestamp (git may not be available)
IMAGE_TAG=$(date +%Y%m%d-%H%M%S)

# Build and push using Azure ACR Build task (runs in Azure)
az acr build \
    --registry $ACR_NAME \
    --image opstower-backend:$IMAGE_TAG \
    --image opstower-backend:latest \
    ../../backend \
    --only-show-errors

echo -e "${GREEN}Image pushed: $ACR_LOGIN_SERVER/opstower-backend:$IMAGE_TAG${NC}"

# Update Container App with new image
echo -e "${YELLOW}Updating Container App...${NC}"
CONTAINER_APP_NAME=$(az containerapp list --resource-group $RESOURCE_GROUP --query "[?contains(name, 'backend')].name" -o tsv)

az containerapp update \
    --name $CONTAINER_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --image $ACR_LOGIN_SERVER/opstower-backend:$IMAGE_TAG \
    --output none

echo -e "${GREEN}Container App updated: $CONTAINER_APP_NAME${NC}"

# Update Bicep deployment to reflect actual image (for idempotency)
echo -e "${YELLOW}Updating Bicep deployment state with actual image...${NC}"
cd "$SCRIPT_DIR"
az deployment group create \
    --resource-group $RESOURCE_GROUP \
    --template-file main.bicep \
    --parameters \
        appName=$APP_NAME \
        environment=$ENVIRONMENT \
        postgresAdminPassword="$POSTGRES_ADMIN_PASSWORD" \
        jwtSecret="$JWT_SECRET" \
        usePlaceholderImage=false \
        imageTag=$IMAGE_TAG \
    --only-show-errors \
    --output none

echo -e "${GREEN}Bicep state updated${NC}"

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
export DATABASE_URL="postgresql://opstoweradmin:$POSTGRES_ADMIN_PASSWORD@$POSTGRES_FQDN:5432/opstower?schema=public"
cd ../../backend

# Check if migrations folder exists
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
    echo -e "${YELLOW}Deploying existing migrations...${NC}"
    npx prisma migrate deploy
else
    echo -e "${YELLOW}No migrations found. Using prisma db push for initial schema sync...${NC}"
    echo -e "${YELLOW}Note: For production, create migrations with 'npx prisma migrate dev' in development${NC}"
    npx prisma db push --accept-data-loss
fi

cd "$SCRIPT_DIR"

echo -e "${GREEN}Database migrations completed!${NC}"

# Cleanup
rm -f deployment_output.json

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Backend URL: ${YELLOW}$BACKEND_URL${NC}"
echo -e "PostgreSQL: ${YELLOW}$POSTGRES_FQDN${NC}"
echo -e "Container Registry: ${YELLOW}$ACR_LOGIN_SERVER${NC}"
echo ""
echo -e "${GREEN}You can now configure your frontend to use:${NC}"
echo -e "VITE_BACKEND_URL=$BACKEND_URL"
