"use server";

import { eq, and, desc } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db/client";
import { users, follows, InsertFollow } from "@/db/schema";

/** ユーザーをフォローする */
export async function followUser(followeeId: number) {
  const session = await auth();
  if (!session || !session.user.screenName) {
    return;
  }
  const sesUserId = Number(session.user.id);

  const req: InsertFollow = {
    followerId: sesUserId,
    followeeId: followeeId,
  }

  await db.insert(follows).values(req).onConflictDoNothing();
}

/** ユーザーのフォローを解除する */
export async function unfollowUser(followeeId: number) {
  const session = await auth();
  if (!session || !session.user.screenName) {
    return;
  }
  const sesUserId = Number(session.user.id);

  await db.delete(follows).where(and(eq(follows.followerId, sesUserId), eq(follows.followeeId, followeeId)));
}

/** 指定したユーザーがフォローしているアカウントを取得する */
export async function getFollowings(userId: number) {
  const res = await db.select({
      id: users.id,
      screenName: users.screenName,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
    })
      .from(follows)
      .innerJoin(users, eq(follows.followeeId, users.id))
      .where(eq(follows.followerId, userId))
      .limit(50)
      .orderBy(desc(follows.createdAt));
    return res;
}

/** 指定したユーザーのフォロワーを取得する */
export async function getFollowers(userId: number) {
  const res = await db.select({
    id: users.id,
    screenName: users.screenName,
    displayName: users.displayName,
    avatarUrl: users.avatarUrl,
    bio: users.bio,
  })
    .from(follows)
    .innerJoin(users, eq(follows.followerId, users.id))
    .where(eq(follows.followeeId, userId))
    .limit(50)
    .orderBy(desc(follows.createdAt));
  return res;
}