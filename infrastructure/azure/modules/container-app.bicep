@description('Name of the Container App')
param name string

@description('Azure region')
param location string = resourceGroup().location

@description('Container App Environment ID')
param containerAppEnvironmentId string

@description('Container image to deploy')
param image string

@description('Container registry login server')
param containerRegistryLoginServer string

@description('Container registry name')
param containerRegistryName string

@description('Target port')
param targetPort int = 8080

@description('CPU cores')
param cpu string = '0.5'

@description('Memory')
param memory string = '1Gi'

@description('Minimum replicas')
param minReplicas int = 1

@description('Maximum replicas')
param maxReplicas int = 5

@description('Environment variables')
param envVars array = []

@description('Secrets')
param secrets array = []

// Build the full secrets array including registry password
var registryPassword = {
  name: 'registry-password'
  value: listCredentials(resourceId('Microsoft.ContainerRegistry/registries', containerRegistryName), '2023-07-01').passwords[0].value
}
var allSecrets = concat(secrets, [registryPassword])

resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: name
  location: location
  properties: {
    managedEnvironmentId: containerAppEnvironmentId
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: targetPort
        traffic: [
          {
            weight: 100
            latestRevision: true
          }
        ]
      }
      secrets: allSecrets
      registries: [
        {
          server: containerRegistryLoginServer
          username: listCredentials(resourceId('Microsoft.ContainerRegistry/registries', containerRegistryName), '2023-07-01').username
          passwordSecretRef: 'registry-password'
        }
      ]
    }
    template: {
      // revisionSuffix omitted - let Azure manage for idempotency
      containers: [
        {
          name: name
          image: image
          env: envVars
          resources: {
            cpu: json(cpu)
            memory: memory
          }
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/health'
                port: targetPort
              }
              initialDelaySeconds: 5
              periodSeconds: 10
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/health'
                port: targetPort
              }
              initialDelaySeconds: 3
              periodSeconds: 5
            }
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
        rules: [
          {
            name: 'http-rule'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
}

output id string = containerApp.id
output name string = containerApp.name
output url string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
