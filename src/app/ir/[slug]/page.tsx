import type { Metadata } from 'next';
import Link from 'next/link';
import { format } from "date-fns";

import { auth } from "@/auth";
import { getCompBySlug } from "@/app/action/comp";
import { getCompTweets, searchCompTweets } from '@/app/action/tweet';
import TweetCard from '@/components/tweet-card';

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const slug = (await params).slug
 
  const comp = await getCompBySlug(slug);
  if (!comp) {
    return {};
  }

  const description = `${comp.songTitle} [${comp.difficulty}]でスコアを競い合いましょう`;
 
  return {
    title: comp.name,
    description: description,
    openGraph: {
      title: comp.name,
      description: description,
      url: `https://nest.mgcup.net/ir/${comp.slug}`,
      siteName: "Nestter",
      type: "website",
    }
  }
}

export default async function CompDetail({ params }: Props) {
  const { slug } = await params;
  const comp = await getCompBySlug(slug);

  if (!comp) {
    return (
      <div className="flex flex-col items-center py-4">
        <p>この大会は存在しません。</p>
      </div>
    )
  }

  const tableCellStyle = "px-4 py-1 border-y border-gray-300 dark:border-gray-700";

  const session = await auth();
  const sesUserId = session?.user ? Number(session.user.id) : undefined;
  const latestCompTweets = await searchCompTweets(comp.slug, comp.createdAt, comp.closeAt);
  const allCompTweets = await getCompTweets(comp.slug, comp.createdAt, comp.closeAt);

  return (
    <div className="flex flex-col items-center pb-4 pt-4">
      <div className="w-screen lg:w-lg">
        <div className="w-[90vw] lg:w-full mx-auto">
          <h2 className="mb-4">
            <span className="text-2xl font-semibold">{ comp.name }</span>
          </h2>
          <div className="flex flex-wrap gap-x-2 text-xl font-semibold">
            <p>{ comp.songTitle }</p>
            <p>[{ comp.difficulty }]</p>
          </div>
          <p className="text-gray-500 text-sm">on { comp.gameTitle }</p>
          <p className="text-sm mt-3">開催期間: <span className="font-semibold">{ format(new Date(comp.closeAt), "yyyy/MM/dd") } 00:00</span> まで</p>
        </div>
        <div className="w-[90vw] lg:w-full mx-auto mt-6 mb-8">
          <h3 className="mb-2">
            <span className="font-semibold">Ranking</span>
          </h3>
          <div className="overflow-x-auto text-sm lg:text-md">
            <table>
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-800">
                  <th className={`${tableCellStyle} text-left`}>順位</th>
                  <th className={`${tableCellStyle} w-40 lg:w-60 text-left`}>プレイヤー名</th>
                  <th className={`${tableCellStyle} w-24 max-w-48 text-left`}>スコア</th>
                </tr>
              </thead>
              <tbody>
                { allCompTweets.map((tweet, idx) => (
                  <tr key={idx}>
                    <td className={`${tableCellStyle}`}>{ idx+1 }</td>
                    <td className={`${tableCellStyle} truncate`}>
                      <Link href={`/user/${tweet.user.screenName}`}>
                        <span>{ tweet.user.displayName }</span><span className="ml-2 text-sm text-gray-500">@{ tweet.user.screenName }</span>
                      </Link>
                    </td>
                    <td className={`${tableCellStyle}`}>
                      <Link href={`/post/${tweet.tweet.id}`}>
                        { tweet.score }
                      </Link>
                    </td>
                  </tr>
                )) }
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 className="mb-2 pl-4 lg:pl-0">
            <span className="font-semibold">大会参加者のツイート</span>
          </h3>
          <div className="join join-vertical w-full">
            { latestCompTweets.map((tweet) => {
              const reply = (tweet.replyTweet && tweet.replyUser) && {
                tweet: tweet.replyTweet,
                user: tweet.replyUser,
                attachments: tweet.replyAttachment ? [tweet.replyAttachment] : null,
              }
              return (
                <TweetCard
                  key={tweet.tweet.id}
                  tweet={tweet.tweet}
                  user={tweet.user}
                  attachments={tweet.attachment ? [tweet.attachment] : null}
                  authUserId={sesUserId}
                  isFaved={tweet.engagement?.isFaved}
                  isRetweeted={tweet.engagement?.isRetweeted}
                  reply={reply ?? undefined}
                  embed={tweet.embed ?? undefined}
                />
              )
            }) }
          </div>
          <div className="w-full flex justify-center">
            <Link
              href={{
                pathname: "/search",
                query: {
                  q: `#ir_${comp.slug}`,
                }
              }}
              className="btn btn-sm btn-soft my-4 mx-auto"
            >
              全てのツイートを見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}