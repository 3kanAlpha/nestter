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

export async function invokeOgpUtil(tweetId: number, targetUrl: string) {
  const session = await auth();
  if (!session || !session.user.screenName) {
    return false;
  }

  const body = {
    tweetId: tweetId,
    targetUrl: targetUrl,
  }

  const params = new URLSearchParams({
    Action: 'SendMessage',
    MessageBody: JSON.stringify(body),
  });

  const url = `${process.env.SQS_OGP_UTIL_URL}?${params.toString()}`;

  const response = await lambdaClient.fetch(url, {
    method: "POST",
  });

  console.log("sqs status code:", response.status);

  return response.ok;
}