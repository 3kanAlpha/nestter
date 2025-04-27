"use server";

import { cache } from 'react';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { uploadUserAvatar } from './image';
import { getStringLength } from "@/utils/string-util";
import { calcDigestFromBuffer } from '@/utils/hash-util';

/** アカウントの初期設定をする */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function initializeAccount(prev: any, formData: FormData) {
  const session = await auth();
  if (!session) {
    return {
      status: "error",
      message: "You need to log in",
    }
  }

  const sesUserId = Number(session.user.id);

  const screenName = (formData.get("screenName") as string).trim();
  if (screenName.length > 15) {
    return {
      status: "error",
      message: "screen name is too long",
    }
  } else if (screenName.length === 0) {
    return {
      status: "error",
      message: "screen name cannot be empty",
    }
  }

  const screenNamePattern = /^\w+$/g;
  if (!screenNamePattern.test(screenName)) {
    return {
      status: "error",
      message: "screen name is malformed",
    }
  }

  const displayName = (formData.get("displayName") as string).trim();
  if (getStringLength(displayName) > 50) {
    return {
      status: "error",
      message: "display name is too long",
    }
  } else if (getStringLength(displayName) === 0) {
    return {
      status: "error",
      message: "display name cannot be empty",
    }
  }

  const avatarUrl = session.user.image;

  const reqBody = {
    screenName: screenName,
    displayName: displayName,
    avatarUrl: avatarUrl ? avatarUrl : null,
  }

  await db.update(users).set(reqBody).where(eq(users.id, sesUserId));

  revalidatePath("/");
  redirect("/");
}

async function _getUserByScreenName(screenName: string) {
  const res = await db.select({
    id: users.id,
    createdAt: users.createdAt,
    screenName: users.screenName,
    displayName: users.displayName,
    avatarUrl: users.avatarUrl,
    bio: users.bio,
    website: users.website,
    location: users.location,
  }).from(users).where(eq(users.screenName, screenName)).limit(1);
  return res.length > 0 ? res[0] : null;
}

/** スクリーンネームからユーザーを取得する */
export const getUserByScreenName = cache(_getUserByScreenName);

/** 与えられたスクリーンネームが使用可能かどうか判定する */
export async function isScreenNameAvailable(screenName: string): Promise<boolean> {
  const count = await db.$count(users, eq(users.screenName, screenName));
  return count === 0;
}

/** プロフィールを編集する */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updatePublicProfile(prev: any, formData: FormData) {
  const session = await auth();
  if (!session || !session.user.screenName) {
    return {
      status: "error",
      message: "この操作にはログインが必要です",
    };
  }

  const sesUserId = Number(session.user.id);

  const displayName = (formData.get("displayName") as string).trim();
  if (getStringLength(displayName) > 50) {
    return {
      status: "error",
      message: "表示名は50文字以下である必要があります",
    };
  } else if (getStringLength(displayName) === 0) {
    return {
      status: "error",
      message: "表示名は空でない必要があります",
    };
  }

  const bio = (formData.get("bio") as string).trim();
  if (bio.length > 160) {
    return {
      status: "error",
      message: "自己紹介は160文字以下である必要があります",
    };
  }

  const location = (formData.get("location") as string).trim();
  const website = (formData.get("website") as string).trim();

  // 簡易的にプロトコルとドメイン部だけを確認
  const urlPattrn = /^https?:\/\/[\w\.-]+\.\w+/g;
  if (website.length > 0 && !urlPattrn.test(website)) {
    return {
      status: "error",
      message: "ウェブサイトに無効なアドレスが指定されています",
    };
  }

  const avatarContent = formData.get("avatarImage") as File;
  let avatarUrl = undefined;
  if (avatarContent.size > 0) {
    if (avatarContent.size > 5 * 1024 * 1024) {
      return {
        status: "error",
        message: "画像の最大サイズは5MiBです",
      };
    }
    const arrayBuf = await avatarContent.arrayBuffer();
    const hash = await calcDigestFromBuffer(arrayBuf);
    const bytes = new Uint8Array(arrayBuf);

    const p1 = hash.substring(0, 2);
    const p2 = hash.substring(2, 4);
    const fileKey = `icon/${p1}/${p2}/${hash}.webp`;
    const r = await uploadUserAvatar(bytes, fileKey, session.user.avatarUrl);
    if (!r) {
      return {
        status: "error",
        message: "画像のアップロードに失敗しました",
      };
    }
    avatarUrl = r;
  }

  const reqBody = {
    displayName: displayName,
    bio: bio || null,
    location: location || null,
    website: website || null,
    avatarUrl: avatarUrl,
  }

  await db.update(users).set(reqBody).where(eq(users.id, sesUserId));

  revalidatePath(`/user/${session.user.screenName}`);
  redirect(`/user/${session.user.screenName}`);
}