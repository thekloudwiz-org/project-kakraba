import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { ProductRepository } from '../repositories/ProductRepository';
import { validatePrice, validateContentIds, validateDownloadQuota } from '../utils/validation';
import { UpdateProductRequest } from '../types';

const tableName = process.env.TABLE_NAME || '';
const region = process.env.AWS_REGION || 'eu-central-1';
const productRepo = new ProductRepository(tableName, region);

/**
 * PUT /products/{productId}
 * Update product
 */
export async function updateProduct(
  userId: string,
  productId: string,
  updates: UpdateProductRequest
): Promise<APIGatewayProxyResultV2> {
  try {
    // Validate that at least one field is provided
    if (
      !updates.title &&
      !updates.description &&
      updates.price === undefined &&
      !updates.contentIds &&
      !updates.accessType &&
      updates.downloadQuota === undefined &&
      updates.allowSubscription === undefined &&
      updates.isActive === undefined
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'At least one field must be provided for update',
        }),
      };
    }

    // Validate price if provided
    if (updates.price !== undefined) {
      const priceValidation = validatePrice(updates.price);
      if (!priceValidation.valid) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Bad Request',
            message: priceValidation.error,
          }),
        };
      }
    }

    // Validate content IDs if provided
    if (updates.contentIds) {
      // Get existing product to check product type
      const existing = await productRepo.getProduct(userId, productId);
      if (!existing) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            error: 'Not Found',
            message: 'Product not found',
          }),
        };
      }

      const contentIdsValidation = validateContentIds(updates.contentIds, existing.productType);
      if (!contentIdsValidation.valid) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Bad Request',
            message: contentIdsValidation.error,
          }),
        };
      }
    }

    // Validate download quota if provided
    if (updates.downloadQuota !== undefined) {
      const quotaValidation = validateDownloadQuota(updates.downloadQuota);
      if (!quotaValidation.valid) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Bad Request',
            message: quotaValidation.error,
          }),
        };
      }
    }

    // Validate access type if provided
    if (updates.accessType && !['PURCHASE', 'RENTAL'].includes(updates.accessType)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Access type must be either PURCHASE or RENTAL',
        }),
      };
    }

    const product = await productRepo.updateProduct(userId, productId, updates);

    return {
      statusCode: 200,
      body: JSON.stringify(product),
    };
  } catch (error) {
    console.error('Error updating product:', error);

    if (error instanceof Error && error.message === 'Product not found') {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Not Found',
          message: 'Product not found',
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}
