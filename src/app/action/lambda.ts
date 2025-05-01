import { AwsClient } from "aws4fetch";
import { auth } from "@/auth";

const lambdaClient = new AwsClient({
  accessKeyId: process.env.LAMBDA_ACCESS_KEY!,
  secretAccessKey: process.env.LAMBDA_SECRET_ACCESS_KEY!,
});

export async function invokeUploadImage(fileKey: string, parentTweetId: number, isSpoiler: boolean = false) {
  const session = await auth();
  if (!session || !session.user.screenName) {
    return false;
  }

  const event = {
    fileKey: fileKey,
    parentTweetId: parentTweetId,
    isSpoiler: isSpoiler,
  }

  const response = await lambdaClient.fetch(`${process.env.LAMBDA_UPLOAD_IMAGE_URL}`, {
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    console.error(await response.text());
  }

  return response.ok;
}

export async function invokeUploadAvatar(fileKey: string, oldFileUrl: string) {
  const session = await auth();
  if (!session || !session.user.screenName) {
    return null;
  }

  const event = {
    imageType: "avatar",
    fileKey: fileKey,
    oldFileUrl: oldFileUrl,
  }

  const response = await lambdaClient.fetch(`${process.env.LAMBDA_UPLOAD_IMAGE_URL}`, {
    body: JSON.stringify(event),
  });

  const text = await response.text();
  if (!response.ok) {
    console.error(text);
    return null;
  }

  return text;
}