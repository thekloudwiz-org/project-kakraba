# Generate RSA key pair for CloudFront signed URLs if not provided
resource "tls_private_key" "cloudfront_key" {
  count     = var.cloudfront_private_key_pem == "" ? 1 : 0
  algorithm = "RSA"
  rsa_bits  = 2048
}

locals {
  # Use provided key or generated key
  private_key_pem = var.cloudfront_private_key_pem != "" ? var.cloudfront_private_key_pem : tls_private_key.cloudfront_key[0].private_key_pem
  public_key_pem  = var.cloudfront_private_key_pem != "" ? "" : tls_private_key.cloudfront_key[0].public_key_pem
}

# CloudFront Origin Access Identity for secure S3 access
resource "aws_cloudfront_origin_access_identity" "content" {
  comment = "${var.project_name}-${var.environment}-content-oai"
}

# CloudFront public key for signed URLs
resource "aws_cloudfront_public_key" "signing_key" {
  comment     = "${var.project_name}-${var.environment}-signing-key"
  encoded_key = local.public_key_pem != "" ? local.public_key_pem : file("${path.module}/public_key.pem")
  name        = "${var.project_name}-${var.environment}-signing-key"
}

# CloudFront key group
resource "aws_cloudfront_key_group" "signing_key_group" {
  name    = "${var.project_name}-${var.environment}-key-group"
  comment = "Key group for signed URLs"
  items   = [aws_cloudfront_public_key.signing_key.id]
}

# CloudFront distribution
resource "aws_cloudfront_distribution" "content" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project_name}-${var.environment} content delivery"
  default_root_object = ""
  price_class         = "PriceClass_100" # Use only North America and Europe

  origin {
    domain_name = var.s3_bucket_regional_domain
    origin_id   = "S3-${var.s3_bucket_id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.content.cloudfront_access_identity_path
    }
  }

  # Default cache behavior for all content
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${var.s3_bucket_id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    # Use managed cache policy for optimized caching
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized

    # Trusted key groups for signed URLs
    trusted_key_groups = [aws_cloudfront_key_group.signing_key_group.id]
  }

  # Cache behavior for audio files
  ordered_cache_behavior {
    path_pattern           = "audio/*"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${var.s3_bucket_id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = false # Don't compress audio files

    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"

    trusted_key_groups = [aws_cloudfront_key_group.signing_key_group.id]
  }

  # Cache behavior for video files
  ordered_cache_behavior {
    path_pattern           = "video/*"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${var.s3_bucket_id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = false # Don't compress video files

    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"

    trusted_key_groups = [aws_cloudfront_key_group.signing_key_group.id]
  }

  # Cache behavior for documents (books, PDFs)
  ordered_cache_behavior {
    path_pattern           = "documents/*"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${var.s3_bucket_id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"

    trusted_key_groups = [aws_cloudfront_key_group.signing_key_group.id]
  }

  # Cache behavior for images (art)
  ordered_cache_behavior {
    path_pattern           = "images/*"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${var.s3_bucket_id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"

    trusted_key_groups = [aws_cloudfront_key_group.signing_key_group.id]
  }

  # Custom error responses
  custom_error_response {
    error_code         = 403
    response_code      = 403
    response_page_path = "/errors/403.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 404
    response_page_path = "/errors/404.html"
  }

  # Restrictions
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL/TLS certificate
  viewer_certificate {
    cloudfront_default_certificate = true
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  # Access logging to dedicated S3 bucket
  logging_config {
    include_cookies = false
    bucket          = var.cloudfront_logs_bucket_domain_name
    prefix          = "cloudfront/"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-cdn"
    }
  )

  # Wait for deployment to complete before marking as successful
  wait_for_deployment = true

  # Ignore viewer_certificate changes since AWS manages this for default certificate
  lifecycle {
    ignore_changes = [
      viewer_certificate[0].minimum_protocol_version
    ]
  }
}


# Store CloudFront private key in Secrets Manager
resource "aws_secretsmanager_secret" "cloudfront_private_key" {
  name        = "${var.project_name}-${var.environment}-cloudfront-private-key"
  description = "CloudFront private key for generating signed URLs"

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-cloudfront-private-key"
    }
  )
}

resource "aws_secretsmanager_secret_version" "cloudfront_private_key" {
  secret_id     = aws_secretsmanager_secret.cloudfront_private_key.id
  secret_string = local.private_key_pem
}
