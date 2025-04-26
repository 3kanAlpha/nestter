import { getLatestTweets } from "@/app/action/tweet";
import TweetCard from "./tweet-card";

export default async function TweetList() {
  const tweets = await getLatestTweets();

  return (
    <div className="join join-vertical w-full">
      { tweets.map((tweet) => (
        <TweetCard key={tweet.tweet.id} tweet={tweet.tweet} user={tweet.user} />
      )) }
    </div>
  )
}