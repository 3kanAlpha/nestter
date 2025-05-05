"use client";
import { useState, useEffect, useCallback } from "react";
import { searchTweetsB } from "@/app/action/tweet";
import TweetCard from "./tweet-card";
import RetweetCard from "./tweet/retweet-card";

import { JoinedTweet } from "@/types/tweet";

type Props = {
  /** 検索対象の文字列（複数可） */
  q?: string;
  /** ツイートの送信元ユーザーID */
  from?: string;
  /** ツイートのリプライ先ユーザーID */
  to?: string;
  /** ツイートのリプライ先ID */
  replyTo?: number;
  /** リプライを除外するか */
  excludeReply?: boolean;
  /** 新しいツイートを自動的に取得するか */
  stream?: boolean;
  /** ログインしているユーザーのID */
  authUserId?: number;
  /** いいねした投稿のみを検索するか */
  searchFaved?: boolean;
}

export default function TweetList({ q, from, to, replyTo, excludeReply, stream = false, authUserId }: Props) {
  const [tweets, setTweets] = useState<JoinedTweet[]>([]);
  const [lastTweetId, setLastTweetId] = useState<number>(0);
  const [isLoading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  /** 古いツイートをさらに読み込む */
  const loadMoreTweets = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setLoading(true);
    const newTweets = await searchTweetsB(undefined, lastTweetId > 0 ? lastTweetId-1 : undefined, {
      q: q,
      from: from,
      to: to,
      replyTo: replyTo,
      excludeReply: excludeReply,
    });
    setTweets((prev) => [...prev, ...newTweets]);
    if (newTweets.length === 0) {
      setHasMore(false);
    } else {
      const lastTweet = newTweets[newTweets.length-1];
      setLastTweetId(lastTweet.tweet.id);
    }
    setLoading(false);
  }, [isLoading, hasMore, lastTweetId, q, from, to, replyTo, excludeReply]);

  /** 新しいツイートを読み込む */
  const loadNewTweets = useCallback(async () => {
    const topTweetId = tweets.length > 0 ? tweets[0].tweet.id : 0;
    const newTweets = await searchTweetsB(topTweetId+1, undefined, {
      q: q,
      from: from,
      to: to,
      replyTo: replyTo,
      excludeReply: excludeReply,
    });
    if (newTweets.length > 0) {
      setTweets((prev) => [...newTweets, ...prev]);
    }
  }, [tweets, q, from, to, replyTo, excludeReply]);

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
        const retweet = (tweet.retweetTweet && tweet.retweetUser) && {
          tweet: tweet.retweetTweet,
          user: tweet.retweetUser,
          attachments: tweet.retweetAttachment ? [tweet.retweetAttachment] : null,
        }
        if (retweet) {
          return (
            <RetweetCard
              key={tweet.tweet.id}
              user={tweet.user}
              authUserId={authUserId}
              isFaved={tweet.engagement?.parentFaved}
              isRetweeted={tweet.engagement?.parentRetweeted}
              retweet={retweet}
            />
          )
        } else {
          return (
            <TweetCard
              key={tweet.tweet.id}
              tweet={tweet.tweet}
              user={tweet.user}
              attachments={tweet.attachment ? [tweet.attachment] : null}
              authUserId={authUserId}
              isFaved={tweet.engagement?.isFaved}
              isRetweeted={tweet.engagement?.isRetweeted}
              reply={reply ?? undefined}
            />
          )
        }
      }) }
      {isLoading && <div className="text-center my-4"><span className="loading loading-spinner loading-md"></span></div>}
    </div>
  )
}