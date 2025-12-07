import { GetObjectCommand } from "@aws-sdk/client-s3";
import type { Readable } from "node:stream";
import { s3 } from "../lib/s3";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { safeParseResume } from "./aiResumeParser";
import { logger } from "../lib/logger";

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function parseResumeFromS3(bucket: string, key: string, mimeType: string) {
  logger.info({ bucket, key }, "Starting S3 resume parsing");
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const response = await s3.send(command);

  const fileBuffer = await streamToBuffer(response.Body as Readable);
  const uint8Array = new Uint8Array(fileBuffer);

  if (mimeType === "application/pdf") {
    const parser = new PDFParse(uint8Array);
    const result = await parser.getText();
    const parsedResume = await safeParseResume(result.text);
    return parsedResume;
  }

  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  }

  throw new Error("Unsupported file type");
}
