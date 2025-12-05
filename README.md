# Kakraba - Creator-Fan Content Platform

A modern, serverless platform that enables content creators to monetize their digital content while providing fans with an intuitive interface to discover, purchase, and access creator content.

[![AWS](https://img.shields.io/badge/AWS-Serverless-orange)](https://aws.amazon.com/)
[![Terraform](https://img.shields.io/badge/IaC-Terraform-purple)](https://www.terraform.io/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/Frontend-React-61dafb)](https://reactjs.org/)

## 🌟 Overview

Kakraba is a comprehensive web application consisting of three distinct portals:

- **Landing Page** - Main entry point for visitors to choose their path
- **Creator Portal** - Content management, analytics, and monetization tools for creators
- **Fan Portal** - Content discovery, purchase, and consumption interface for fans

### Key Features

**For Creators:**
- 📤 Upload and manage digital content (video, audio, PDF, images)
- 💰 Create products with flexible pricing and access rules
- 📊 Real-time analytics and revenue tracking
- 👥 Fan engagement metrics
- 💳 Stripe integration for payments

**For Fans:**
- 🔍 Discover and browse creator content
- 🛒 Purchase individual content or subscriptions
- 📺 Stream or download purchased content
- 💾 Manage subscriptions and payment methods
- 📱 Responsive design for all devices

## 📚 Documentation

### Technical Documentation
- **[Architecture & Flow](./docs/ARCHITECTURE_AND_FLOW.md)** - Infrastructure design and application flow
- **[Cost Estimate](./docs/COST_ESTIMATE.md)** - AWS infrastructure cost breakdown
- **[Usage & Contributing](./docs/USAGE_AND_CONTRIBUTING.md)** - Setup, deployment, and contribution guidelines
- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Complete API endpoint reference
- **[Environment Variables](./docs/ENVIRONMENT_VARIABLES.md)** - Configuration reference
- **[Troubleshooting Guide](./docs/TROUBLESHOOTING.md)** - Comprehensive troubleshooting for all issues

### User Guides
- **[Creator Portal Guide](./docs/CREATOR_PORTAL_GUIDE.md)** - Complete guide for content creators
- **[Fan Portal Guide](./docs/FAN_PORTAL_GUIDE.md)** - Complete guide for fans

## 🏗️ Architecture

The platform is built on AWS serverless architecture:

```
┌────────────────────────────────────────────────────────────┐
│                    CloudFront CDN                          │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Website CDN     │         │  Content CDN     │         │
│  │  (Public)        │         │  (Private)       │         │
│  └────────┬─────────┘         └────────┬─────────┘         │
└───────────┼────────────────────────────┼──────-────────────┘
            │                            │
    ┌───────▼────────┐            ┌──────▼────────┐
    │  Website S3    │            │  Content S3   │
    │  Static Apps   │            │  User Files   │
    └────────────────┘            └───────────────┘
            │
            │ API Calls
            │
    ┌───────▼────────────────────────────────────────┐
    │           API Gateway + Lambda                  │
    │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
    │  │  User    │  │ Content  │  │ Payment  │    │
    │  │  Mgmt    │  │   Mgmt   │  │ Service  │    │
    │  └──────────┘  └──────────┘  └──────────┘    │
    └────────┬───────────────────────────────────────┘
             │
    ┌────────▼────────┐
    │   DynamoDB      │
    │   Cognito       │
    │   Stripe        │
    └─────────────────┘
```

See [Architecture & Flow](./docs/ARCHITECTURE_AND_FLOW.md) for detailed information.

## 🚀 Quick Start

### Prerequisites

- AWS Account with appropriate permissions
- Terraform >= 1.0
- Node.js >= 20.x
- AWS CLI configured
- Stripe account (for payments)

### Deployment

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/kakraba.git
   cd kakraba
   ```

2. **Configure infrastructure**
   ```bash
   cd infra
   cp environments/dev.tfvars.example environments/dev.tfvars
   # Edit dev.tfvars with your configuration
   ```

3. **Deploy infrastructure**
   ```bash
   terraform init
   terraform plan -var-file="environments/dev.tfvars"
   terraform apply -var-file="environments/dev.tfvars"
   ```

4. **Build and deploy frontend**
   ```bash
   cd ../frontend
   npm install
   npm run build
   # Upload to S3 (see deployment guide)
   ```

See [Usage & Contributing](./docs/USAGE_AND_CONTRIBUTING.md) for detailed setup instructions.

## 💰 Cost Estimate

Approximate monthly costs for running the platform:

| Component | Estimated Cost |
|-----------|----------------|
| Lambda Functions | $5-20 |
| API Gateway | $3-10 |
| DynamoDB | $5-25 |
| S3 Storage | $5-50 |
| CloudFront | $10-100 |
| Cognito | Free tier |
| Monitoring | $10-20 |
| **Total** | **$38-225/month** |

Costs vary based on usage. See [Cost Estimate](./docs/COST_ESTIMATE.md) for detailed breakdown.

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **State Management:** Zustand + TanStack Query
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Forms:** React Hook Form + Zod
- **Authentication:** AWS Amplify

### Backend
- **Runtime:** Node.js 20.x on AWS Lambda
- **API:** API Gateway HTTP API
- **Database:** DynamoDB (single-table design)
- **Authentication:** AWS Cognito
- **Payments:** Stripe
- **Storage:** S3 + CloudFront

### Infrastructure
- **IaC:** Terraform
- **Monitoring:** CloudWatch + X-Ray
- **CI/CD:** GitHub Actions (optional)

## 📊 Monitoring

The platform includes comprehensive monitoring:

- **CloudWatch Dashboards** - Real-time metrics for all services
- **CloudWatch Alarms** - Automated alerts for critical issues
- **AWS X-Ray** - Distributed tracing for debugging
- **CloudWatch Logs** - Centralized logging

Access dashboards after deployment:
```bash
terraform output main_dashboard_url
terraform output xray_console_url
```

## 🔒 Security

- **Authentication:** AWS Cognito with JWT tokens
- **Authorization:** Role-based access control (Creator/Fan)
- **Content Security:** Signed CloudFront URLs with 15-minute expiration
- **Data Encryption:** At rest (S3, DynamoDB) and in transit (TLS 1.3)
- **Payment Security:** PCI DSS compliant via Stripe
- **File Validation:** Type and size validation, malware scanning
- **GDPR Compliance:** Data export and deletion capabilities

## 🧪 Testing

The project includes comprehensive testing:

- **Unit Tests:** Jest + React Testing Library
- **Property-Based Tests:** fast-check for critical business logic
- **E2E Tests:** Playwright for user flows
- **Integration Tests:** DynamoDB Local + LocalStack

Run tests:
```bash
# Backend tests
cd app
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
cd frontend
npm run test:e2e
```

## 📈 Performance

- **Page Load:** < 2 seconds on standard broadband
- **API Latency:** < 200ms average
- **Content Delivery:** Global CDN with edge caching
- **Scalability:** Serverless auto-scaling
- **Availability:** 99.9% uptime SLA

## 🤝 Contributing

We welcome contributions! Please see [Usage & Contributing](./docs/USAGE_AND_CONTRIBUTING.md) for:

- Development setup
- Code style guidelines
- Testing requirements
- Pull request process
- Issue reporting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- AWS for serverless infrastructure
- Stripe for payment processing
- The open-source community for amazing tools and libraries

## 📞 Support

- **Documentation:** [docs/](./docs/)
- **Issues:** [GitHub Issues](https://github.com/yourusername/kakraba/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/kakraba/discussions)

## 🗺️ Roadmap

- [ ] Mobile applications (iOS, Android)
- [ ] Live streaming support
- [ ] Social features (comments, likes, shares)
- [ ] Advanced analytics with ML insights
- [ ] Multi-language support
- [ ] Referral and affiliate programs

---

**Built with ❤️ using AWS Serverless Architecture**
