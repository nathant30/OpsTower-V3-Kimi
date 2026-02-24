@description('Name of the application')
param appName string = 'opstower-v2'

@description('Environment (dev, staging, prod)')
param environment string = 'prod'

@description('Azure region')
param location string = resourceGroup().location

@description('PostgreSQL admin username')
param postgresAdminUsername string = 'opstoweradmin'

@description('PostgreSQL admin password')
@secure()
param postgresAdminPassword string

@description('Container image tag')
param imageTag string = 'latest'

@description('Use placeholder image for initial deployment (when ACR is empty)')
param usePlaceholderImage bool = false

@description('JWT Secret')
@secure()
param jwtSecret string

@description('Log level')
param logLevel string = 'info'

// Variables
var resourcePrefix = '${appName}-${environment}'
// ACR names must be alphanumeric only (no hyphens), 5-50 chars, globally unique
var containerRegistryName = '${replace(appName, '-', '')}acr${uniqueString(resourceGroup().id)}'

// Log Analytics Workspace
module logAnalytics 'modules/log-analytics.bicep' = {
  name: 'logAnalytics'
  params: {
    name: '${resourcePrefix}-logs'
    location: location
  }
}

// Application Insights
module appInsights 'modules/app-insights.bicep' = {
  name: 'appInsights'
  params: {
    name: '${resourcePrefix}-insights'
    location: location
    logAnalyticsWorkspaceId: logAnalytics.outputs.workspaceId
  }
}

// Azure Database for PostgreSQL
module postgres 'modules/postgresql.bicep' = {
  name: 'postgres'
  params: {
    serverName: '${resourcePrefix}-postgres'
    location: location
    administratorLogin: postgresAdminUsername
    administratorLoginPassword: postgresAdminPassword
    databaseName: 'opstower'
    skuTier: 'Burstable'
    skuName: 'Standard_B1ms'
    storageSizeGB: 32
  }
}

// Azure Container Registry
module acr 'modules/container-registry.bicep' = {
  name: 'acr'
  params: {
    name: containerRegistryName
    location: location
    sku: 'Basic'
    tags: {
      environment: environment
      application: appName
    }
  }
}

// Container Apps Environment
module containerAppEnv 'modules/container-app-env.bicep' = {
  name: 'containerAppEnv'
  params: {
    name: '${resourcePrefix}-env'
    location: location
    logAnalyticsWorkspaceId: logAnalytics.outputs.workspaceId
  }
}

// Container App (Backend)
module backendApp 'modules/container-app.bicep' = {
  name: 'backendApp'
  params: {
    name: '${resourcePrefix}-backend'
    location: location
    containerAppEnvironmentId: containerAppEnv.outputs.environmentId
    containerRegistryName: containerRegistryName
    containerRegistryLoginServer: acr.outputs.loginServer
    image: usePlaceholderImage ? 'mcr.microsoft.com/k8se/quickstart:latest' : '${acr.outputs.loginServer}/opstower-backend:${imageTag}'
    targetPort: 8080
    cpu: '0.5'
    memory: '1Gi'
    minReplicas: 1
    maxReplicas: 5
    envVars: [
      {
        name: 'NODE_ENV'
        value: 'production'
      }
      {
        name: 'PORT'
        value: '8080'
      }
      {
        name: 'LOG_LEVEL'
        value: logLevel
      }
      {
        name: 'DATABASE_URL'
        value: 'postgresql://${postgresAdminUsername}:${postgresAdminPassword}@${postgres.outputs.fqdn}:5432/opstower?schema=public'
      }
      {
        name: 'JWT_SECRET'
        secretRef: 'jwt-secret'
      }
      {
        name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
        value: appInsights.outputs.connectionString
      }
    ]
    secrets: [
      {
        name: 'jwt-secret'
        value: jwtSecret
      }
    ]
  }
}

// Outputs
output backendUrl string = backendApp.outputs.url
output postgresFqdn string = postgres.outputs.fqdn
output acrLoginServer string = acr.outputs.loginServer
output acrName string = acr.outputs.name
output appInsightsName string = appInsights.outputs.name
