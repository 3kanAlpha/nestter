"use server";

import { cache } from 'react';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { getStringLength } from "@/utils/string-util";

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