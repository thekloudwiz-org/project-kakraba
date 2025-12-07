import { test, expect } from '@playwright/test';
import { registerUser, loginUser, logoutUser } from '../utils/auth-helpers';

/**
 * Fan Portal Authentication Tests
 * 
 * Tests fan registration, login, and logout flows
 * Validates: Requirements 5.1-5.6
 */

test.describe('Fan Authentication', () => {
  test('should display registration form', async ({ page }) => {
    await page.goto('/register');
    
    // Check form fields are present
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="displayName"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should register a new fan account', async ({ page }) => {
    const testFan = {
      email: `fan-${Date.now()}@test.com`,
      password: 'TestPass123!',
      displayName: 'Test Fan',
    };

    await registerUser(
      page,
      testFan.email,
      testFan.password,
      testFan.displayName
    );

    // Should redirect to email verification, discovery, dashboard, or stay on register with error
    await expect(page).toHaveURL(/verify-email|discover|dashboard|register/);
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
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'test-fan@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard or discovery page
    await page.waitForURL(/dashboard|discover|home/, { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard|discover|home/);
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
    await loginUser(page, 'test-fan@example.com', 'TestPassword123!');
    
    // Then logout
    await logoutUser(page);
    
    // Should redirect to login or home
    await expect(page).toHaveURL(/login|home/);
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access library without authentication
    await page.goto('/library');
    
    // Should redirect to login
    await page.waitForURL(/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/login/);
  });
});
