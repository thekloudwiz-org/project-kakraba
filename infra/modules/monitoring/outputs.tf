# Outputs for monitoring module

output "main_dashboard_name" {
  description = "Name of the main CloudWatch dashboard"
  value       = aws_cloudwatch_dashboard.main.dashboard_name
}

output "business_metrics_dashboard_name" {
  description = "Name of the business metrics dashboard"
  value       = aws_cloudwatch_dashboard.business_metrics.dashboard_name
}

output "sns_topic_arn" {
  description = "ARN of the SNS topic for alarms"
  value       = aws_sns_topic.alarms.arn
}

output "alarm_names" {
  description = "List of all alarm names created"
  value = [
    aws_cloudwatch_metric_alarm.lambda_errors.alarm_name,
    aws_cloudwatch_metric_alarm.lambda_throttles.alarm_name,
    aws_cloudwatch_metric_alarm.lambda_duration.alarm_name,
    aws_cloudwatch_metric_alarm.api_5xx_errors.alarm_name,
    aws_cloudwatch_metric_alarm.api_4xx_errors.alarm_name,
    aws_cloudwatch_metric_alarm.api_latency.alarm_name,
    aws_cloudwatch_metric_alarm.dynamodb_user_errors.alarm_name,
    aws_cloudwatch_metric_alarm.dynamodb_system_errors.alarm_name,
    aws_cloudwatch_metric_alarm.dynamodb_read_throttles.alarm_name,
    aws_cloudwatch_metric_alarm.dynamodb_write_throttles.alarm_name,
    aws_cloudwatch_metric_alarm.cloudfront_5xx_errors.alarm_name,
  ]
}
