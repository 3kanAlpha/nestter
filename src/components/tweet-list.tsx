"use client";
import { useState, useEffect, useCallback } from "react";
import { searchTweets, searchNewTweets } from "@/app/action/tweet";
import TweetCard from "./tweet-card";

import { JoinedTweet } from "@/types/tweet";

type Props = {
  /** 検索対象の文字列（複数可） */
  q?: string;
  /** ツイートの送信元ユーザーID */
  from?: string;
  /** 新しいツイートを自動的に取得するか */
  stream?: boolean;
}

export default function TweetList({ q, from, stream = false }: Props) {
  const [tweets, setTweets] = useState<JoinedTweet[]>([]);
  const [lastTweetId, setLastTweetId] = useState<number>(0);
  const [isLoading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  /** 新しいツイートを読み込む */
  const loadMoreTweets = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setLoading(true);
    const newTweets = await searchTweets(lastTweetId, { q: q, from: from });
    setTweets((prev) => [...prev, ...newTweets]);
    if (newTweets.length === 0) {
      setHasMore(false);
    } else {
      const lastTweet = newTweets[newTweets.length-1];
      setLastTweetId(lastTweet.tweet.id);
    }
    setLoading(false);
  }, [isLoading, hasMore, lastTweetId, q, from]);

  const loadNewTweets = useCallback(async () => {
    const topTweetId = tweets.length > 0 ? tweets[0].tweet.id : 0;
    const newTweets = await searchNewTweets(topTweetId, { q: q, from: from });
    if (newTweets.length > 0) {
      setTweets((prev) => [...newTweets, ...prev]);
    }
  }, [tweets, q, from]);

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
      { tweets.map((tweet) => (
        <TweetCard key={tweet.tweet.id} tweet={tweet.tweet} user={tweet.user} />
      )) }
      {isLoading && <div className="text-center my-4"><span className="loading loading-spinner loading-md"></span></div>}
    </div>
  )
}