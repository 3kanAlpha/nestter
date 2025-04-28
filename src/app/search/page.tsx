import { Suspense } from 'react';
import TweetList from '@/components/tweet-list';

export default async function Search(props: {
  searchParams?: Promise<{
    q?: string;
    from?: string
  }>;
}) {
  const searchParams = await props.searchParams;
  const q = searchParams?.q;
  const from = searchParams?.from;

  return (
    <div className="flex flex-col items-center pb-4 lg:pt-4">
      <div className="w-screen lg:w-lg">
        <Suspense>
          <TweetList q={q} from={from} />
        </Suspense>
      </div>
    </div>
  );
}