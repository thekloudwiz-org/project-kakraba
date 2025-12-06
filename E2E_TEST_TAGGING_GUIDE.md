# E2E Test Tagging Guide

## Overview

This guide explains how to tag E2E tests for selective execution based on feature implementation status.

## Tag Categories

### Implementation Status Tags
- `@implemented` - Feature is fully implemented with routes configured
- `@partial` - Feature components exist but routes not configured
- `@missing` - Feature doesn't exist yet
- `@skip` - Temporarily skip this test

### Feature Area Tags
- `@smoke` - Critical path tests that should always pass
- `@auth` - Authentication tests
- `@content` - Content management tests
- `@product` - Product management tests
- `@payment` - Payment and checkout tests
- `@subscription` - Subscription management tests
- `@analytics` - Analytics and reporting tests
- `@discovery` - Content discovery tests
- `@library` - Content library and access tests

### Priority Tags
- `@p0` - Critical functionality
- `@p1` - Important functionality
- `@p2` - Nice to have

## Current Test Status

### Landing Page Tests ✅
**Status:** @implemented @smoke
**Tests:** 8 tests
**All passing**

### Creator Portal Tests

#### Authentication (@auth)
**Status:** @implemented
**Tests:** 9 tests
**Action Required:** Create test user accounts

#### Dashboard (@dashboard)
**Status:** @implemented
**Tests:** Part of analytics
**Action Required:** None

#### Analytics (@analytics)
**Status:** @implemented (routes added)
**Tests:** 13 tests
**Action Required:** Verify data-testid attributes

#### Content Management (@content)
**Status:** @implemented (routes added)
**Tests:** 11 tests
**Action Required:** Verify data-testid attributes

#### Product Management (@product)
**Status:** @implemented (routes added)
**Tests:** 12 tests
**Action Required:** Verify data-testid attributes

### Fan Portal Tests

#### Authentication (@auth)
**Status:** @implemented
**Tests:** 9 tests
**Action Required:** Create test user accounts

#### Content Discovery (@discovery)
**Status:** @implemented (routes added)
**Tests:** 13 tests
**Action Required:** Verify data-testid attributes

#### Content Library (@library)
**Status:** @implemented (routes added)
**Tests:** 14 tests
**Action Required:** Verify data-testid attributes

#### Payment (@payment)
**Status:** @implemented (routes added)
**Tests:** 12 tests
**Action Required:** Verify data-testid attributes, Stripe test mode

#### Subscription Management (@subscription)
**Status:** @implemented (routes added)
**Tests:** 14 tests
**Action Required:** Verify data-testid attributes

## How to Tag Tests

### Example: Tagging a test file

```typescript
import { test, expect } from '@playwright/test';

// Tag the entire test suite
test.describe('Landing Page Navigation', { tag: ['@smoke', '@implemented'] }, () => {
  
  test('should display landing page with hero section', async ({ page }) => {
    // test code
  });
  
  // Tag individual test
  test('should handle edge case', { tag: '@p2' }, async ({ page }) => {
    // test code
  });
});
```

### Example: Tagging with multiple tags

```typescript
test.describe('Creator Authentication', { 
  tag: ['@auth', '@implemented', '@p0'] 
}, () => {
  // tests
});
```

## Running Tagged Tests

### Run only smoke tests
```bash
pnpm test:e2e --grep @smoke
```

### Run only implemented features
```bash
pnpm test:e2e --grep @implemented
```

### Run specific feature area
```bash
pnpm test:e2e --grep @auth
pnpm test:e2e --grep @content
pnpm test:e2e --grep @payment
```

### Skip certain tests
```bash
pnpm test:e2e --grep-invert @skip
pnpm test:e2e --grep-invert @missing
```

### Combine tags (AND logic)
```bash
# Run implemented auth tests
pnpm test:e2e --grep "@implemented.*@auth"
```

### Run multiple tags (OR logic)
```bash
# Run auth OR content tests
pnpm test:e2e --grep "@auth|@content"
```

## Recommended Tagging for Each Test File

### Landing Page
```typescript
test.describe('Landing Page Navigation', { 
  tag: ['@smoke', '@implemented', '@p0'] 
}, () => {
  // All 8 tests
});
```

### Creator Portal - Auth
```typescript
test.describe('Creator Authentication', { 
  tag: ['@auth', '@implemented', '@p0'] 
}, () => {
  // 9 tests
});
```

### Creator Portal - Analytics
```typescript
test.describe('Analytics Dashboard', { 
  tag: ['@analytics', '@implemented', '@p1'] 
}, () => {
  // 13 tests - may need @skip on some until data-testid added
});
```

### Creator Portal - Content
```typescript
test.describe('Content Management', { 
  tag: ['@content', '@implemented', '@p0'] 
}, () => {
  // 11 tests
});
```

### Creator Portal - Products
```typescript
test.describe('Product Creation', { 
  tag: ['@product', '@implemented', '@p0'] 
}, () => {
  // 12 tests
});
```

### Fan Portal - Auth
```typescript
test.describe('Fan Authentication', { 
  tag: ['@auth', '@implemented', '@p0'] 
}, () => {
  // 9 tests
});
```

### Fan Portal - Discovery
```typescript
test.describe('Content Discovery', { 
  tag: ['@discovery', '@implemented', '@p1'] 
}, () => {
  // 13 tests
});
```

### Fan Portal - Library
```typescript
test.describe('Content Access and Consumption', { 
  tag: ['@library', '@implemented', '@p0'] 
}, () => {
  // 14 tests
});
```

### Fan Portal - Payment
```typescript
test.describe('Purchase and Payment', { 
  tag: ['@payment', '@implemented', '@p0'] 
}, () => {
  // 12 tests
});
```

### Fan Portal - Subscriptions
```typescript
test.describe('Subscription Management', { 
  tag: ['@subscription', '@implemented', '@p1'] 
}, () => {
  // 14 tests
});
```

## CI/CD Integration

### Current CI Configuration (Immediate)
```yaml
# Run only smoke tests (landing page)
- name: Run E2E tests
  run: pnpm test:e2e --grep @smoke
```

### After Test Users Created
```yaml
# Run smoke + auth tests
- name: Run E2E tests
  run: pnpm test:e2e --grep "@smoke|@auth"
```

### After data-testid Verification
```yaml
# Run all implemented features
- name: Run E2E tests
  run: pnpm test:e2e --grep @implemented
```

### Full Suite (Future)
```yaml
# Run everything except skipped tests
- name: Run E2E tests
  run: pnpm test:e2e --grep-invert @skip
```

## Next Steps

1. ✅ Routes added to both portals
2. ⏭️ Create test user accounts (run `./scripts/create-test-users.sh dev`)
3. ⏭️ Add tags to all test files
4. ⏭️ Verify data-testid attributes in components
5. ⏭️ Update CI to run tagged tests
6. ⏭️ Gradually enable more tests as verified

## Verification Checklist

For each feature area, verify:
- [ ] Routes are configured in App.tsx
- [ ] Components have required data-testid attributes
- [ ] API endpoints are working
- [ ] Test user accounts exist (for auth tests)
- [ ] Test data exists (for content/product tests)
- [ ] Tests are tagged appropriately
- [ ] Tests pass locally
- [ ] Tests pass in CI

## Troubleshooting

### Tests timing out
- Check if routes are configured
- Check if dev servers are running
- Check if API endpoints exist
- Increase timeout in playwright.config.ts

### Tests failing on specific elements
- Check if data-testid attributes exist
- Check if element selectors are correct
- Check if page is fully loaded before interaction

### Authentication tests failing
- Verify test user accounts exist in Cognito
- Verify email addresses are confirmed
- Verify passwords meet requirements
- Check Cognito configuration

### API tests failing
- Verify API endpoints exist
- Check API Gateway configuration
- Verify Lambda functions are deployed
- Check CloudWatch logs for errors
