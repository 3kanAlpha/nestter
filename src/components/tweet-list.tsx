"use client";
import { useState, useEffect, useCallback } from "react";
import { getGlobalTimeline } from "@/app/action/tweet";
import TweetCard from "./tweet-card";

import { JoinedTweet } from "@/types/tweet";

export default function TweetList() {
  const [tweets, setTweets] = useState<JoinedTweet[]>([]);
  const [lastTweetId, setLastTweetId] = useState<number>(0);
  const [isLoading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreTweets = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setLoading(true);
    const newTweets = await getGlobalTimeline(lastTweetId);
    setTweets((prev) => [...prev, ...newTweets]);
    if (newTweets.length === 0) {
      setHasMore(false);
    } else {
      const lastTweet = newTweets[newTweets.length-1];
      setLastTweetId(lastTweet.tweet.id);
    }
    setLoading(false);
  }, [isLoading, hasMore, lastTweetId]);

  useEffect(() => {
    loadMoreTweets();
  }, [loadMoreTweets]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 300 // 300px手前でロード
      ) {
        loadMoreTweets();
      }
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreTweets]);

  return (
    <div className="join join-vertical w-full">
      { tweets.map((tweet) => (
        <TweetCard key={tweet.tweet.id} tweet={tweet.tweet} user={tweet.user} />
      )) }
      {isLoading && <div className="text-center my-4"><span className="loading loading-spinner loading-md"></span></div>}
    </div>
  )
}