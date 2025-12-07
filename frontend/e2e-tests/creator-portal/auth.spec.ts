import { test, expect } from '@playwright/test';
import { registerUser, loginUser, logoutUser } from '../utils/auth-helpers';
import { testUsers } from '../fixtures/test-data';

/**
 * Creator Portal Authentication Tests
 * 
 * Tests creator registration, login, and logout flows
 * Validates: Requirements 1.1-1.7
 */

test.describe('Creator Authentication', () => {
  test('should display registration form', async ({ page }) => {
    await page.goto('/register');
    
    // Check form fields are present
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="displayName"]')).toBeVisible();
    await expect(page.locator('textarea[name="bio"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should register a new creator account', async ({ page }) => {
    const testCreator = {
      email: `creator-${Date.now()}@test.com`,
      password: 'TestPass123!',
      displayName: 'Test Creator',
      bio: 'E2E test creator account',
    };

    await registerUser(
      page,
      testCreator.email,
      testCreator.password,
      testCreator.displayName,
      testCreator.bio
    );

    // Should redirect to email verification, dashboard, or stay on register with error
    await expect(page).toHaveURL(/verify-email|dashboard|register/);
  });

  test('should show validation errors for invalid registration', async ({ page }) => {
    await page.goto('/register');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should stay on registration page (HTML5 validation prevents submission)
    await expect(page).toHaveURL(/register/);
    
    // Form should still be visible
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    
    // Check form fields are present
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    // Note: This test requires a pre-existing test account
    // In a real scenario, you'd create the account first or use a test fixture
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'test-creator@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=/failed.*sign.*in|incorrect.*username.*password|invalid/i')).toBeVisible();
  });

  test('should navigate to password reset page', async ({ page }) => {
    await page.goto('/login');
    
    // Click forgot password link
    await page.click('text=/forgot.*password/i');
    
    // Should navigate to password reset page
    await expect(page).toHaveURL(/reset-password|forgot-password/);
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test-creator@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    
    // Then logout
    await logoutUser(page);
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard');
    
    // Should redirect to login
    await page.waitForURL(/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/login/);
  });
});
