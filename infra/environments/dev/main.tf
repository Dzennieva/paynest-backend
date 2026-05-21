terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.45.0"
    }
  }


  backend "s3" {
    bucket         = "paynest-terraform-state-255083651542-eu-west-1-an"
    key            = "paynest/dev/terraform.tfstate"
    region         = "eu-west-1"
    use_lockfile = true
    encrypt        = true
  }
}

provider "aws" {
  region = "eu-west-1"

  default_tags {
    tags = {
      Project = "paynest"
      Environment = "dev"
      ManagedBy = "terraform"
    }
  }
}

# VPC module
module "vpc" {
    source = "../../modules/vpc"
    
    environment = "dev"
    vpc_cidr_block = "10.0.0.0/16"
    availability_zones = ["eu-west-1a", "eu-west-1b"]
    public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
    private_subnet_cidrs = ["10.0.3.0/24", "10.0.4.0/24"] 
}

# RDS module
module "rds" {
    source = "../../modules/rds"

    environment = "dev"
    vpc_id = module.vpc.vpc_id
    vpc_cidr_block = module.vpc.vpc_cidr_block
    private_subnet_ids = module.vpc.private_subnet_ids

    rds_instance_class = "db.t3.micro"
    rds_allocated_storage = 20
    multi_az = false
    backup_retention_period = 1

    db_username = var.db_username
    db_password = var.db_password
}

# S3 module
module "audit_logs" {
    source = "../../modules/s3"

    environment = "dev"
    bucket_name = "paynest-dev-bucket"
    purpose = "audit-logs"

   enable_object_lock = false
}