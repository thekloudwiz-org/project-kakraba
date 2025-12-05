import { Page } from '@playwright/test';

/**
 * Authentication helper functions for E2E tests
 */

export async function registerUser(
  page: Page,
  email: string,
  password: string,
  displayName: string,
  bio?: string
) {
  await page.goto('/register');
  
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="displayName"]', displayName);
  
  if (bio) {
    await page.fill('textarea[name="bio"]', bio);
  }
  
  await page.click('button[type="submit"]');
  
  // Wait for navigation or success message
  await page.waitForURL(/\/verify-email|\/dashboard|\/discover/, { timeout: 10000 });
}

export async function loginUser(
  page: Page,
  email: string,
  password: string
) {
  await page.goto('/login');
  
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  
  await page.click('button[type="submit"]');
  
  // Wait for navigation to dashboard or discovery page
  await page.waitForURL(/\/dashboard|\/discover/, { timeout: 10000 });
}

export async function logoutUser(page: Page) {
  // Click user menu
  await page.click('[data-testid="user-menu"]');
  
  // Click logout button
  await page.click('[data-testid="logout-button"]');
  
  // Wait for redirect to login
  await page.waitForURL(/\/login/, { timeout: 5000 });
}

export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Check if user menu is visible
    const userMenu = await page.locator('[data-testid="user-menu"]').isVisible();
    return userMenu;
  } catch {
    return false;
  }
}
