import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3Service {
  private s3Client: S3Client;
  private bucket: string;

  constructor(bucket: string, region: string = 'eu-central-1') {
    this.s3Client = new S3Client({ region });
    this.bucket = bucket;
  }

  /**
   * Generate presigned URL for upload
   */
  async generateUploadUrl(
    s3Key: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      ContentType: contentType,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Delete object from S3
   */
  async deleteObject(s3Key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
    });

    await this.s3Client.send(command);
  }
}
