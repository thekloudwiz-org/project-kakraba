# ============================================================================
# Creator Portal Infrastructure (create-kakraba.thekloudwiz.com)
# ============================================================================

# S3 Bucket for Creator Portal
resource "aws_s3_bucket" "creator_portal" {
  bucket        = "${var.project_name}-${var.environment}-creator-portal"
  force_destroy = true

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-creator-portal"
    }
  )
}

# Block all public access to Creator Portal bucket
resource "aws_s3_bucket_public_access_block" "creator_portal" {
  bucket = aws_s3_bucket.creator_portal.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 bucket versioning for Creator Portal
resource "aws_s3_bucket_versioning" "creator_portal" {
  bucket = aws_s3_bucket.creator_portal.id

  versioning_configuration {
    status = "Enabled"
  }
}

# CloudFront Origin Access Identity for Creator Portal
resource "aws_cloudfront_origin_access_identity" "creator_portal" {
  comment = "${var.project_name}-${var.environment}-creator-portal-oai"
}

# S3 bucket policy for Creator Portal
resource "aws_s3_bucket_policy" "creator_portal" {
  bucket = aws_s3_bucket.creator_portal.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontOAI"
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.creator_portal.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.creator_portal.arn}/*"
      }
    ]
  })
}

# CloudFront distribution for Creator Portal
resource "aws_cloudfront_distribution" "creator_portal" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [var.creator_domain]
  price_class         = "PriceClass_100"
  comment             = "${var.project_name}-${var.environment} creator portal"

  origin {
    domain_name = aws_s3_bucket.creator_portal.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.creator_portal.id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.creator_portal.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.creator_portal.id}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # Custom error responses for SPA routing
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.creator_acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-creator-portal-cdn"
    }
  )
}

# Route53 A record for Creator Portal
resource "aws_route53_record" "creator_portal" {
  zone_id = var.route53_zone_id
  name    = var.creator_domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.creator_portal.domain_name
    zone_id                = aws_cloudfront_distribution.creator_portal.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53 AAAA record for Creator Portal (IPv6)
resource "aws_route53_record" "creator_portal_ipv6" {
  zone_id = var.route53_zone_id
  name    = var.creator_domain
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.creator_portal.domain_name
    zone_id                = aws_cloudfront_distribution.creator_portal.hosted_zone_id
    evaluate_target_health = false
  }
}

# ============================================================================
# Fan Portal Infrastructure (fan-kakraba.thekloudwiz.com)
# ============================================================================

# S3 Bucket for Fan Portal
resource "aws_s3_bucket" "fan_portal" {
  bucket        = "${var.project_name}-${var.environment}-fan-portal"
  force_destroy = true

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-fan-portal"
    }
  )
}

# Block all public access to Fan Portal bucket
resource "aws_s3_bucket_public_access_block" "fan_portal" {
  bucket = aws_s3_bucket.fan_portal.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 bucket versioning for Fan Portal
resource "aws_s3_bucket_versioning" "fan_portal" {
  bucket = aws_s3_bucket.fan_portal.id

  versioning_configuration {
    status = "Enabled"
  }
}

# CloudFront Origin Access Identity for Fan Portal
resource "aws_cloudfront_origin_access_identity" "fan_portal" {
  comment = "${var.project_name}-${var.environment}-fan-portal-oai"
}

# S3 bucket policy for Fan Portal
resource "aws_s3_bucket_policy" "fan_portal" {
  bucket = aws_s3_bucket.fan_portal.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontOAI"
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.fan_portal.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.fan_portal.arn}/*"
      }
    ]
  })
}

# CloudFront distribution for Fan Portal
resource "aws_cloudfront_distribution" "fan_portal" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [var.fan_domain]
  price_class         = "PriceClass_100"
  comment             = "${var.project_name}-${var.environment} fan portal"

  origin {
    domain_name = aws_s3_bucket.fan_portal.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.fan_portal.id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.fan_portal.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.fan_portal.id}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # Custom error responses for SPA routing
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.fan_acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-fan-portal-cdn"
    }
  )
}

# Route53 A record for Fan Portal
resource "aws_route53_record" "fan_portal" {
  zone_id = var.route53_zone_id
  name    = var.fan_domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.fan_portal.domain_name
    zone_id                = aws_cloudfront_distribution.fan_portal.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53 AAAA record for Fan Portal (IPv6)
resource "aws_route53_record" "fan_portal_ipv6" {
  zone_id = var.route53_zone_id
  name    = var.fan_domain
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.fan_portal.domain_name
    zone_id                = aws_cloudfront_distribution.fan_portal.hosted_zone_id
    evaluate_target_health = false
  }
}

# ============================================================================
# Landing Page Infrastructure (kakraba.thekloudwiz.com)
# ============================================================================

# S3 Bucket for Landing Page
resource "aws_s3_bucket" "landing_page" {
  bucket        = "${var.project_name}-${var.environment}-landing-page"
  force_destroy = true

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-landing-page"
    }
  )
}

# Block all public access to Landing Page bucket
resource "aws_s3_bucket_public_access_block" "landing_page" {
  bucket = aws_s3_bucket.landing_page.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 bucket versioning for Landing Page
resource "aws_s3_bucket_versioning" "landing_page" {
  bucket = aws_s3_bucket.landing_page.id

  versioning_configuration {
    status = "Enabled"
  }
}

# CloudFront Origin Access Identity for Landing Page
resource "aws_cloudfront_origin_access_identity" "landing_page" {
  comment = "${var.project_name}-${var.environment}-landing-page-oai"
}

# S3 bucket policy for Landing Page
resource "aws_s3_bucket_policy" "landing_page" {
  bucket = aws_s3_bucket.landing_page.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontOAI"
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.landing_page.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.landing_page.arn}/*"
      }
    ]
  })
}

# CloudFront distribution for Landing Page
resource "aws_cloudfront_distribution" "landing_page" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [var.landing_domain]
  price_class         = "PriceClass_100"
  comment             = "${var.project_name}-${var.environment} landing page"

  origin {
    domain_name = aws_s3_bucket.landing_page.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.landing_page.id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.landing_page.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.landing_page.id}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # Custom error responses for SPA routing
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.landing_acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-landing-page-cdn"
    }
  )
}

# Route53 A record for Landing Page
resource "aws_route53_record" "landing_page" {
  zone_id = var.route53_zone_id
  name    = var.landing_domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.landing_page.domain_name
    zone_id                = aws_cloudfront_distribution.landing_page.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53 AAAA record for Landing Page (IPv6)
resource "aws_route53_record" "landing_page_ipv6" {
  zone_id = var.route53_zone_id
  name    = var.landing_domain
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.landing_page.domain_name
    zone_id                = aws_cloudfront_distribution.landing_page.hosted_zone_id
    evaluate_target_health = false
  }
}
