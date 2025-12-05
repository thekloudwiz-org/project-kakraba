/**
 * GDPR Compliance Handlers
 * 
 * Implements data deletion and export functionality
 * Validates: Requirements 11.6
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB, S3 } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient();
const s3 = new S3();

const TABLE_NAME = process.env.TABLE_NAME || 'CreatorVault';
const CONTENT_BUCKET = process.env.CONTENT_BUCKET || '';

interface UserData {
  profile: any;
  content: any[];
  products: any[];
  purchases: any[];
  subscriptions: any[];
  transactions: any[];
  analytics: any[];
}

/**
 * Export all user data (GDPR Right to Data Portability)
 */
export async function exportUserData(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub;
    
    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    // Collect all user data
    const userData: UserData = {
      profile: await getUserProfile(userId),
      content: await getUserContent(userId),
      products: await getUserProducts(userId),
      purchases: await getUserPurchases(userId),
      subscriptions: await getUserSubscriptions(userId),
      transactions: await getUserTransactions(userId),
      analytics: await getUserAnalytics(userId),
    };

    // Add metadata
    const exportData = {
      exportDate: new Date().toISOString(),
      userId,
      data: userData,
      dataRetentionPolicy: 'Data will be retained for 7 years as required by law',
      rightsInformation: {
        rightToAccess: 'You have the right to access your personal data',
        rightToRectification: 'You have the right to correct inaccurate data',
        rightToErasure: 'You have the right to request deletion of your data',
        rightToDataPortability: 'You have the right to receive your data in a structured format',
        rightToObject: 'You have the right to object to processing of your data',
      },
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="user-data-${userId}-${Date.now()}.json"`,
      },
      body: JSON.stringify(exportData, null, 2),
    };
  } catch (error) {
    console.error('Error exporting user data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to export user data' }),
    };
  }
}

/**
 * Delete all user data (GDPR Right to Erasure)
 */
export async function deleteUserData(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub;
    
    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    // Parse request body for confirmation
    const body = JSON.parse(event.body || '{}');
    if (body.confirmation !== 'DELETE_MY_DATA') {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Confirmation required',
          message: 'Please confirm deletion by sending { "confirmation": "DELETE_MY_DATA" }',
        }),
      };
    }

    // Delete user data in order
    await deleteUserProfile(userId);
    await deleteUserContent(userId);
    await deleteUserProducts(userId);
    await deleteUserPurchases(userId);
    await deleteUserSubscriptions(userId);
    await deleteUserTransactions(userId);
    await deleteUserAnalytics(userId);
    await deleteUserAccessRights(userId);

    // Log deletion for audit trail
    await logDataDeletion(userId);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'All user data has been deleted',
        deletionDate: new Date().toISOString(),
        userId,
      }),
    };
  } catch (error) {
    console.error('Error deleting user data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to delete user data' }),
    };
  }
}

// Helper functions to retrieve user data

async function getUserProfile(userId: string): Promise<any> {
  const result = await dynamodb.get({
    TableName: TABLE_NAME,
    Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
  }).promise();
  
  return result.Item || null;
}

async function getUserContent(userId: string): Promise<any[]> {
  const result = await dynamodb.query({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `CREATOR#${userId}`,
      ':sk': 'CONTENT#',
    },
  }).promise();
  
  return result.Items || [];
}

async function getUserProducts(userId: string): Promise<any[]> {
  const result = await dynamodb.query({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `CREATOR#${userId}`,
      ':sk': 'PRODUCT#',
    },
  }).promise();
  
  return result.Items || [];
}

async function getUserPurchases(userId: string): Promise<any[]> {
  const result = await dynamodb.query({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'ACCESS#',
    },
  }).promise();
  
  return result.Items || [];
}

async function getUserSubscriptions(userId: string): Promise<any[]> {
  const result = await dynamodb.query({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'SUBSCRIPTION#',
    },
  }).promise();
  
  return result.Items || [];
}

async function getUserTransactions(userId: string): Promise<any[]> {
  const result = await dynamodb.query({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'TRANSACTION#',
    },
  }).promise();
  
  return result.Items || [];
}

async function getUserAnalytics(userId: string): Promise<any[]> {
  const result = await dynamodb.query({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `ANALYTICS#${userId}`,
    },
  }).promise();
  
  return result.Items || [];
}

// Helper functions to delete user data

async function deleteUserProfile(userId: string): Promise<void> {
  await dynamodb.delete({
    TableName: TABLE_NAME,
    Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
  }).promise();
}

async function deleteUserContent(userId: string): Promise<void> {
  const content = await getUserContent(userId);
  
  for (const item of content) {
    // Delete from DynamoDB
    await dynamodb.delete({
      TableName: TABLE_NAME,
      Key: { PK: item.PK, SK: item.SK },
    }).promise();
    
    // Delete from S3
    if (item.s3Key && CONTENT_BUCKET) {
      await s3.deleteObject({
        Bucket: CONTENT_BUCKET,
        Key: item.s3Key,
      }).promise();
    }
  }
}

async function deleteUserProducts(userId: string): Promise<void> {
  const products = await getUserProducts(userId);
  
  for (const item of products) {
    await dynamodb.delete({
      TableName: TABLE_NAME,
      Key: { PK: item.PK, SK: item.SK },
    }).promise();
  }
}

async function deleteUserPurchases(userId: string): Promise<void> {
  const purchases = await getUserPurchases(userId);
  
  for (const item of purchases) {
    await dynamodb.delete({
      TableName: TABLE_NAME,
      Key: { PK: item.PK, SK: item.SK },
    }).promise();
  }
}

async function deleteUserSubscriptions(userId: string): Promise<void> {
  const subscriptions = await getUserSubscriptions(userId);
  
  for (const item of subscriptions) {
    await dynamodb.delete({
      TableName: TABLE_NAME,
      Key: { PK: item.PK, SK: item.SK },
    }).promise();
  }
}

async function deleteUserTransactions(userId: string): Promise<void> {
  const transactions = await getUserTransactions(userId);
  
  for (const item of transactions) {
    await dynamodb.delete({
      TableName: TABLE_NAME,
      Key: { PK: item.PK, SK: item.SK },
    }).promise();
  }
}

async function deleteUserAnalytics(userId: string): Promise<void> {
  const analytics = await getUserAnalytics(userId);
  
  for (const item of analytics) {
    await dynamodb.delete({
      TableName: TABLE_NAME,
      Key: { PK: item.PK, SK: item.SK },
    }).promise();
  }
}

async function deleteUserAccessRights(userId: string): Promise<void> {
  // Delete access rights where user is the owner
  const result = await dynamodb.query({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'ACCESS#',
    },
  }).promise();
  
  for (const item of result.Items || []) {
    await dynamodb.delete({
      TableName: TABLE_NAME,
      Key: { PK: item.PK, SK: item.SK },
    }).promise();
  }
}

async function logDataDeletion(userId: string): Promise<void> {
  // Log deletion for audit trail (required for compliance)
  await dynamodb.put({
    TableName: TABLE_NAME,
    Item: {
      PK: 'AUDIT#DATA_DELETION',
      SK: `${Date.now()}#${userId}`,
      userId,
      action: 'DATA_DELETION',
      timestamp: new Date().toISOString(),
      reason: 'User requested data deletion (GDPR Right to Erasure)',
    },
  }).promise();
}
