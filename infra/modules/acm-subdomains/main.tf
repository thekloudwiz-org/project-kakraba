# ACM Certificate for Creator Portal (create-kakraba.thekloudwiz.com)
resource "aws_acm_certificate" "creator_portal" {
  provider          = aws.us_east_1
  domain_name       = var.creator_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.creator_domain}-certificate"
    }
  )
}

# DNS validation record for Creator Portal
resource "aws_route53_record" "creator_portal_validation" {
  for_each = {
    for dvo in aws_acm_certificate.creator_portal.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.zone_id
}

# Certificate validation for Creator Portal
resource "aws_acm_certificate_validation" "creator_portal" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.creator_portal.arn
  validation_record_fqdns = [for record in aws_route53_record.creator_portal_validation : record.fqdn]
}

# ACM Certificate for Fan Portal (fan-kakraba.thekloudwiz.com)
resource "aws_acm_certificate" "fan_portal" {
  provider          = aws.us_east_1
  domain_name       = var.fan_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.fan_domain}-certificate"
    }
  )
}

# DNS validation record for Fan Portal
resource "aws_route53_record" "fan_portal_validation" {
  for_each = {
    for dvo in aws_acm_certificate.fan_portal.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.zone_id
}

# Certificate validation for Fan Portal
resource "aws_acm_certificate_validation" "fan_portal" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.fan_portal.arn
  validation_record_fqdns = [for record in aws_route53_record.fan_portal_validation : record.fqdn]
}

# ACM Certificate for Landing Page (kakraba.thekloudwiz.com)
resource "aws_acm_certificate" "landing_page" {
  provider          = aws.us_east_1
  domain_name       = var.landing_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.landing_domain}-certificate"
    }
  )
}

# DNS validation record for Landing Page
resource "aws_route53_record" "landing_page_validation" {
  for_each = {
    for dvo in aws_acm_certificate.landing_page.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.zone_id
}

# Certificate validation for Landing Page
resource "aws_acm_certificate_validation" "landing_page" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.landing_page.arn
  validation_record_fqdns = [for record in aws_route53_record.landing_page_validation : record.fqdn]
}
