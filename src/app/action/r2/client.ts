import { AwsClient } from "aws4fetch";

export const R2_URL = process.env.AWS_ENDPOINT_URL_S3!;
export const client = new AwsClient({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
});