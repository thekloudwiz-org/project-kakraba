output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = aws_apigatewayv2_stage.default.invoke_url
}

output "api_id" {
  description = "API Gateway ID"
  value       = aws_apigatewayv2_api.main.id
}

output "custom_domain_name" {
  description = "Custom domain name for API Gateway"
  value       = var.custom_domain_name != "" ? aws_apigatewayv2_domain_name.api[0].domain_name : null
}

output "custom_domain_target" {
  description = "Target domain name for custom domain"
  value       = var.custom_domain_name != "" ? aws_apigatewayv2_domain_name.api[0].domain_name_configuration[0].target_domain_name : null
}
