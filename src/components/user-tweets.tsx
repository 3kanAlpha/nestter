import { getTweetsByUserId } from "@/app/action/tweet";
import TweetCard from "./tweet-card";

type Props = {
  userId: number;
}

export default async function UserTweets({ userId }: Props) {
  const tweets = await getTweetsByUserId(userId);

  return (
    <div className="join join-vertical w-full">
      { tweets.map((tweet) => (
        <TweetCard key={tweet.tweet.id} tweet={tweet.tweet} user={tweet.user} />
      )) }
    </div>
  )
}