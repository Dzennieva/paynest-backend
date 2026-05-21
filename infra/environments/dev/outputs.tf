output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "db_endpoint" {
    description = "RDS instance endpoint"
    value       = module.rds.db_endpoint
}

output "audit_logs_bucket_name" {
    description = "Name of the S3 bucket"
    value       = module.audit_logs.bucket_name
}