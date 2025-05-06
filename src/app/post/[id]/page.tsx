import { Suspense } from "react";
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from "@/auth";
import { getTweetById } from "@/app/action/tweet";
import TweetDetailCard from "@/components/tweet/tweet-detail-card";
import TweetList from "@/components/tweet-list";

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
  } else if (tweet.tweet.retweetParentId) {
    // リツイートなら親ツイートにリダイレクトする
    redirect(`/post/${tweet.tweet.retweetParentId}`);
  }

  const session = await auth();
  const sesUserId = session?.user ? Number(session.user.id) : undefined;

  const reply = (tweet.replyTweet && tweet.replyUser) && {
    tweet: tweet.replyTweet,
    user: tweet.replyUser,
    attachments: tweet.replyAttachment ? [tweet.replyAttachment] : null,
  }

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
            isRetweeted={tweet.engagement.isRetweeted}
            reply={reply ?? undefined}
            embed={tweet.embed ?? undefined}
          />
        </Suspense>
        { tweet.tweet.replyCount > 0 && (
          <>
            <div className="my-2 pl-2">
              <p className="text-xl font-semibold">返信</p>
            </div>
            <Suspense>
              <TweetList authUserId={sesUserId} replyTo={Number(id)} />
            </Suspense>
          </>
        ) }
      </div>
    </div>
  )
}