# Monitoring Module

This Terraform module sets up comprehensive monitoring and alerting for the Creator-Fan Portals system using AWS CloudWatch.

## Features

### CloudWatch Dashboards

1. **Main Dashboard** - System health overview
   - Lambda function metrics (invocations, errors, throttles, duration)
   - API Gateway metrics (requests, errors, latency)
   - DynamoDB metrics (capacity units, errors)
   - CloudFront metrics (requests, bytes, error rates)

2. **Business Metrics Dashboard** - Business-focused metrics
   - Lambda invocations by function
   - Error rate trends over time
   - Custom business metrics

### CloudWatch Alarms

The module creates alarms for critical metrics:

**Lambda Alarms:**
- High error rate
- Throttling events
- High duration (performance degradation)

**API Gateway Alarms:**
- 5XX server errors
- 4XX client errors
- High latency

**DynamoDB Alarms:**
- User errors
- System errors
- Read throttle events
- Write throttle events

**CloudFront Alarms:**
- 5XX error rate

All alarms send notifications to an SNS topic, which can be configured to send emails.

## Usage

```hcl
module "monitoring" {
  source = "./modules/monitoring"

  project_name = "creator-vault"
  environment  = "prod"
  aws_region   = "us-east-1"

  # Lambda monitoring
  lambda_function_names = [
    "creator-vault-prod-access-control",
    "creator-vault-prod-user-management",
    "creator-vault-prod-content-management"
  ]
  lambda_error_threshold    = 10
  lambda_throttle_threshold = 5
  lambda_duration_threshold = 10000

  # API Gateway monitoring
  api_gateway_name      = "creator-vault-prod-api"
  api_5xx_threshold     = 10
  api_4xx_threshold     = 50
  api_latency_threshold = 2000

  # DynamoDB monitoring
  dynamodb_table_name         = "CreatorVault"
  dynamodb_error_threshold    = 10
  dynamodb_throttle_threshold = 5

  # CloudFront monitoring
  cloudfront_error_rate_threshold = 5

  # Alarm notifications
  alarm_email = "ops@example.com"

  tags = {
    Project     = "CreatorVault"
    Environment = "prod"
    ManagedBy   = "Terraform"
  }
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|----------|
| project_name | Name of the project | string | - | yes |
| environment | Environment name | string | - | yes |
| aws_region | AWS region | string | - | yes |
| lambda_function_names | List of Lambda functions to monitor | list(string) | [] | no |
| lambda_error_threshold | Lambda errors alarm threshold | number | 10 | no |
| lambda_throttle_threshold | Lambda throttles alarm threshold | number | 5 | no |
| lambda_duration_threshold | Lambda duration alarm threshold (ms) | number | 10000 | no |
| api_gateway_name | API Gateway name | string | - | yes |
| api_5xx_threshold | API 5XX errors threshold | number | 10 | no |
| api_4xx_threshold | API 4XX errors threshold | number | 50 | no |
| api_latency_threshold | API latency threshold (ms) | number | 2000 | no |
| dynamodb_table_name | DynamoDB table name | string | - | yes |
| dynamodb_error_threshold | DynamoDB errors threshold | number | 10 | no |
| dynamodb_throttle_threshold | DynamoDB throttle threshold | number | 5 | no |
| cloudfront_error_rate_threshold | CloudFront error rate threshold (%) | number | 5 | no |
| alarm_email | Email for alarm notifications | string | "" | no |
| log_group_prefix | CloudWatch log group prefix | string | "/aws/lambda" | no |
| tags | Common tags | map(string) | {} | no |

## Outputs

| Name | Description |
|------|-------------|
| main_dashboard_name | Name of the main CloudWatch dashboard |
| business_metrics_dashboard_name | Name of the business metrics dashboard |
| sns_topic_arn | ARN of the SNS topic for alarms |
| alarm_names | List of all alarm names created |

## Accessing Dashboards

After deployment, you can access the dashboards in the AWS Console:

1. Navigate to CloudWatch > Dashboards
2. Select the dashboard:
   - `{project_name}-{environment}-main-dashboard` for system health
   - `{project_name}-{environment}-business-metrics` for business metrics

## Alarm Notifications

To receive alarm notifications:

1. Set the `alarm_email` variable to your email address
2. After deployment, check your email for an SNS subscription confirmation
3. Click the confirmation link to start receiving alarm notifications

## X-Ray Tracing

X-Ray tracing is enabled on Lambda functions through the IAM module. To view traces:

1. Navigate to AWS X-Ray > Service Map
2. View the service map to see request flows
3. Click on nodes to see detailed traces
4. Use the Traces view to search for specific requests

## Best Practices

1. **Set appropriate thresholds** - Adjust alarm thresholds based on your traffic patterns
2. **Monitor regularly** - Check dashboards daily to identify trends
3. **Respond to alarms** - Investigate and resolve issues when alarms trigger
4. **Review metrics** - Periodically review metrics to optimize performance
5. **Use X-Ray** - Enable X-Ray tracing to debug performance issues

## Troubleshooting

### Alarms not triggering

- Verify that metrics are being published to CloudWatch
- Check alarm threshold values
- Ensure SNS topic subscription is confirmed

### Missing metrics

- Verify that services are running and generating metrics
- Check IAM permissions for CloudWatch
- Ensure X-Ray tracing is enabled on Lambda functions

### Dashboard not showing data

- Verify the correct region is selected
- Check that resources exist and are generating metrics
- Ensure dashboard JSON is valid
