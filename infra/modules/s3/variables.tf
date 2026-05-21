variable "environment" {
  type = string
}

variable "bucket_name" {
    description = "S3 bucket name"
    type = string
}

variable "purpose" {
    description = "Purpose of the S3 bucket (e.g., 'logs', 'backups')"
    type = string
}

variable "enable_object_lock" {
    description = "Whether to enable S3 Object Lock for compliance purposes"
    type = bool
    default = false
}

variable "object_lock_retention_days" {
    description = "Number of days to retain objects when Object Lock is enabled"
    type = number
    default = 2555
}