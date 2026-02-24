@description('Name of the Log Analytics workspace')
param name string

@description('Azure region')
param location string = resourceGroup().location

@description('Retention period in days')
param retentionDays int = 30

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: name
  location: location
  properties: {
    retentionInDays: retentionDays
    features: {
      searchVersion: 1
    }
    sku: {
      name: 'PerGB2018'
    }
  }
}

output workspaceId string = logAnalytics.id
output customerId string = logAnalytics.properties.customerId
