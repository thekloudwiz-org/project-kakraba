import { DynamoDBRepository } from '../repositories/DynamoDBRepository';
import { AccessValidationResult, AccessType, Intent } from '../types';

export class AccessValidator {
  constructor(private repository: DynamoDBRepository) {}

  /**
   * Validate user's access to a product based on intent
   * @param userId User ID
   * @param productId Product ID
   * @param intent STREAM or DOWNLOAD
   * @returns AccessValidationResult with allowed status and details
   */
  async validateAccess(
    userId: string,
    productId: string,
    intent: Intent
  ): Promise<AccessValidationResult> {
    // Step 1: Check for direct access right
    const directAccess = await this.checkDirectAccessRight(userId, productId, intent);
    if (directAccess.allowed || directAccess.errorMessage) {
      return directAccess;
    }

    // Step 2: If no direct access, check subscription
    const subscriptionAccess = await this.checkSubscriptionAccess(userId, productId, intent);
    if (subscriptionAccess.allowed || subscriptionAccess.errorMessage) {
      return subscriptionAccess;
    }

    // Step 3: No access found
    return {
      allowed: false,
      errorMessage: 'No access rights found'
    };
  }

  /**
   * Check if user has direct access right (purchase or subscription)
   */
  private async checkDirectAccessRight(
    userId: string,
    productId: string,
    intent: Intent
  ): Promise<AccessValidationResult> {
    const accessRight = await this.repository.getAccessRight(userId, productId);
    
    if (!accessRight) {
      return { allowed: false };
    }

    // Get product details to retrieve s3_key and filename
    const product = await this.repository.getProduct(accessRight.creator_id, productId);
    if (!product) {
      return {
        allowed: false,
        errorMessage: 'Product not found'
      };
    }

    // Validate intent based on access type
    const intentValidation = this.validateIntentForAccessType(
      accessRight.access_type,
      intent,
      accessRight.downloads_remaining
    );

    if (!intentValidation.allowed) {
      return intentValidation;
    }

    // Access granted
    return {
      allowed: true,
      accessType: accessRight.access_type,
      downloadsRemaining: accessRight.downloads_remaining,
      s3Key: product.s3_key_source,
      filename: product.title
    };
  }

  /**
   * Check if user has subscription-based access
   */
  private async checkSubscriptionAccess(
    _userId: string,
    _productId: string,
    _intent: Intent
  ): Promise<AccessValidationResult> {
    // We need to find the product to get creator_id and check subscription eligibility
    // Since we don't have creator_id, we need to scan or use a different approach
    // For now, this is a limitation of the current data model
    // In production, you might:
    // 1. Add a GSI on product_id to find the product
    // 2. Pass creator_id in the request
    // 3. Store product metadata in a separate lookup table
    
    // Subscription check requires knowing the creator_id
    // Without it, we cannot validate subscription access
    return { allowed: false };
  }

  /**
   * Validate if the intent is allowed for the given access type
   */
  private validateIntentForAccessType(
    accessType: AccessType,
    intent: Intent,
    downloadsRemaining: number
  ): AccessValidationResult {
    if (accessType === AccessType.PURCHASE) {
      // Purchase allows both stream and download
      if (intent === Intent.STREAM) {
        return { allowed: true };
      }
      
      if (intent === Intent.DOWNLOAD) {
        if (downloadsRemaining > 0) {
          return { allowed: true };
        } else {
          return {
            allowed: false,
            errorMessage: 'Download limit reached'
          };
        }
      }
    }

    if (accessType === AccessType.SUBSCRIPTION) {
      // Subscription only allows streaming
      if (intent === Intent.STREAM) {
        return { allowed: true };
      }
      
      if (intent === Intent.DOWNLOAD) {
        return {
          allowed: false,
          errorMessage: 'Subscription does not allow downloads'
        };
      }
    }

    return { allowed: false };
  }
}
