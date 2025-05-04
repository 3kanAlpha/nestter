import { forbidden, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getReplyTarget } from '@/app/action/tweet';
import TweetForm from "@/components/tweet/tweet-form";

export default async function NewTweet(props: {
  searchParams?: Promise<{
    replyTo?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user || !session.user.screenName) {
    forbidden();
  }

  const searchParams = await props.searchParams;
  const id = Number(searchParams?.replyTo);
  // クエリパラメータを持っているかどうかで分岐
  if (Number.isFinite(id)) {
    const target = await getReplyTarget(id);
    if (!target) {
      redirect("/");
    }

    const replyTo =  {
      id: target.id,
      screenName: target.name ?? "xxx",
    }

    return (
      <div className="flex flex-col items-center py-4">
        <TweetForm replyTo={replyTo} />
      </div>
    )
  } else {
    return (
      <div className="flex flex-col items-center py-4">
        <TweetForm />
      </div>
    )
  }
}