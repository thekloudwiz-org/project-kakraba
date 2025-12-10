import { Page } from '@playwright/test';

/**
 * Wait helper functions for E2E tests
 */

export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 10000
) {
  return page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}

export async function waitForToast(page: Page, message?: string | RegExp) {
  const toastSelector = '[data-testid="toast"]';
  const toast = await page.waitForSelector(toastSelector, { timeout: 5000 });

  if (message) {
    if (typeof message === 'string') {
      await page.waitForSelector(`${toastSelector}:has-text("${message}")`, {
        timeout: 5000,
      });
    } else {
      // For regex, check the toast content
      const text = await toast?.textContent();
      if (!text || !message.test(text)) {
        throw new Error(`Toast message does not match pattern: ${message}`);
      }
    }
  }
}

export async function waitForLoadingToComplete(page: Page) {
  // Wait for any loading spinners to disappear
  await page.waitForSelector('[data-testid="loading-spinner"]', {
    state: 'hidden',
    timeout: 10000,
  });
}

export async function waitForModalToOpen(page: Page, modalTestId?: string) {
  const selector = modalTestId
    ? `[data-testid="${modalTestId}"]`
    : '[role="dialog"]';
  
  await page.waitForSelector(selector, { timeout: 5000 });
}

export async function waitForModalToClose(page: Page, modalTestId?: string) {
  const selector = modalTestId
    ? `[data-testid="${modalTestId}"]`
    : '[role="dialog"]';
  
  await page.waitForSelector(selector, { state: 'hidden', timeout: 5000 });
}
