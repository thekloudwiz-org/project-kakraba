output "lambda_function_arn" {
  description = "Lambda function ARN"
  value       = aws_lambda_function.access_control.arn
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.access_control.function_name
}

output "lambda_invoke_arn" {
  description = "Lambda function invoke ARN for API Gateway integration"
  value       = aws_lambda_function.access_control.invoke_arn
}
