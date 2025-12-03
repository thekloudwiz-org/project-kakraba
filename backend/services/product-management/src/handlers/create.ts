import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { ProductRepository } from '../repositories/ProductRepository';
import { validatePrice, validateContentIds, validateDownloadQuota } from '../utils/validation';
import { CreateProductRequest, Product } from '../types';

const tableName = process.env.TABLE_NAME || '';
const region = process.env.AWS_REGION || 'eu-central-1';
const productRepo = new ProductRepository(tableName, region);

/**
 * POST /products
 * Create new product
 */
export async function createProduct(
  userId: string,
  request: CreateProductRequest
): Promise<APIGatewayProxyResultV2> {
  try {
    const {
      title,
      description,
      price,
      contentIds,
      accessType,
      downloadQuota,
      allowSubscription,
      productType,
    } = request;

    // Validate required fields
    if (!title || !description || price === undefined || !contentIds || !accessType || !productType) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message:
            'Missing required fields: title, description, price, contentIds, accessType, productType',
        }),
      };
    }

    // Validate price
    const priceValidation = validatePrice(price);
    if (!priceValidation.valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: priceValidation.error,
        }),
      };
    }

    // Validate content IDs
    const contentIdsValidation = validateContentIds(contentIds, productType);
    if (!contentIdsValidation.valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: contentIdsValidation.error,
        }),
      };
    }

    // Validate download quota
    const quotaValidation = validateDownloadQuota(downloadQuota);
    if (!quotaValidation.valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: quotaValidation.error,
        }),
      };
    }

    // Validate access type
    if (!['PURCHASE', 'RENTAL'].includes(accessType)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Access type must be either PURCHASE or RENTAL',
        }),
      };
    }

    // Validate product type
    if (!['SINGLE', 'BUNDLE'].includes(productType)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Product type must be either SINGLE or BUNDLE',
        }),
      };
    }

    // Create product object
    const product: Product = {
      productId: uuidv4(),
      creatorId: userId,
      title,
      description,
      price,
      currency: 'USD',
      contentIds,
      accessType,
      downloadQuota,
      allowSubscription: allowSubscription ?? false,
      productType,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to database
    const savedProduct = await productRepo.createProduct(product);

    return {
      statusCode: 201,
      body: JSON.stringify(savedProduct),
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}
