import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../lib/s3";

export async function uploadFileToS3(fileBuffer: Buffer, fileName: string, mimeType: string) {
  const bucketName = process.env.AWS_BUCKET_NAME;
  const key = `uploads/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3.send(command);

  return key;
}
