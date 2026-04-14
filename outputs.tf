output "cluster_name" {
  description = "The name of the GKE cluster"
  value       = google_container_cluster.primary.name
}

output "cluster_endpoint" {
  description = "The IP address of this cluster's Kubernetes master"
  value       = google_container_cluster.primary.endpoint
}

output "cluster_location" {
  description = "The location (region or zone) in which the cluster resides"
  value       = google_container_cluster.primary.location
}
