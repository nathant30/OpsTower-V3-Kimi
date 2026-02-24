@description('Name of the container registry')
param name string

@description('Azure region')
param location string = resourceGroup().location

@description('SKU (Basic, Standard, Premium)')
param sku string = 'Basic'

@description('Enable admin user')
param adminUserEnabled bool = true

@description('Tags to apply to the resource')
param tags object = {}

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: sku
  }
  properties: {
    adminUserEnabled: adminUserEnabled
    networkRuleBypassOptions: 'AzureServices'
    publicNetworkAccess: 'Enabled'
    zoneRedundancy: 'Disabled'
  }
}

output id string = acr.id
output name string = acr.name
output loginServer string = acr.properties.loginServer
