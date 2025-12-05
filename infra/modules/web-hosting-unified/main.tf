# S3 Bucket for unified website hosting
resource "aws_s3_bucket" "website" {
  bucket = "${var.project_name}-${var.environment}-website"

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-website"
    }
  )
}

# Block all public access to S3 bucket
resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 bucket versioning
resource "aws_s3_bucket_versioning" "website" {
  bucket = aws_s3_bucket.website.id

  versioning_configuration {
    status = "Enabled"
  }
}

# CloudFront Origin Access Identity
resource "aws_cloudfront_origin_access_identity" "website" {
  comment = "${var.project_name}-${var.environment}-website-oai"
}

# CloudFront Function for URI rewriting (SPA routing)
resource "aws_cloudfront_function" "uri_rewrite" {
  name    = "${var.project_name}-${var.environment}-uri-rewrite"
  runtime = "cloudfront-js-1.0"
  comment = "Rewrite URIs for SPA routing across landing page and portals"
  publish = true
  code    = file("${path.module}/../../cloudfront-function-uri-rewrite.js")
}

# CloudFront Cache Policy for optimized caching
resource "aws_cloudfront_cache_policy" "optimized_caching" {
  name        = "${var.project_name}-${var.environment}-optimized-cache"
  comment     = "Optimized caching policy for static assets"
  min_ttl     = 0
  default_ttl = 86400      # 24 hours
  max_ttl     = 31536000   # 1 year

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }

    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

# CloudFront Origin Request Policy for forwarding necessary headers
resource "aws_cloudfront_origin_request_policy" "s3_origin" {
  name    = "${var.project_name}-${var.environment}-s3-origin"
  comment = "Origin request policy for S3 static assets"

  cookies_config {
    cookie_behavior = "none"
  }

  headers_config {
    header_behavior = "whitelist"
    headers {
      items = ["Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"]
    }
  }

  query_strings_config {
    query_string_behavior = "none"
  }
}

# CloudFront Response Headers Policy for security headers
resource "aws_cloudfront_response_headers_policy" "security_headers" {
  name    = "${var.project_name}-${var.environment}-security-headers"
  comment = "Security headers policy for ${var.project_name}"

  security_headers_config {
    # Content Security Policy
    content_security_policy {
      content_security_policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cognito-idp.*.amazonaws.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.amazonaws.com https://api.stripe.com https://cognito-idp.*.amazonaws.com; frame-src https://js.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self';"
      override                = true
    }

    # HTTP Strict Transport Security (HSTS)
    strict_transport_security {
      access_control_max_age_sec = 31536000 # 1 year
      include_subdomains         = true
      preload                    = true
      override                   = true
    }

    # X-Content-Type-Options
    content_type_options {
      override = true
    }

    # X-Frame-Options
    frame_options {
      frame_option = "DENY"
      override     = true
    }

    # X-XSS-Protection
    xss_protection {
      mode_block = true
      protection = true
      override   = true
    }

    # Referrer-Policy
    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }
  }

  # Custom headers
  custom_headers_config {
    items {
      header   = "Permissions-Policy"
      value    = "geolocation=(), microphone=(), camera=()"
      override = true
    }
  }
}

# S3 bucket policy to allow CloudFront access
resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontOAI"
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.website.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.website.arn}/*"
      }
    ]
  })
}

# CloudFront distribution with path-based behaviors
resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [var.domain_name]
  price_class         = "PriceClass_100"
  comment             = "${var.project_name}-${var.environment} unified website"

  origin {
    domain_name = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.website.id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.website.cloudfront_access_identity_path
    }
  }

  # Default behavior for landing page (/)
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.website.id}"

    # Use managed cache policy for better performance
    cache_policy_id            = aws_cloudfront_cache_policy.optimized_caching.id
    origin_request_policy_id   = aws_cloudfront_origin_request_policy.s3_origin.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.uri_rewrite.arn
    }
  }

  # Behavior for creator portal (/creator/*)
  ordered_cache_behavior {
    path_pattern     = "/creator/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.website.id}"

    # Use managed cache policy for better performance
    cache_policy_id            = aws_cloudfront_cache_policy.optimized_caching.id
    origin_request_policy_id   = aws_cloudfront_origin_request_policy.s3_origin.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.uri_rewrite.arn
    }
  }

  # Behavior for fan portal (/fan/*)
  ordered_cache_behavior {
    path_pattern     = "/fan/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.website.id}"

    # Use managed cache policy for better performance
    cache_policy_id            = aws_cloudfront_cache_policy.optimized_caching.id
    origin_request_policy_id   = aws_cloudfront_origin_request_policy.s3_origin.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.uri_rewrite.arn
    }
  }

  # Behavior for static assets with hash in filename (immutable)
  # These can be cached for a very long time
  ordered_cache_behavior {
    path_pattern     = "/assets/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.website.id}"

    cache_policy_id            = aws_cloudfront_cache_policy.optimized_caching.id
    origin_request_policy_id   = aws_cloudfront_origin_request_policy.s3_origin.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # Behavior for creator portal assets
  ordered_cache_behavior {
    path_pattern     = "/creator/assets/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.website.id}"

    cache_policy_id            = aws_cloudfront_cache_policy.optimized_caching.id
    origin_request_policy_id   = aws_cloudfront_origin_request_policy.s3_origin.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # Behavior for fan portal assets
  ordered_cache_behavior {
    path_pattern     = "/fan/assets/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.website.id}"

    cache_policy_id            = aws_cloudfront_cache_policy.optimized_caching.id
    origin_request_policy_id   = aws_cloudfront_origin_request_policy.s3_origin.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # Custom error responses for SPA routing
  # For landing page and general 404s
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
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-website-cdn"
    }
  )
}

# Route53 A record for custom domain
resource "aws_route53_record" "website" {
  zone_id = var.route53_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53 AAAA record for IPv6
resource "aws_route53_record" "website_ipv6" {
  zone_id = var.route53_zone_id
  name    = var.domain_name
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}
