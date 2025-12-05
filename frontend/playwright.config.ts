import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E tests
 * Tests both Creator Portal and Fan Portal
 */
export default defineConfig({
  testDir: './e2e-tests',
  
  // Maximum time one test can run
  timeout: 30 * 1000,
  
  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  // Shared settings for all tests
  use: {
    // Base URL for tests
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Collect trace on first retry
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for different portals and browsers
  projects: [
    {
      name: 'landing-page-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: process.env.LANDING_URL || 'http://localhost:3000'
      },
      testMatch: /landing-page\/.*.spec.ts/,
    },
    
    {
      name: 'creator-portal-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: process.env.CREATOR_URL || 'http://localhost:3001'
      },
      testMatch: /creator-portal\/.*.spec.ts/,
    },
    
    {
      name: 'fan-portal-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: process.env.FAN_URL || 'http://localhost:3002'
      },
      testMatch: /fan-portal\/.*.spec.ts/,
    },
  ],

  // Run local dev servers before starting tests
  webServer: [
    {
      command: 'pnpm --filter landing-page dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'pnpm --filter creator-portal dev',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'pnpm --filter fan-portal dev',
      url: 'http://localhost:3002',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
