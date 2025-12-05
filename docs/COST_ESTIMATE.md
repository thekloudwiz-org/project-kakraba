# Cost Estimate

This document provides a detailed breakdown of the estimated monthly costs for running the Kakraba platform on AWS.

## Table of Contents

- [Cost Summary](#cost-summary)
- [Detailed Breakdown](#detailed-breakdown)
- [Cost Optimization Strategies](#cost-optimization-strategies)
- [Scaling Scenarios](#scaling-scenarios)

## Cost Summary

### Monthly Cost Estimate

| Tier | Usage Level | Estimated Cost |
|------|-------------|----------------|
| **Minimal** | < 1,000 users, < 10GB content | $38-60/month |
| **Low** | 1,000-5,000 users, 10-50GB content | $80-150/month |
| **Medium** | 5,000-20,000 users, 50-200GB content | $200-500/month |
| **High** | 20,000+ users, 200GB+ content | $500-2,000+/month |

**Note:** Costs scale with usage. The platform is designed to be cost-effective at low volumes and scale efficiently.

## Detailed Breakdown

### 1. Compute (AWS Lambda)

**Pricing Model:**
- $0.20 per 1M requests
- $0.0000166667 per GB-second

**Estimated Usage:**

| Scenario | Requests/Month | Duration (avg) | Memory | Cost |
|----------|----------------|----------------|--------|------|
| Minimal | 100,000 | 200ms | 512MB | $2-5 |
| Low | 500,000 | 200ms | 512MB | $10-15 |
| Medium | 2,000,000 | 200ms | 512MB | $40-60 |
| High | 10,000,000 | 200ms | 512MB | $200-300 |

**Functions:**
- Access Control (most frequent)
- User Management
- Content Management
- Product Management
- Payment Service
- Analytics Service

**Free Tier:** 1M requests + 400,000 GB-seconds per month

### 2. API Gateway (HTTP API)

**Pricing Model:**
- $1.00 per million requests

**Estimated Usage:**

| Scenario | Requests/Month | Cost |
|----------|----------------|------|
| Minimal | 100,000 | $0.10 |
| Low | 500,000 | $0.50 |
| Medium | 2,000,000 | $2.00 |
| High | 10,000,000 | $10.00 |

**Free Tier:** 1M requests per month for 12 months

### 3. Database (DynamoDB)

**Pricing Model (On-Demand):**
- $1.25 per million write request units
- $0.25 per million read request units
- $0.25 per GB-month storage

**Estimated Usage:**

| Scenario | Reads/Month | Writes/Month | Storage | Cost |
|----------|-------------|--------------|---------|------|
| Minimal | 500,000 | 100,000 | 1GB | $0.50 |
| Low | 2,000,000 | 500,000 | 5GB | $2.00 |
| Medium | 10,000,000 | 2,000,000 | 20GB | $10.00 |
| High | 50,000,000 | 10,000,000 | 100GB | $50.00 |

**Free Tier:** 25 GB storage + 25 WCU + 25 RCU

**Cost Optimization:**
- Single-table design reduces queries
- Efficient access patterns with GSIs
- Batch operations where possible

### 4. Storage (S3)

**Pricing Model:**
- $0.023 per GB-month (Standard storage)
- $0.0004 per 1,000 PUT requests
- $0.0004 per 1,000 GET requests

**Estimated Usage:**

| Scenario | Storage | Requests | Cost |
|----------|---------|----------|------|
| Minimal | 10GB | 50,000 | $0.25 |
| Low | 50GB | 200,000 | $1.50 |
| Medium | 200GB | 1,000,000 | $5.00 |
| High | 1TB | 5,000,000 | $25.00 |

**Buckets:**
- Website bucket (static files): ~500MB
- Content bucket (user uploads): Variable
- Logs bucket: ~1-5GB/month

**Free Tier:** 5GB storage + 20,000 GET + 2,000 PUT requests

### 5. Content Delivery (CloudFront)

**Pricing Model:**
- $0.085 per GB (first 10TB/month, US/Europe)
- $0.0075 per 10,000 HTTP requests
- $0.01 per 10,000 HTTPS requests

**Estimated Usage:**

| Scenario | Data Transfer | Requests | Cost |
|----------|---------------|----------|------|
| Minimal | 50GB | 100,000 | $5 |
| Low | 200GB | 500,000 | $20 |
| Medium | 1TB | 2,000,000 | $100 |
| High | 5TB | 10,000,000 | $500 |

**Distributions:**
- Website CloudFront (static assets)
- Content CloudFront (user content)

**Free Tier:** 1TB data transfer + 10M requests for 12 months

**Cost Factors:**
- Video streaming is the primary cost driver
- Caching reduces origin requests
- Compression reduces data transfer

### 6. Authentication (Cognito)

**Pricing Model:**
- Free for first 50,000 MAU (Monthly Active Users)
- $0.0055 per MAU above 50,000

**Estimated Usage:**

| Scenario | MAU | Cost |
|----------|-----|------|
| Minimal | 500 | $0 (Free tier) |
| Low | 2,000 | $0 (Free tier) |
| Medium | 10,000 | $0 (Free tier) |
| High | 100,000 | $275 |

**Free Tier:** 50,000 MAU permanently free

### 7. Monitoring (CloudWatch + X-Ray)

**CloudWatch Pricing:**
- $0.30 per dashboard per month
- $0.10 per alarm per month
- $0.50 per GB ingested (logs)
- $0.03 per GB stored (logs)

**X-Ray Pricing:**
- $5.00 per 1M traces recorded
- $0.50 per 1M traces retrieved

**Estimated Usage:**

| Component | Quantity | Cost |
|-----------|----------|------|
| Dashboards | 2 | $0.60 |
| Alarms | 11 | $1.10 |
| Logs (ingestion) | 5GB | $2.50 |
| Logs (storage) | 10GB | $0.30 |
| X-Ray traces | 100,000 | $0.50 |
| **Total** | | **$5-10** |

**Free Tier:**
- 10 alarms
- 5GB log ingestion
- 100,000 X-Ray traces

### 8. Secrets Manager

**Pricing Model:**
- $0.40 per secret per month
- $0.05 per 10,000 API calls

**Estimated Usage:**

| Secrets | API Calls | Cost |
|---------|-----------|------|
| 2 (CloudFront key, Stripe keys) | 50,000 | $1.05 |

### 9. Route 53

**Pricing Model:**
- $0.50 per hosted zone per month
- $0.40 per million queries

**Estimated Usage:**

| Component | Quantity | Cost |
|-----------|----------|------|
| Hosted zone | 1 | $0.50 |
| Queries | 1M | $0.40 |
| **Total** | | **$0.90** |

### 10. ACM (SSL Certificates)

**Pricing:** FREE for public certificates

### 11. External Services

#### Stripe
**Pricing:**
- 2.9% + $0.30 per successful card charge
- No monthly fees

**Example:**
- $1,000 in monthly revenue = $29 + $3 = $32 in fees

**Note:** This is a pass-through cost (paid by revenue)

## Total Cost Summary

### Development Environment

| Component | Cost |
|-----------|------|
| Lambda | $2-5 |
| API Gateway | $0.10-0.50 |
| DynamoDB | $0.50-2 |
| S3 | $0.25-1 |
| CloudFront | $5-10 |
| Cognito | $0 |
| Monitoring | $5-10 |
| Secrets Manager | $1 |
| Route 53 | $1 |
| **Total** | **$15-30/month** |

### Production Environment (Low Traffic)

| Component | Cost |
|-----------|------|
| Lambda | $10-20 |
| API Gateway | $1-3 |
| DynamoDB | $5-15 |
| S3 | $5-20 |
| CloudFront | $20-50 |
| Cognito | $0 |
| Monitoring | $10-15 |
| Secrets Manager | $1 |
| Route 53 | $1 |
| **Total** | **$53-125/month** |

### Production Environment (Medium Traffic)

| Component | Cost |
|-----------|------|
| Lambda | $40-80 |
| API Gateway | $5-10 |
| DynamoDB | $20-50 |
| S3 | $20-100 |
| CloudFront | $100-300 |
| Cognito | $0 |
| Monitoring | $15-25 |
| Secrets Manager | $1 |
| Route 53 | $1 |
| **Total** | **$202-567/month** |

### Production Environment (High Traffic)

| Component | Cost |
|-----------|------|
| Lambda | $200-400 |
| API Gateway | $20-50 |
| DynamoDB | $100-300 |
| S3 | $100-500 |
| CloudFront | $500-2,000 |
| Cognito | $100-500 |
| Monitoring | $25-50 |
| Secrets Manager | $1 |
| Route 53 | $2 |
| **Total** | **$1,048-3,803/month** |

## Cost Optimization Strategies

### 1. CloudFront Optimization
- **Enable caching:** Reduce origin requests by 80-90%
- **Use compression:** Reduce data transfer by 60-70%
- **Optimize cache policies:** Longer TTLs for static content
- **Regional pricing:** Consider CloudFront price classes

**Potential Savings:** 40-60% on CloudFront costs

### 2. Lambda Optimization
- **Right-size memory:** Use Lambda Power Tuning tool
- **Reduce cold starts:** Use provisioned concurrency for critical functions
- **Optimize code:** Reduce execution time
- **Use ARM architecture:** 20% cost reduction with Graviton2

**Potential Savings:** 20-40% on Lambda costs

### 3. DynamoDB Optimization
- **Use on-demand wisely:** Switch to provisioned capacity for predictable workloads
- **Optimize queries:** Use indexes efficiently
- **Batch operations:** Reduce request count
- **TTL for old data:** Automatic cleanup

**Potential Savings:** 30-50% on DynamoDB costs

### 4. S3 Optimization
- **Lifecycle policies:** Move old content to Glacier
- **Intelligent tiering:** Automatic cost optimization
- **Delete unused data:** Regular cleanup
- **Optimize uploads:** Use multipart upload

**Potential Savings:** 20-40% on S3 costs

### 5. Monitoring Optimization
- **Log filtering:** Only log what's necessary
- **Shorter retention:** 7 days instead of 14 days
- **Metric filters:** Reduce custom metrics
- **X-Ray sampling:** Sample 10% of requests

**Potential Savings:** 30-50% on monitoring costs

## Scaling Scenarios

### Scenario 1: Startup (0-1,000 users)
- **Monthly Cost:** $40-80
- **Revenue Needed:** $200-400 (5:1 ratio)
- **Break-even:** ~50 paying users at $5/month

### Scenario 2: Growth (1,000-10,000 users)
- **Monthly Cost:** $150-400
- **Revenue Needed:** $750-2,000 (5:1 ratio)
- **Break-even:** ~300 paying users at $5/month

### Scenario 3: Scale (10,000-100,000 users)
- **Monthly Cost:** $500-2,000
- **Revenue Needed:** $2,500-10,000 (5:1 ratio)
- **Break-even:** ~1,000 paying users at $5/month

### Scenario 4: Enterprise (100,000+ users)
- **Monthly Cost:** $2,000-10,000+
- **Revenue Needed:** $10,000-50,000+ (5:1 ratio)
- **Break-even:** ~5,000 paying users at $5/month

## Cost Monitoring

### Set Up Billing Alerts

1. **AWS Budgets:**
   ```bash
   aws budgets create-budget \
     --account-id <account-id> \
     --budget file://budget.json \
     --notifications-with-subscribers file://notifications.json
   ```

2. **CloudWatch Billing Alarms:**
   - Set threshold at 80% of budget
   - Receive email notifications
   - Review costs weekly

### Cost Allocation Tags

Tag all resources with:
- `Environment` (dev, staging, prod)
- `Project` (kakraba)
- `Component` (frontend, backend, storage)
- `CostCenter` (engineering)

### Regular Cost Reviews

- **Daily:** Check CloudWatch dashboards
- **Weekly:** Review AWS Cost Explorer
- **Monthly:** Analyze cost trends and optimize

## Conclusion

The Kakraba platform is designed to be cost-effective at all scales:

- **Low entry cost:** Start at $40-80/month
- **Scales with usage:** Pay only for what you use
- **Optimization opportunities:** Multiple ways to reduce costs
- **Predictable scaling:** Costs scale linearly with users

**Key Takeaway:** With proper optimization, infrastructure costs should be 10-20% of revenue, making the platform financially sustainable.

---

For more information, see:
- [Architecture & Flow](./ARCHITECTURE_AND_FLOW.md)
- [Usage & Contributing](./USAGE_AND_CONTRIBUTING.md)
