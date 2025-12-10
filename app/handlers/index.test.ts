import * as fc from 'fast-check';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

// Create mock instances that we can control
const mockRepository = {
  getAccessRight: jest.fn(),
  getProduct: jest.fn(),
  hasValidSubscription: jest.fn(),
  decrementDownloads: jest.fn()
};

const mockValidator = {
  validateAccess: jest.fn()
};

const mockUrlGenerator = {
  generateSignedUrl: jest.fn()
};

// Mock all dependencies BEFORE importing handler
jest.mock('../repositories/DynamoDBRepository', () => ({
  DynamoDBRepository: jest.fn().mockImplementation(() => mockRepository)
}));

jest.mock('../services/AccessValidator', () => ({
  AccessValidator: jest.fn().mockImplementation(() => mockValidator)
}));

jest.mock('../services/SignedUrlGenerator', () => ({
  SignedUrlGenerator: jest.fn().mockImplementation(() => mockUrlGenerator)
}));

// Import handler AFTER mocks are set up
import { handler } from './index';

// Helper to create APIGatewayProxyEventV2
function createV2Event(body: string): APIGatewayProxyEventV2 {
  return {
    version: '2.0',
    routeKey: 'POST /access/generate-link',
    rawPath: '/access/generate-link',
    rawQueryString: '',
    headers: {},
    requestContext: {
      accountId: '123456789012',
      apiId: 'api-id',
      domainName: 'api.example.com',
      domainPrefix: 'api',
      http: {
        method: 'POST',
        path: '/access/generate-link',
        protocol: 'HTTP/1.1',
        sourceIp: '127.0.0.1',
        userAgent: 'test-agent'
      },
      requestId: 'test-request-id',
      routeKey: 'POST /access/generate-link',
      stage: '$default',
      time: '01/Jan/2024:00:00:00 +0000',
      timeEpoch: 1704067200000
    },
    body,
    isBase64Encoded: false
  };
}

// Type guard for APIGatewayProxyResultV2 object form
interface APIGatewayProxyStructuredResultV2 {
  statusCode?: number;
  headers?: { [header: string]: boolean | number | string };
  body?: string;
  isBase64Encoded?: boolean;
  cookies?: string[];
}

function isStructuredResult(result: APIGatewayProxyResultV2): result is APIGatewayProxyStructuredResultV2 {
  return typeof result === 'object' && result !== null;
}

describe('Lambda Handler Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Unit Tests - Edge Cases', () => {
    it('should return 400 when product_id is missing', async () => {
      const event = createV2Event(JSON.stringify({
        user_id: 'user-123',
        intent: 'STREAM'
      }));

      const result = await handler(event);

      expect(isStructuredResult(result)).toBe(true);
      if (isStructuredResult(result)) {
        expect(result.statusCode).toBe(400);
        const body = JSON.parse(result.body!);
        expect(body.error).toBe('InvalidRequest');
        expect(body.message).toContain('product_id');
      }
    });

    it('should return 400 when user_id is missing', async () => {
      const event = createV2Event(JSON.stringify({
        product_id: 'prod-456',
        intent: 'STREAM'
      }));

      const result = await handler(event);

      expect(isStructuredResult(result)).toBe(true);
      if (isStructuredResult(result)) {
        expect(result.statusCode).toBe(400);
        const body = JSON.parse(result.body!);
        expect(body.error).toBe('InvalidRequest');
        expect(body.message).toContain('user_id');
      }
    });

    it('should return 400 when intent is missing', async () => {
      const event = createV2Event(JSON.stringify({
        product_id: 'prod-456',
        user_id: 'user-123'
      }));

      const result = await handler(event);

      expect(isStructuredResult(result)).toBe(true);
      if (isStructuredResult(result)) {
        expect(result.statusCode).toBe(400);
        const body = JSON.parse(result.body!);
        expect(body.error).toBe('InvalidRequest');
        expect(body.message).toContain('intent');
      }
    });

    it('should return 400 when intent is invalid', async () => {
      const event = createV2Event(JSON.stringify({
        product_id: 'prod-456',
        user_id: 'user-123',
        intent: 'INVALID'
      }));

      const result = await handler(event);

      expect(isStructuredResult(result)).toBe(true);
      if (isStructuredResult(result)) {
        expect(result.statusCode).toBe(400);
        const body = JSON.parse(result.body!);
        expect(body.error).toBe('InvalidRequest');
        expect(body.message).toContain('STREAM or DOWNLOAD');
      }
    });

    it('should return 400 when body is malformed JSON', async () => {
      const event = createV2Event('not valid json {');

      const result = await handler(event);

      expect(isStructuredResult(result)).toBe(true);
      if (isStructuredResult(result)) {
        expect(result.statusCode).toBe(400);
        const body = JSON.parse(result.body!);
        expect(body.error).toBe('InvalidRequest');
      }
    });

    it('should return 400 when body is missing', async () => {
      const event = createV2Event('');

      const result = await handler(event);

      expect(isStructuredResult(result)).toBe(true);
      if (isStructuredResult(result)) {
        expect(result.statusCode).toBe(400);
        const body = JSON.parse(result.body!);
        expect(body.error).toBe('InvalidRequest');
      }
    });

    it('should return 403 with "No access rights found" when user has no access', async () => {
      mockValidator.validateAccess.mockResolvedValueOnce({
        allowed: false,
        errorMessage: 'No access rights found'
      });

      const event = createV2Event(JSON.stringify({
        product_id: 'prod-123',
        user_id: 'user-456',
        intent: 'STREAM'
      }));

      const result = await handler(event);

      expect(isStructuredResult(result)).toBe(true);
      if (isStructuredResult(result)) {
        expect(result.statusCode).toBe(403);
        const body = JSON.parse(result.body!);
        expect(body.error).toBe('AccessDenied');
        expect(body.message).toBe('No access rights found');
      }
    });

    it('should return 403 with "Download limit reached" when downloads exhausted', async () => {
      mockValidator.validateAccess.mockResolvedValueOnce({
        allowed: true,
        accessType: 'PURCHASE',
        downloadsRemaining: 0,
        s3Key: 'content/test.mp4',
        filename: 'test.mp4'
      });

      mockRepository.decrementDownloads.mockRejectedValueOnce(new Error('Download limit reached'));

      const event = createV2Event(JSON.stringify({
        product_id: 'prod-123',
        user_id: 'user-456',
        intent: 'DOWNLOAD'
      }));

      const result = await handler(event);

      expect(isStructuredResult(result)).toBe(true);
      if (isStructuredResult(result)) {
        expect(result.statusCode).toBe(403);
        const body = JSON.parse(result.body!);
        expect(body.error).toBe('DownloadLimitReached');
        expect(body.message).toBe('Download limit reached');
      }
    });

    it('should return 403 with "Subscription does not allow downloads" for subscription download attempt', async () => {
      mockValidator.validateAccess.mockResolvedValueOnce({
        allowed: false,
        errorMessage: 'Subscription does not allow downloads'
      });

      const event = createV2Event(JSON.stringify({
        product_id: 'prod-123',
        user_id: 'user-456',
        intent: 'DOWNLOAD'
      }));

      const result = await handler(event);

      expect(isStructuredResult(result)).toBe(true);
      if (isStructuredResult(result)) {
        expect(result.statusCode).toBe(403);
        const body = JSON.parse(result.body!);
        expect(body.error).toBe('AccessDenied');
        expect(body.message).toBe('Subscription does not allow downloads');
      }
    });

    it('should return 403 with "This content type requires purchase" for static content subscription attempt', async () => {
      mockValidator.validateAccess.mockResolvedValueOnce({
        allowed: false,
        errorMessage: 'This content type requires purchase'
      });

      const event = createV2Event(JSON.stringify({
        product_id: 'prod-123',
        user_id: 'user-456',
        intent: 'STREAM'
      }));

      const result = await handler(event);

      expect(isStructuredResult(result)).toBe(true);
      if (isStructuredResult(result)) {
        expect(result.statusCode).toBe(403);
        const body = JSON.parse(result.body!);
        expect(body.error).toBe('AccessDenied');
        expect(body.message).toBe('This content type requires purchase');
      }
    });
  });

  describe('Property Tests', () => {
    // Feature: content-access-control, Property 16: Valid requests parse successfully
    it('Property 16: should parse all valid requests successfully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            productId: fc.uuid(),
            userId: fc.uuid(),
            intent: fc.constantFrom('STREAM' as const, 'DOWNLOAD' as const)
          }),
          async ({ productId, userId, intent }) => {
            const event = createV2Event(JSON.stringify({
              product_id: productId,
              user_id: userId,
              intent: intent
            }));

            // The handler will fail at validation since we're not mocking services
            // But it should successfully parse the request (not return 400 for parsing)
            const result = await handler(event);

            // Property: Should not fail with parsing error (400 with "Missing required parameter")
            if (isStructuredResult(result) && result.statusCode === 400) {
              const body = JSON.parse(result.body!);
              expect(body.message).not.toContain('Missing required parameter');
              expect(body.message).not.toContain('Invalid intent');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: content-access-control, Property 14: Error responses have proper structure
    it('Property 14: should return properly structured error responses', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            missingField: fc.constantFrom('product_id', 'user_id', 'intent')
          }),
          async ({ missingField }) => {
            const body: any = {
              product_id: 'prod-123',
              user_id: 'user-456',
              intent: 'STREAM'
            };
            
            delete body[missingField];

            const event = createV2Event(JSON.stringify(body));

            const result = await handler(event);

            // Property: All error responses should have proper structure
            expect(isStructuredResult(result)).toBe(true);
            if (isStructuredResult(result)) {
              expect(result.statusCode).toBeGreaterThanOrEqual(400);
              expect(result.headers).toHaveProperty('Content-Type');
              expect(result.headers?.['Content-Type']).toBe('application/json');
              
              const responseBody = JSON.parse(result.body!);
              expect(responseBody).toHaveProperty('error');
              expect(responseBody).toHaveProperty('message');
              expect(typeof responseBody.error).toBe('string');
              expect(typeof responseBody.message).toBe('string');
              expect(responseBody.error).toBeTruthy();
              expect(responseBody.message).toBeTruthy();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: content-access-control, Property 15: DynamoDB errors propagate correctly
    it('Property 15: should propagate DynamoDB errors without exposing internal details', async () => {
      const { DynamoDBRepository } = require('../repositories/DynamoDBRepository');
      const { AccessValidator } = require('../services/AccessValidator');
      
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            productId: fc.uuid(),
            userId: fc.uuid(),
            intent: fc.constantFrom('STREAM' as const, 'DOWNLOAD' as const),
            errorType: fc.constantFrom(
              'NetworkError',
              'ServiceUnavailable',
              'ThrottlingException',
              'InternalServerError'
            )
          }),
          async ({ productId, userId, intent, errorType }) => {
            // Mock DynamoDB repository to throw an error
            const mockError = new Error(`DynamoDB ${errorType}`);
            mockError.name = errorType;
            
            DynamoDBRepository.mockImplementation(() => ({
              getAccessRight: jest.fn().mockRejectedValue(mockError),
              getProduct: jest.fn().mockRejectedValue(mockError),
              hasValidSubscription: jest.fn().mockRejectedValue(mockError),
              decrementDownloads: jest.fn().mockRejectedValue(mockError)
            }));

            AccessValidator.mockImplementation(() => ({
              validateAccess: jest.fn().mockRejectedValue(mockError)
            }));

            const event = createV2Event(JSON.stringify({
              product_id: productId,
              user_id: userId,
              intent: intent
            }));

            const result = await handler(event);

            // Property: DynamoDB errors should be caught and transformed to 500 errors
            expect(isStructuredResult(result)).toBe(true);
            if (isStructuredResult(result)) {
              expect(result.statusCode).toBe(500);
              expect(result.headers).toHaveProperty('Content-Type');
              expect(result.headers?.['Content-Type']).toBe('application/json');
              
              const responseBody = JSON.parse(result.body!);
              expect(responseBody).toHaveProperty('error');
              expect(responseBody).toHaveProperty('message');
              
              // Should not expose internal error details
              expect(responseBody.message).not.toContain('DynamoDB');
              expect(responseBody.message).not.toContain(errorType);
              expect(responseBody.error).toBe('InternalServerError');
              expect(responseBody.message).toBe('An error occurred processing your request');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
