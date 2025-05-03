"use server";

import { eq, and, sql, desc } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db/client";
import { tweets, favorites, InsertFavorites, users } from "@/db/schema";

/** ツイートをいいねする */
async function faveTweet(tweetId: number) {
  const session = await auth();
  if (!session || !session.user.screenName) {
    return;
  }
  const sesUserId = Number(session.user.id);

  const reqBody: InsertFavorites = {
    userId: sesUserId,
    tweetId: tweetId,
  }

  // neon-httpだとトランザクションが使えない
  await db.insert(favorites).values(reqBody).onConflictDoNothing();
  await db.update(tweets).set({ favoriteCount: sql`${tweets.favoriteCount} + 1` }).where(eq(tweets.id, tweetId));
}

/** ツイートのいいねを解除する */
async function unfaveTweet(tweetId: number) {
  const session = await auth();
  if (!session || !session.user.screenName) {
    return;
  }
  const sesUserId = Number(session.user.id);

  await db.delete(favorites).where(and(eq(favorites.userId, sesUserId), eq(favorites.tweetId, tweetId)));
  await db.update(tweets).set({ favoriteCount: sql`${tweets.favoriteCount} - 1` }).where(eq(tweets.id, tweetId));
}

/** いいねの状態を更新する */
export async function setFavoriteState(tweetId: number, newState: boolean) {
  const session = await auth();
  if (!session || !session.user.screenName) {
    return;
  }
  const sesUserId = Number(session.user.id);

  const count = await db.$count(favorites, and(eq(favorites.userId, sesUserId), eq(favorites.tweetId, tweetId)));
  const isFaved = (count === 1);

  if (!isFaved && newState) {
    await faveTweet(tweetId);
  } else if (isFaved && !newState) {
    await unfaveTweet(tweetId);
  }
}

/** 指定したIDのツイートをいいねしたユーザーを取得する */
export async function getTweetLikedUsers(tweetId: number) {
  const res = await db
    .select({
      userId: users.id,
      screenName: users.screenName,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
    })
    .from(favorites)
    .where(eq(favorites.tweetId, tweetId))
    .innerJoin(users, eq(favorites.userId, users.id))
    .limit(20)
    .orderBy(desc(favorites.createdAt));
  return res;
}