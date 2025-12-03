# Analytics Service

Analytics service for the Kakraba platform, providing creators with insights into their content performance, revenue, and fan engagement.

## Features

- **Dashboard Metrics**: Overview of key performance indicators
- **Revenue Analytics**: Time-series revenue data with daily, weekly, and monthly views
- **Content Performance**: Metrics for each content item (views, downloads, revenue)
- **Fan Engagement**: Statistics about active fans, new fans, and subscription retention
- **Data Export**: CSV export functionality for all analytics data

## Environment Variables

### Required
- `TABLE_NAME`: DynamoDB table name (default: CreatorVault)
- `AWS_REGION`: AWS region (default: eu-central-1)

## API Endpoints

### GET /analytics/dashboard
Get dashboard overview metrics for a creator.

**Query Parameters:**
- `startDate` (optional): Start date for analytics period (ISO 8601)
- `endDate` (optional): End date for analytics period (ISO 8601)

**Response:**
```json
{
  "totalRevenue": 1234.56,
  "activeSubscribers": 42,
  "contentViews": 1523,
  "newFans": 15
}
```

### GET /analytics/revenue
Get revenue analytics with time series data.

**Query Parameters:**
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)
- `granularity` (optional): `daily`, `weekly`, or `monthly` (default: daily)

**Response:**
```json
{
  "data": [
    {
      "date": "2024-01-01",
      "revenue": 123.45,
      "transactions": 5
    }
  ],
  "total": 123.45
}
```

### GET /analytics/content
Get content performance metrics.

**Query Parameters:**
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)

**Response:**
```json
{
  "content": [
    {
      "contentId": "content-123",
      "title": "My Content",
      "views": 150,
      "downloads": 45,
      "revenue": 234.56,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /analytics/fans
Get fan engagement metrics.

**Query Parameters:**
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)

**Response:**
```json
{
  "activeFans": 42,
  "newFans": 15,
  "subscriptionRetention": 0.85,
  "averageRevenuePerFan": 29.39
}
```

### GET /analytics/export
Export analytics data as CSV.

**Query Parameters:**
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)
- `type` (required): `revenue`, `content`, or `fans`

**Response:**
CSV file download with appropriate headers and data.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Package for deployment
npm run package
```

## Data Sources

The analytics service aggregates data from multiple sources in DynamoDB:
- **Transactions**: Revenue and purchase data
- **Subscriptions**: Active subscriber counts
- **Content**: Content metadata and performance
- **Analytics Entities**: Pre-aggregated daily metrics (if available)

## Performance Considerations

- Analytics queries use GSI1 for efficient date-range queries
- Large date ranges may require pagination
- Consider implementing caching for frequently accessed metrics
- Pre-aggregation of daily metrics can improve query performance

## Deployment

The service is deployed as an AWS Lambda function and integrated with API Gateway. See the main infrastructure documentation for deployment details.
