import * as k8s from '@kubernetes/client-node';

// Create a new KubeConfig instance
const kc = new k8s.KubeConfig();

// Load from default locations (~/.kube/config, or in-cluster)
// In a real production deployment inside GKE, it automatically picks up the service account.
if (process.env.NODE_ENV === 'development' && process.env.KUBECONFIG) {
  kc.loadFromFile(process.env.KUBECONFIG);
} else {
  try {
    kc.loadFromDefault();
  } catch (error) {
    console.warn("Could not load default Kubernetes configuration. Kubernetes features will fail.", error);
  }
}

// Export the APIs we need
export const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
export const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);

/**
 * Creates a Kubernetes Deployment and Service for a game server.
 */
export async function createGameServerDeployment(serverId: string, image: string, name: string) {
  const deploymentName = `gameserver-${serverId}`;
  const labels = { app: 'gameserver', serverId: serverId };

  // 1. Create Deployment
  const deployment: k8s.V1Deployment = {
    metadata: {
      name: deploymentName,
      labels: labels,
    },
    spec: {
      replicas: 1,
      selector: { matchLabels: labels },
      template: {
        metadata: { labels: labels },
        spec: {
          containers: [
            {
              name: 'server',
              image: image,
              // We expose a generic port. Specific games need specific ports.
              // For a generic solution, we might need a mapping or let users specify.
              // Assuming a generic default or auto-detect based on image later.
              ports: [{ containerPort: 25565 }], // Defaulting to Minecraft for example, should be dynamic later
              resources: {
                requests: { memory: '1Gi', cpu: '500m' },
                limits: { memory: '2Gi', cpu: '1000m' }
              },
              env: [
                { name: 'EULA', value: 'TRUE' } // Specific to Minecraft, generic approach needed later
              ]
            },
          ],
        },
      },
    },
  };

  await k8sAppsApi.createNamespacedDeployment({
    namespace: 'default',
    body: deployment
  });

  // 2. Create Service (LoadBalancer to expose it publicly)
  const service: k8s.V1Service = {
    metadata: {
      name: `${deploymentName}-svc`,
      labels: labels,
    },
    spec: {
      selector: labels,
      type: 'LoadBalancer',
      ports: [
        {
          port: 25565,
          targetPort: 25565,
          protocol: 'TCP'
        }
      ]
    }
  };

  await k8sCoreApi.createNamespacedService({
    namespace: 'default',
    body: service
  });

  return deploymentName;
}

export async function deleteGameServerDeployment(serverId: string) {
  const deploymentName = `gameserver-${serverId}`;
  
  try {
    await k8sAppsApi.deleteNamespacedDeployment({
      name: deploymentName,
      namespace: 'default',
    });
    
    await k8sCoreApi.deleteNamespacedService({
      name: `${deploymentName}-svc`,
      namespace: 'default'
    });
    return true;
  } catch (error) {
    console.error(`Failed to delete K8s resources for ${serverId}:`, error);
    return false;
  }
}
