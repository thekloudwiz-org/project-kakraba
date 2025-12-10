import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBRepository } from '../repositories/DynamoDBRepository';
import { AccessValidator } from '../services/AccessValidator';
import { SignedUrlGenerator } from '../services/SignedUrlGenerator';
import { ContentHandler } from './contentHandler';
import { ProductHandler } from './productHandler';
import { AccessRequest, AccessResponse, ErrorResponse, Intent, Config } from '../types';

// Load configuration from environment variables
const config: Config = {
  tableName: process.env.TABLE_NAME!,
  cloudfrontDomain: process.env.CLOUDFRONT_DOMAIN!,
  cloudfrontKeyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
  cloudfrontPrivateKeySecretArn: process.env.CLOUDFRONT_PRIVATE_KEY_SECRET_ARN!,
  nodeEnv: process.env.NODE_ENV || 'production'
};

const bucketName = process.env.BUCKET_NAME!;

// Initialize services (reuse across invocations)
const repository = new DynamoDBRepository(config.tableName);
const validator = new AccessValidator(repository);
const urlGenerator = new SignedUrlGenerator(
  config.cloudfrontDomain,
  config.cloudfrontKeyPairId,
  config.cloudfrontPrivateKeySecretArn
);
const contentHandler = new ContentHandler(bucketName, config.tableName);
const productHandler = new ProductHandler(config.tableName);

/**
 * Lambda handler for API Gateway requests
 * Routes requests to appropriate handlers based on path
 */
export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const path = event.rawPath;

  try {
    // Route product management requests
    if (path.startsWith('/products')) {
      return await productHandler.handle(event);
    }

    // Route content management requests
    if (path.startsWith('/content')) {
      return await contentHandler.handle(event);
    }

    // Route access control requests
    if (path === '/access/generate-link') {
      return await handleAccessControl(event);
    }

    // Unknown route
    return errorResponse(404, 'NotFound', 'Endpoint not found');

  } catch (error: any) {
    console.error('Error processing request:', error);
    return errorResponse(500, 'InternalServerError', 'An error occurred processing your request');
  }
};

/**
 * Handle access control requests for content delivery
 * Validates user access and generates signed CloudFront URLs
 */
async function handleAccessControl(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    // Parse and validate request body
    const request = parseRequest(event);

    // Validate access
    const validationResult = await validator.validateAccess(
      request.user_id,
      request.product_id,
      request.intent
    );

    if (!validationResult.allowed) {
      return errorResponse(403, 'AccessDenied', validationResult.errorMessage || 'Access denied');
    }

    // If download intent, decrement counter
    if (request.intent === Intent.DOWNLOAD && validationResult.accessType === 'PURCHASE') {
      try {
        await repository.decrementDownloads(request.user_id, request.product_id);
      } catch (error: any) {
        if (error.message === 'Download limit reached') {
          return errorResponse(403, 'DownloadLimitReached', 'Download limit reached');
        }
        throw error;
      }
    }

    // Generate signed URL
    const signedUrl = await urlGenerator.generateSignedUrl({
      s3Key: validationResult.s3Key!,
      intent: request.intent,
      filename: validationResult.filename!,
      expirationMinutes: 15
    });

    // Calculate expiration timestamp
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Build success response
    const response: AccessResponse = {
      url: signedUrl,
      expires_at: expiresAt.toISOString(),
      access_type: validationResult.accessType!,
      ...(validationResult.downloadsRemaining !== undefined && {
        downloads_remaining: validationResult.downloadsRemaining
      })
    };

    return successResponse(response);

  } catch (error: any) {
    console.error('Error in access control handler:', error);

    // Check if it's a validation error (400)
    if (error.message?.includes('Missing required parameter') ||
        error.message?.includes('Invalid intent') ||
        error.message?.includes('Invalid JSON')) {
      return errorResponse(400, 'InvalidRequest', error.message);
    }

    throw error;
  }
}

/**
 * Parse and validate request from API Gateway event
 */
function parseRequest(event: APIGatewayProxyEventV2): AccessRequest {
  if (!event.body) {
    throw new Error('Missing required parameter: body');
  }

  let body: any;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }

  // Validate required parameters
  if (!body.product_id) {
    throw new Error('Missing required parameter: product_id');
  }

  if (!body.user_id) {
    throw new Error('Missing required parameter: user_id');
  }

  if (!body.intent) {
    throw new Error('Missing required parameter: intent');
  }

  // Validate intent value
  if (body.intent !== 'STREAM' && body.intent !== 'DOWNLOAD') {
    throw new Error('Invalid intent: must be STREAM or DOWNLOAD');
  }

  return {
    product_id: body.product_id,
    user_id: body.user_id,
    intent: body.intent as Intent
  };
}

/**
 * Build success response
 */
function successResponse(data: AccessResponse): APIGatewayProxyResultV2 {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(data)
  };
}

/**
 * Build error response
 */
function errorResponse(statusCode: number, error: string, message: string): APIGatewayProxyResultV2 {
  const errorBody: ErrorResponse = {
    error,
    message
  };

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(errorBody)
  };
}
