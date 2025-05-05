"use server";

import { eq, and, sql } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db/client";
import { deleteTweet } from "./tweet";

import { tweets, InsertTweet, InsertRetweet, retweets } from "@/db/schema";

export async function retweet(tweetId: number) {
  const session = await auth();
  if (!session || !session.user.screenName) {
    return;
  }
  const sesUserId = Number(session.user.id);

  const retweet = await db.select({ id: tweets.id }).from(tweets).where(and(eq(tweets.userId, sesUserId), eq(tweets.retweetParentId, tweetId))).limit(1);
  if (retweet.length > 0) {
    return;
  }

  const tweetBody: InsertTweet = {
    textContent: "",
    userId: sesUserId,
    retweetParentId: tweetId,
  }

  const tweetRow = await db.insert(tweets).values(tweetBody).onConflictDoNothing().returning({ newTweetId: tweets.id });
  if (tweetRow.length > 0) {
    const retweetBody: InsertRetweet = {
      userId: sesUserId,
      tweetId: tweetId,
    }

    await db.insert(retweets).values(retweetBody).onConflictDoNothing();
    await db.update(tweets).set({ retweetCount: sql`${tweets.retweetCount} + 1` }).where(eq(tweets.id, tweetId));
  }
}

export async function undoRetweet(tweetId: number) {
  const session = await auth();
  if (!session || !session.user.screenName) {
    return;
  }
  const sesUserId = Number(session.user.id);

  const retweet = await db.select({ id: tweets.id }).from(tweets).where(and(eq(tweets.userId, sesUserId), eq(tweets.retweetParentId, tweetId))).limit(1);
  if (retweet.length > 0) {
    const deletedRetweet = await deleteTweet(retweet[0].id);
    if (deletedRetweet) {
      await db.delete(retweets).where(and(eq(retweets.userId, sesUserId), eq(retweets.tweetId, tweetId)));
    }
  }
}