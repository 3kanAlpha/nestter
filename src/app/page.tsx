import { redirect } from 'next/navigation';
import { auth } from "@/auth";
import TweetList from '@/components/tweet-list';

export default async function Home() {
  const session = await auth();
  if (session?.user && !session.user.screenName) {
    redirect("/signup");
  }

  return (
    <div className="flex flex-col items-center py-4">
      <div className="w-screen lg:w-lg">
        <TweetList />
      </div>
    </div>
  );
}
