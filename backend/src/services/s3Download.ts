import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../lib/s3";

export async function downloadFromS3(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  const response = await s3.send(command);

  if (!response.Body) throw new Error("S3 file has no body.");

  const chunks: Uint8Array[] = [];

  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks.map((c) => Buffer.from(c)));
}
