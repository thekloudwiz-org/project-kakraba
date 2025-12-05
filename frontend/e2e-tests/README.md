# End-to-End Tests

This directory contains Playwright-based end-to-end tests for the Kakraba platform.

## Structure

```
e2e-tests/
├── landing-page/       # Landing page tests
├── creator-portal/     # Creator portal tests
├── fan-portal/         # Fan portal tests
├── fixtures/           # Test data and fixtures
└── utils/              # Helper functions
```

## Running Tests

### Run all E2E tests
```bash
pnpm test:e2e
```

### Run tests with UI mode (interactive)
```bash
pnpm test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
pnpm test:e2e:headed
```

### Run tests for specific portal
```bash
pnpm test:e2e:landing    # Landing page only
pnpm test:e2e:creator    # Creator portal only
pnpm test:e2e:fan        # Fan portal only
```

## Test Organization

### Landing Page Tests
- Navigation and redirects
- Feature section display
- Responsive design

### Creator Portal Tests
- Registration and login flow
- Content upload and management
- Product creation flow
- Analytics viewing

### Fan Portal Tests
- Registration and login flow
- Content discovery and search
- Purchase and payment flow
- Content access and streaming
- Subscription management

## Configuration

Tests are configured in `playwright.config.ts`. Key settings:

- **Timeout**: 30 seconds per test
- **Retries**: 2 retries in CI, 0 locally
- **Browsers**: Chromium (can be extended to Firefox, Safari)
- **Base URLs**: Configurable via environment variables

## Environment Variables

```bash
# Override default URLs
LANDING_URL=http://localhost:5173
CREATOR_URL=http://localhost:5174
FAN_URL=http://localhost:5175

# For testing against deployed environments
LANDING_URL=https://kakraba.thekloudwiz.com
CREATOR_URL=https://create-kakraba.thekloudwiz.com
FAN_URL=https://fan-kakraba.thekloudwiz.com
```

## Writing Tests

### Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
  });

  test('should do something', async ({ page }) => {
    // Test implementation
  });
});
```

### Using Helpers
```typescript
import { loginUser } from '../utils/auth-helpers';
import { waitForToast } from '../utils/wait-helpers';
import { testUsers } from '../fixtures/test-data';

test('should login successfully', async ({ page }) => {
  await loginUser(page, testUsers.creator.email, testUsers.creator.password);
  await waitForToast(page, 'Login successful');
});
```

## Best Practices

1. **Use data-testid attributes** for reliable selectors
2. **Wait for network requests** before assertions
3. **Clean up test data** after tests
4. **Use fixtures** for consistent test data
5. **Keep tests independent** - each test should work in isolation
6. **Use descriptive test names** that explain what is being tested

## Debugging

### View test report
```bash
pnpm exec playwright show-report
```

### Debug specific test
```bash
pnpm exec playwright test --debug path/to/test.spec.ts
```

### Generate trace
Traces are automatically generated on first retry. View them with:
```bash
pnpm exec playwright show-trace trace.zip
```

## CI/CD Integration

Tests run automatically in CI with:
- 2 retries on failure
- Single worker (sequential execution)
- HTML and JSON reports generated
- Screenshots and videos on failure
