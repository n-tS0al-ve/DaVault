# Infrastructure and Kubernetes Deployment Guide

This guide explains how to use the provided Terraform scripts to deploy a Google Kubernetes Engine (GKE) cluster and how the Next.js app interacts with it.

## 1. Deploying the GKE Cluster (Terraform)

The `infra/terraform` directory contains the configuration to provision a GKE cluster on Google Cloud Platform (GCP).

### Prerequisites
*   [Terraform](https://developer.hashicorp.com/terraform/downloads) installed.
*   [Google Cloud SDK (`gcloud`)](https://cloud.google.com/sdk/docs/install) installed and configured.
*   A Google Cloud Project with Billing enabled.

### Steps
1. Navigate to the Terraform directory:
   ```bash
   cd infra/terraform
   ```
2. Authenticate with Google Cloud (if you haven't already):
   ```bash
   gcloud auth application-default login
   ```
3. Initialize the Terraform workspace:
   ```bash
   terraform init
   ```
4. Review the deployment plan:
   ```bash
   terraform plan -var="project_id=YOUR_GCP_PROJECT_ID"
   ```
5. Apply the configuration to create the cluster (this takes ~10-15 minutes):
   ```bash
   terraform apply -var="project_id=YOUR_GCP_PROJECT_ID"
   ```

## 2. Connecting the App to the Cluster

Once the cluster is running, the Next.js app needs to be able to communicate with it to create game servers.

### Local Development
To test Kubernetes deployments from your local machine, you need to configure your local `kubeconfig`:

1. Get the credentials for your new GKE cluster:
   ```bash
   gcloud container clusters get-credentials $(terraform output -raw kubernetes_cluster_name) --region $(terraform output -raw region)
   ```
2. The Next.js app uses the `@kubernetes/client-node` library, which automatically reads the default configuration from `~/.kube/config`. When you run the Next.js app locally (`npm run dev`), it will be able to create Deployments and Services on the remote GKE cluster!

### Production Deployment
When deploying this Next.js app into production (e.g., hosting it on Vercel or inside the GKE cluster itself):
*   **In-Cluster:** If you deploy the Next.js app as a pod *inside* the same GKE cluster, the Kubernetes client automatically authenticates using the default Service Account. No extra configuration is needed.
*   **External Hosting (e.g., Vercel):** You will need to extract a `kubeconfig` string or a Service Account Token from GKE and provide it to the Next.js app as an environment variable (e.g., `KUBECONFIG_BASE64`) and parse it on startup.
