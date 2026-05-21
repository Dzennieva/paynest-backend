variable "db_username" {
    description = "Master username for RDS instance"
    type = string
    sensitive = true
}

variable "db_password" {
    description = "Master password for RDS instance"
    type = string
    sensitive = true
}