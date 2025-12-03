import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { ProductRepository } from '../repositories/ProductRepository';
import { ListProductsRequest } from '../types';

const tableName = process.env.TABLE_NAME || '';
const region = process.env.AWS_REGION || 'eu-central-1';
const productRepo = new ProductRepository(tableName, region);

/**
 * GET /products
 * List products with filters
 */
export async function listProducts(
  userId: string,
  queryParams: ListProductsRequest
): Promise<APIGatewayProxyResultV2> {
  try {
    const { creatorId, minPrice, maxPrice, productType, page, limit } = queryParams;

    // Use creatorId from query params if provided, otherwise use authenticated user
    const targetCreatorId = creatorId || userId;

    // Parse price filters
    const minPriceNum = minPrice ? parseFloat(minPrice) : undefined;
    const maxPriceNum = maxPrice ? parseFloat(maxPrice) : undefined;

    const result = await productRepo.listProducts(targetCreatorId, {
      page,
      limit,
      productType,
      minPrice: minPriceNum,
      maxPrice: maxPriceNum,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error listing products:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}

/**
 * GET /products/{productId}
 * Get product details
 */
export async function getProduct(
  userId: string,
  productId: string
): Promise<APIGatewayProxyResultV2> {
  try {
    // For now, we assume the user is the creator
    // In a real implementation, we'd need to check if the user has access
    const product = await productRepo.getProduct(userId, productId);

    if (!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Not Found',
          message: 'Product not found',
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(product),
    };
  } catch (error) {
    console.error('Error getting product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}
