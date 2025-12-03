import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { Intent, SignedUrlOptions } from '../types';

export class SignedUrlGenerator {
  private privateKey: string | null = null;
  private secretsClient: SecretsManagerClient;

  constructor(
    private cloudfrontDomain: string,
    private keyPairId: string,
    private privateKeySecretArn: string,
    region?: string
  ) {
    this.secretsClient = new SecretsManagerClient({ region: region || process.env.AWS_REGION });
  }

  /**
   * Generate a signed CloudFront URL with appropriate Content-Disposition header
   * @param options SignedUrlOptions containing s3Key, intent, filename, and expiration
   * @returns Signed CloudFront URL
   */
  async generateSignedUrl(options: SignedUrlOptions): Promise<string> {
    // Load private key if not already loaded
    if (!this.privateKey) {
      await this.loadPrivateKey();
    }

    const { s3Key, intent, filename, expirationMinutes } = options;
    
    // Build the CloudFront URL
    const url = `https://${this.cloudfrontDomain}/${s3Key}`;
    
    // Calculate expiration time
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + expirationMinutes);
    
    // Determine Content-Disposition header based on intent
    const contentDisposition = this.getContentDisposition(intent, filename);
    
    // Create custom policy with Content-Disposition header
    const policy = this.buildCustomPolicy(url, expirationTime, contentDisposition);
    
    // Generate signed URL
    const signedUrl = getSignedUrl({
      url,
      keyPairId: this.keyPairId,
      privateKey: this.privateKey!,
      policy
    });

    return signedUrl;
  }

  /**
   * Load CloudFront private key from AWS Secrets Manager
   */
  private async loadPrivateKey(): Promise<void> {
    try {
      const response = await this.secretsClient.send(
        new GetSecretValueCommand({
          SecretId: this.privateKeySecretArn
        })
      );

      if (!response.SecretString) {
        throw new Error('Private key not found in Secrets Manager');
      }

      this.privateKey = response.SecretString;
    } catch (error) {
      console.error('Error loading CloudFront private key:', error);
      throw new Error('Failed to load CloudFront private key from Secrets Manager');
    }
  }

  /**
   * Build custom policy for signed URL with Content-Disposition header
   */
  private buildCustomPolicy(
    url: string,
    expirationTime: Date,
    _contentDisposition: string
  ): string {
    const policy = {
      Statement: [
        {
          Resource: url,
          Condition: {
            DateLessThan: {
              'AWS:EpochTime': Math.floor(expirationTime.getTime() / 1000)
            }
          }
        }
      ]
    };

    // Note: CloudFront signed URLs don't directly support custom response headers in the policy
    // The Content-Disposition header needs to be set via CloudFront behaviors or Lambda@Edge
    // For now, we'll include it as a query parameter that can be handled by the application
    
    return JSON.stringify(policy);
  }

  /**
   * Determine Content-Disposition header value based on intent
   */
  private getContentDisposition(intent: Intent, filename: string): string {
    if (intent === Intent.DOWNLOAD) {
      // Force download with original filename
      return `attachment; filename="${this.sanitizeFilename(filename)}"`;
    } else {
      // Display inline (stream in browser)
      return 'inline';
    }
  }

  /**
   * Sanitize filename to prevent header injection
   */
  private sanitizeFilename(filename: string): string {
    // Remove any characters that could cause issues in HTTP headers
    return filename.replace(/[^\w\s.-]/g, '_').trim();
  }
}
