"use server";
import { client, R2_URL } from "./r2/client";
import { auth } from "@/auth";

const BUCKET_NAME = "nestter-images";

async function uploadFile(fileKey: string, content: Uint8Array): Promise<boolean> {
  const fileUrl = `${R2_URL}/${BUCKET_NAME}/${fileKey}`;

  const res = await client.fetch(fileUrl, {
    method: "PUT",
    headers: {
      host: new URL(R2_URL).host,
      "Content-Length": content.length.toString(),
    },
    body: content,
  });

  return res.ok;
}

export async function uploadTempImage(arrayBuf: ArrayBuffer, fileName: string) {
  const session = await auth();
  if (!session || !session.user.screenName) {
    return null;
  }

  const fileExt = fileName.split(".").pop();
  if (!fileExt) {
    return null;
  }

  const fileNameBase = Math.random().toString(36).slice(-8);
  const fileKey = `temp/${fileNameBase}.${fileExt}`;
  const bytes = new Uint8Array(arrayBuf);

  const uploaded = await uploadFile(fileKey, bytes);
  return uploaded ? fileKey : null;
}