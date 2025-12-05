# CloudWatch Alarms for critical metrics

# SNS Topic for alarm notifications
resource "aws_sns_topic" "alarms" {
  name = "${var.project_name}-${var.environment}-alarms"

  tags = var.tags
}

# SNS Topic Subscription (email)
resource "aws_sns_topic_subscription" "alarm_email" {
  count     = var.alarm_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

# Lambda Error Rate Alarm
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${var.project_name}-${var.environment}-lambda-high-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = var.lambda_error_threshold
  alarm_description   = "This metric monitors Lambda function errors"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  treat_missing_data  = "notBreaching"

  tags = var.tags
}

# Lambda Throttle Alarm
resource "aws_cloudwatch_metric_alarm" "lambda_throttles" {
  alarm_name          = "${var.project_name}-${var.environment}-lambda-throttles"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Throttles"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = var.lambda_throttle_threshold
  alarm_description   = "This metric monitors Lambda function throttles"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  treat_missing_data  = "notBreaching"

  tags = var.tags
}

# Lambda Duration Alarm
resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  alarm_name          = "${var.project_name}-${var.environment}-lambda-high-duration"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Average"
  threshold           = var.lambda_duration_threshold
  alarm_description   = "This metric monitors Lambda function duration"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  treat_missing_data  = "notBreaching"

  tags = var.tags
}

# API Gateway 5XX Error Alarm
resource "aws_cloudwatch_metric_alarm" "api_5xx_errors" {
  alarm_name          = "${var.project_name}-${var.environment}-api-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Sum"
  threshold           = var.api_5xx_threshold
  alarm_description   = "This metric monitors API Gateway 5XX errors"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiName = var.api_gateway_name
  }

  tags = var.tags
}

# API Gateway 4XX Error Alarm
resource "aws_cloudwatch_metric_alarm" "api_4xx_errors" {
  alarm_name          = "${var.project_name}-${var.environment}-api-4xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "4XXError"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Sum"
  threshold           = var.api_4xx_threshold
  alarm_description   = "This metric monitors API Gateway 4XX errors"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiName = var.api_gateway_name
  }

  tags = var.tags
}

# API Gateway Latency Alarm
resource "aws_cloudwatch_metric_alarm" "api_latency" {
  alarm_name          = "${var.project_name}-${var.environment}-api-high-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Latency"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Average"
  threshold           = var.api_latency_threshold
  alarm_description   = "This metric monitors API Gateway latency"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiName = var.api_gateway_name
  }

  tags = var.tags
}

# DynamoDB User Errors Alarm
resource "aws_cloudwatch_metric_alarm" "dynamodb_user_errors" {
  alarm_name          = "${var.project_name}-${var.environment}-dynamodb-user-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "UserErrors"
  namespace           = "AWS/DynamoDB"
  period              = 300
  statistic           = "Sum"
  threshold           = var.dynamodb_error_threshold
  alarm_description   = "This metric monitors DynamoDB user errors"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    TableName = var.dynamodb_table_name
  }

  tags = var.tags
}

# DynamoDB System Errors Alarm
resource "aws_cloudwatch_metric_alarm" "dynamodb_system_errors" {
  alarm_name          = "${var.project_name}-${var.environment}-dynamodb-system-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "SystemErrors"
  namespace           = "AWS/DynamoDB"
  period              = 300
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "This metric monitors DynamoDB system errors"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    TableName = var.dynamodb_table_name
  }

  tags = var.tags
}

# DynamoDB Read Throttle Alarm
resource "aws_cloudwatch_metric_alarm" "dynamodb_read_throttles" {
  alarm_name          = "${var.project_name}-${var.environment}-dynamodb-read-throttles"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "ReadThrottleEvents"
  namespace           = "AWS/DynamoDB"
  period              = 300
  statistic           = "Sum"
  threshold           = var.dynamodb_throttle_threshold
  alarm_description   = "This metric monitors DynamoDB read throttles"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    TableName = var.dynamodb_table_name
  }

  tags = var.tags
}

# DynamoDB Write Throttle Alarm
resource "aws_cloudwatch_metric_alarm" "dynamodb_write_throttles" {
  alarm_name          = "${var.project_name}-${var.environment}-dynamodb-write-throttles"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "WriteThrottleEvents"
  namespace           = "AWS/DynamoDB"
  period              = 300
  statistic           = "Sum"
  threshold           = var.dynamodb_throttle_threshold
  alarm_description   = "This metric monitors DynamoDB write throttles"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    TableName = var.dynamodb_table_name
  }

  tags = var.tags
}

# CloudFront 5XX Error Rate Alarm
resource "aws_cloudwatch_metric_alarm" "cloudfront_5xx_errors" {
  alarm_name          = "${var.project_name}-${var.environment}-cloudfront-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "5xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = 300
  statistic           = "Average"
  threshold           = var.cloudfront_error_rate_threshold
  alarm_description   = "This metric monitors CloudFront 5XX error rate"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  treat_missing_data  = "notBreaching"

  tags = var.tags
}
