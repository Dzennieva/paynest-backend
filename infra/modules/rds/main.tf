terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.45.0"
    }
  }
}

# Security group for RDS instance
resource "aws_security_group" "rds_sg" {
  name        = "allow_tls"
  description = "Allow TLS inbound traffic and all outbound traffic"
  vpc_id      = var.vpc_id

ingress {
    description = "PostgreSQL from within VPC only"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr_block]   
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]   
  }

  tags = {
    Name = "${var.environment}-paynest-rds-sg"
    Environment = var.environment
    Project = "paynest"
  }
}


# RDS subnet group for private subnets
resource "aws_db_subnet_group" "rds_subnet_group" {
  name        = "${var.environment}-paynest-rds-subnet-group"
  description = "RDS subnet group for ${var.environment} environment"
  subnet_ids  = var.private_subnet_ids

  tags = {
    Name = "${var.environment}-paynest-rds-subnet-group"
    Environment = var.environment
    Project = "paynest"
  }
}

# RDS instance
resource "aws_db_instance" "rds" {
  identifier = "${var.environment}-paynest-rds"

  engine     = "postgres"
  engine_version = "15.18"
  instance_class = var.rds_instance_class

  allocated_storage = var.rds_allocated_storage
  max_allocated_storage = var.rds_allocated_storage * 2
  storage_type = "gp3"
  storage_encrypted = true

  db_name = "paynestdb"
  username = var.db_username
  password = var.db_password

  db_subnet_group_name = aws_db_subnet_group.rds_subnet_group.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  publicly_accessible = false

  multi_az = var.multi_az 

  backup_retention_period = var.backup_retention_period
  backup_window = "03:00-04:00"
  maintenance_window = "sun:05:00-sun:06:00"

  skip_final_snapshot = var.environment == "dev" ? true : false
  final_snapshot_identifier = var.environment == "dev" ? "${var.environment}-paynest-rds-final-snapshot" : null
  copy_tags_to_snapshot = true

  performance_insights_enabled = var.environment != "dev"

  deletion_protection = var.environment == "dev" ? false : true

  tags = {
    Name = "${var.environment}-paynest-rds"
    Environment = var.environment
    Project = "paynest"
  }

}

