import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_REGION;
const bucket = process.env.AWS_S3_BUCKET;

if (!region || !bucket) {
  throw new Error("Missing AWS_REGION or AWS_S3_BUCKET env variables");
}

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
  }
});

export async function getPresignedUploadUrl(params: {
  key: string;
  contentType: string;
}) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: params.key,
    ContentType: params.contentType
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  return { url, bucket, key: params.key };
}

export const S3_BUCKET = bucket;
export const S3_REGION = region;

export async function deleteObjectFromS3(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key
  });
  await s3Client.send(command);
}



