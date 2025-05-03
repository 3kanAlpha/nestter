import { Suspense } from "react";
import type { Metadata } from 'next';
import { auth } from "@/auth";
import { getTweetById } from "@/app/action/tweet";
import TweetDetailCard from "@/components/tweet/tweet-detail-card";

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const id = (await params).id
 
  const tweet = await getTweetById(Number(id));
  if (!tweet) {
    return {};
  }

  const user = tweet.user;
 
  return {
    title: `${user.displayName}さんのツイート`,
    description: tweet.tweet.textContent,
    openGraph: {
      title: `${user.displayName} (@${user.screenName}) on Nestter`,
      description: tweet.tweet.textContent,
      url: `https://nest.mgcup.net/post/${tweet.tweet.id}`,
      siteName: "Nestter",
      type: "website",
    }
  }
}

export default async function PostDetail({ params }: Props) {
  const { id } = await params;
  const tweet = await getTweetById(Number(id));

  if (!tweet) {
    return (
      <div className="flex flex-col items-center py-4">
        <p>This tweet does not exist.</p>
      </div>
    )
  }

  const session = await auth();
  const sesUserId = session?.user ? Number(session.user.id) : undefined;

  return (
    <div className="flex flex-col items-center pb-4 lg:pt-4">
      <div className="w-screen lg:w-lg">
        <Suspense>
          <TweetDetailCard
            tweet={tweet.tweet}
            user={tweet.user}
            attachments={tweet.attachment ? [tweet.attachment] : null}
            authUserId={sesUserId}
            isFaved={tweet.engagement?.isFaved}
          />
        </Suspense>
      </div>
    </div>
  )
}