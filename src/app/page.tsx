import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from "@/auth";
import TweetList from '@/components/tweet-list';

export default async function Home() {
  const session = await auth();
  if (session?.user && !session.user.screenName) {
    redirect("/signup");
  }

  return (
    <div className="flex flex-col items-center pb-4 lg:pt-4">
      <div className="w-screen lg:w-lg">
        <Suspense fallback={<Loading />}>
          <TweetList stream />
        </Suspense>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <span className="loading loading-spinner loading-md mx-auto"></span>
  )
}