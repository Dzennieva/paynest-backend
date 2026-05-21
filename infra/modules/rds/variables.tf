variable "environment" {
  description = "Environment name"
  type = string
}
variable "vpc_id" {
  description = "VPC ID"
  type = string
}

variable "vpc_cidr_block" {
    description = "CIDR block of the VPC"
    type = string 
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs"
  type = list(string)
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type = string
  default = "db.t3.micro"
}

variable "rds_allocated_storage" {
  description = "Initial allocated storage in GB"
  type = number
  default = 20
}

variable "db_username" {
    description = "Master username for RDS instance"
    type = string
    default = "admin"
    sensitive = true
}

variable "db_password" {
    description = "Master password for RDS instance"
    type = string
    sensitive = true
}

variable "multi_az" {
    description = "Whether to enable Multi-AZ deployment"
    type = bool
    default = false
}
variable "backup_retention_period" {
    description = "Number of days to retain backups"
    type = number
    default = 7  
}