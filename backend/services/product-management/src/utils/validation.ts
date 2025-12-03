import { MIN_PRICE, MAX_PRICE } from '../types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate product price
 */
export function validatePrice(price: number): ValidationResult {
  if (typeof price !== 'number' || isNaN(price)) {
    return {
      valid: false,
      error: 'Price must be a valid number',
    };
  }

  if (price < MIN_PRICE) {
    return {
      valid: false,
      error: `Price must be at least $${MIN_PRICE}`,
    };
  }

  if (price > MAX_PRICE) {
    return {
      valid: false,
      error: `Price cannot exceed $${MAX_PRICE}`,
    };
  }

  // Validate to 2 decimal places (account for floating point precision)
  const priceInCents = Math.round(price * 100);
  const reconstructedPrice = priceInCents / 100;
  if (Math.abs(price - reconstructedPrice) > 0.001) {
    return {
      valid: false,
      error: 'Price must have at most 2 decimal places',
    };
  }

  return { valid: true };
}

/**
 * Validate content IDs
 */
export function validateContentIds(
  contentIds: string[],
  productType: 'SINGLE' | 'BUNDLE'
): ValidationResult {
  if (!Array.isArray(contentIds)) {
    return {
      valid: false,
      error: 'Content IDs must be an array',
    };
  }

  if (contentIds.length === 0) {
    return {
      valid: false,
      error: 'At least one content item must be selected',
    };
  }

  if (productType === 'SINGLE' && contentIds.length > 1) {
    return {
      valid: false,
      error: 'Single products can only contain one content item',
    };
  }

  // Check for duplicates
  const uniqueIds = new Set(contentIds);
  if (uniqueIds.size !== contentIds.length) {
    return {
      valid: false,
      error: 'Content IDs must be unique',
    };
  }

  return { valid: true };
}

/**
 * Validate download quota
 */
export function validateDownloadQuota(quota?: number): ValidationResult {
  if (quota === undefined) {
    return { valid: true };
  }

  if (typeof quota !== 'number' || isNaN(quota)) {
    return {
      valid: false,
      error: 'Download quota must be a valid number',
    };
  }

  if (quota < 0) {
    return {
      valid: false,
      error: 'Download quota cannot be negative',
    };
  }

  if (!Number.isInteger(quota)) {
    return {
      valid: false,
      error: 'Download quota must be an integer',
    };
  }

  return { valid: true };
}
