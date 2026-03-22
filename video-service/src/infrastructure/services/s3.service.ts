import { Injectable } from '@nestjs/common';
import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IS3Service } from '@/domain/services/s3.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service implements IS3Service {
  private s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: 'test',
      endpoint: this.configService.getOrThrow('MINIO_EXTERNAL_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.getOrThrow('MINIO_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow('MINIO_SECRET_KEY'),
      },
      forcePathStyle: true,
    });
  }

  async getPresignedUrl(fileName: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.configService.getOrThrow('MINIO_BUCKET'),
      Key: fileName,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: this.configService.getOrThrow('PRESIGNED_URL_EXPIRES_IN'),
    });
    return url;
  }

  async deleteFolder(folderKey: string): Promise<void> {
    const listParams = {
      Bucket: this.configService.getOrThrow('MINIO_BUCKET'),
      Prefix: folderKey.endsWith('/') ? folderKey : `${folderKey}/`,
    };

    const listedObjects = await this.s3Client.send(
      new ListObjectsV2Command(listParams),
    );

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return;
    }

    const deleteParams = {
      Bucket: this.configService.getOrThrow('MINIO_BUCKET'),
      Delete: { Objects: listedObjects.Contents.map(({ Key }) => ({ Key })) },
    };

    await this.s3Client.send(new DeleteObjectsCommand(deleteParams));

    if (listedObjects.IsTruncated) {
      await this.deleteFolder(folderKey);
    }
  }
}
