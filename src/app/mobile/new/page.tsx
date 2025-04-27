import { forbidden } from 'next/navigation';
import { auth } from '@/auth';
import TweetForm from "@/components/tweet/tweet-form";

export default async function NewTweet() {
  const session = await auth();
    if (!session?.user || !session.user.screenName) {
      forbidden();
    }

  return (
    <div className="flex flex-col items-center py-4">
      <TweetForm />
    </div>
  )
}