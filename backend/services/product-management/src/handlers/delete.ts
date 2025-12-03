import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { ProductRepository } from '../repositories/ProductRepository';

const tableName = process.env.TABLE_NAME || '';
const region = process.env.AWS_REGION || 'eu-central-1';
const productRepo = new ProductRepository(tableName, region);

/**
 * DELETE /products/{productId}
 * Delete product
 */
export async function deleteProduct(
  userId: string,
  productId: string
): Promise<APIGatewayProxyResultV2> {
  try {
    // First, get the product to verify ownership
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

    // Verify the user is the owner
    if (product.creatorId !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: 'Forbidden',
          message: 'You do not have permission to delete this product',
        }),
      };
    }

    // Delete from DynamoDB
    await productRepo.deleteProduct(userId, productId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Product deleted successfully',
      }),
    };
  } catch (error) {
    console.error('Error deleting product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}
