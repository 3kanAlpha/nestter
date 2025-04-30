"use server";
import { client, R2_URL } from "./r2/client";
import { PhotonImage, SamplingFilter, resize } from "@cf-wasm/photon/next";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { tweetAttachments, InsertAttachments } from "@/db/schema";
import { calcDigestFromUint8Array } from "@/utils/hash-util";

const BUCKET_NAME = "nestter-images";

async function deleteFile(fileKey: string) {
  const fileUrl = `${R2_URL}/${BUCKET_NAME}/${fileKey}`;

  await client.fetch(fileUrl, {
    method: "DELETE",
    headers: {
      host: new URL(R2_URL).host,
    },
  });
}

/** 画像を最大長辺400pxに変形してwebp形式に変換する */
async function resizeUserAvatar(bytes: Uint8Array): Promise<Uint8Array | null> {
  const image = PhotonImage.new_from_byteslice(bytes);
  const width = image.get_width();
  const height = image.get_height();
  const shortSide = Math.min(width, height);
  if (shortSide < 128) {
    return null;
  }
  const resizeTo = Math.min(shortSide, 400);
  const outImage = resize(
    image,
    resizeTo,
    resizeTo,
    SamplingFilter.Lanczos3,
  )
  const outBytes = outImage.get_bytes_webp();

  // free memory
  image.free();
  outImage.free();
  return outBytes;
}

/** 画像を長辺が最大2000pxとなるように変形してwebp形式に変換する */
async function resizeImage(buf: ArrayBuffer): Promise<[Uint8Array | null, number, number]> {
  const bytes = new Uint8Array(buf);
  const image = PhotonImage.new_from_byteslice(bytes);
  const width = image.get_width();
  const height = image.get_height();
  const longSide = Math.max(width, height);
  if (longSide <= 2000) {
    const outBytes = image.get_bytes_jpeg(85);
    image.free();
    return [outBytes, width, height];
  }

  const dr = longSide / 2000;
  const nw = Math.trunc(width / dr);
  const nh = Math.trunc(height / dr);
  try {
    const outImage = resize(
      image,
      nw,
      nh,
      SamplingFilter.Lanczos3,
    )
    const outBytes = outImage.get_bytes_jpeg(85);

    image.free();
    outImage.free();
    return [outBytes, nw, nh];
  } catch (error) {
    console.error(error);
  }
  // free memory
  image.free();
  return [null, 0, 0];
}

/** ユーザーのアイコン画像をR2にアップロードする */
export async function uploadUserAvatar(avatar: Uint8Array, fileKey: string, oldUrl?: string): Promise<string | null> {
  const session = await auth();
  if (!session || !session.user.screenName) {
    return null;
  }

  const resizedBytes = await resizeUserAvatar(avatar);
  if (!resizedBytes) {
    return null;
  }

  const fileUrl = `${R2_URL}/${BUCKET_NAME}/${fileKey}`;

  const res = await client.fetch(fileUrl, {
    method: "PUT",
    headers: {
      host: new URL(R2_URL).host,
      "Content-Length": resizedBytes.length.toString(),
    },
    body: resizedBytes,
  });

  if (res.ok) {
    if (oldUrl && oldUrl.startsWith("https://img.nest.mgcup.net/")) {
      const oldFileKey = oldUrl.replace("https://img.nest.mgcup.net/", "");
      deleteFile(oldFileKey);
    }

    return "https://img.nest.mgcup.net/" + fileKey;
  }

  return null;
}

export async function uploadTweetAttachment(attachment: ArrayBuffer, parentTweetId: number, isSpoiler = false): Promise<boolean> {
  const session = await auth();
  if (!session || !session.user.screenName) {
    return false;
  }

  const [resizedBytes, width, height] = await resizeImage(attachment);
  if (!resizedBytes) {
    return false;
  }

  const hash = await calcDigestFromUint8Array(resizedBytes);
  const p1 = hash.substring(0, 2);
  const p2 = hash.substring(2, 4);
  const fileKey = `data/${p1}/${p2}/${hash}.jpeg`;

  const fileUrl = `${R2_URL}/${BUCKET_NAME}/${fileKey}`;

  const res = await client.fetch(fileUrl, {
    method: "PUT",
    headers: {
      host: new URL(R2_URL).host,
      "Content-Length": resizedBytes.length.toString(),
    },
    body: resizedBytes,
  });

  if (res.ok) {
    const fileUrl = "https://img.nest.mgcup.net/" + fileKey;

    const reqBody: InsertAttachments = {
      tweetId: parentTweetId,
      fileUrl: fileUrl,
      mimeType: "image/jpeg",
      imageWidth: width,
      imageHeight: height,
      isSpoiler: isSpoiler,
    }

    const row = await db.insert(tweetAttachments).values(reqBody).returning({ newAttachmentId: tweetAttachments.id });

    return row.length > 0;
  }

  return false;
}