output "db_endpoint" {
    description = "RDS instance endpoint"
    value       = aws_db_instance.rds.endpoint
}

output "db_port" {
    description = "RDS instance port"
    value       = aws_db_instance.rds.port
}

output "db_name" {
    description = "RDS instance name"
    value       = aws_db_instance.rds.db_name
}

output "db_instance_id" {
    description = "RDS instance identifier"
    value       = aws_db_instance.rds.id
}