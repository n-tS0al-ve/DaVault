variable "project_id" {
  description = "The Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "The region to host the cluster in"
  type        = string
  default     = "us-central1"
}

variable "cluster_name" {
  description = "The name of the GKE cluster"
  type        = string
  default     = "gke-boilerplate-cluster"
}

variable "network_name" {
  description = "The VPC network to host the cluster in"
  type        = string
  default     = "default"
}

variable "subnetwork_name" {
  description = "The subnetwork to host the cluster in"
  type        = string
  default     = "default"
}

variable "node_count" {
  description = "Number of nodes in the node pool"
  type        = number
  default     = 3
}

variable "machine_type" {
  description = "The machine type of the compute instances"
  type        = string
  default     = "e2-medium"
}
