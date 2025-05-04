"use client";
import { useState, useEffect, useCallback } from "react";
import { searchFavedTweets } from "@/app/action/tweet";
import TweetCard from "@/components/tweet-card";

import { JoinedTweet } from "@/types/tweet";

type Props = {
  /** 検索対象の文字列（複数可） */
  q?: string;
  /** ツイートの送信元ユーザーID */
  from?: string;
  /** 新しいツイートを自動的に取得するか */
  stream?: boolean;
  /** ログインしているユーザーのID */
  authUserId?: number;
  /** いいねを検索する対象のユーザーID */
  userId: number;
}

export default function LikedTweetList({ q, from, stream = false, authUserId, userId }: Props) {
  const [tweets, setTweets] = useState<JoinedTweet[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  /** 古いツイートをさらに読み込む */
  const loadMoreTweets = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setLoading(true);
    const lastTweet = tweets[tweets.length-1];
    const newTweets = await searchFavedTweets(userId, undefined, lastTweet ? lastTweet.engagement?.favedTimestamp : undefined, { q: q, from: from });
    setTweets((prev) => [...prev, ...newTweets]);
    if (newTweets.length === 0) {
      setHasMore(false);
    } 
    setLoading(false);
  }, [tweets, isLoading, hasMore, userId, q, from]);

  /** 新しいツイートを読み込む */
  const loadNewTweets = useCallback(async () => {
    const topTweet = tweets[0];
    const newTweets = await searchFavedTweets(userId, topTweet ? topTweet.engagement?.favedTimestamp : undefined, undefined, { q: q, from: from });
    if (newTweets.length > 0) {
      setTweets((prev) => [...newTweets, ...prev]);
    }
  }, [tweets, userId, q, from]);

  useEffect(() => {
    loadMoreTweets();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // 一定間隔で新しいツイートを取得する
    const timerId = setInterval(() => {
      if (stream && document.visibilityState === "visible" && window.scrollY < 300) {
        loadNewTweets();
      }
    }, 20 * 1000);

    return () => clearInterval(timerId);
  }, [stream, loadNewTweets]);

  useEffect(() => {
    const handleScroll = () => {
      // 既にロード中、あるいは全取得済みであれば呼ばない
      if (isLoading || !hasMore) return;
      // ページ最下部の判定
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300 // 300px手前で判定
      ) {
        loadMoreTweets();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, hasMore, loadMoreTweets]);

  return (
    <div className="join join-vertical w-full">
      { tweets.map((tweet) => {
        const reply = (tweet.replyTweet && tweet.replyUser) && {
          tweet: tweet.replyTweet,
          user: tweet.replyUser,
          attachments: tweet.replyAttachment ? [tweet.replyAttachment] : null,
        }
        return (
          <TweetCard
            key={tweet.tweet.id}
            tweet={tweet.tweet}
            user={tweet.user}
            attachments={tweet.attachment ? [tweet.attachment] : null}
            authUserId={authUserId}
            isFaved={tweet.engagement?.isFaved}
            reply={reply ?? undefined}
          />
        )
      }) }
      {isLoading && <div className="text-center my-4"><span className="loading loading-spinner loading-md"></span></div>}
    </div>
  )
}