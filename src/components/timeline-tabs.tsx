"use client";
import { Suspense, useState } from "react";
import TweetList from "@/components/tweet-list";

type Props = {
  hasFollowing: boolean;
  authUserId?: number;
}

export default function TimelineTabs({ hasFollowing, authUserId }: Props) {
  const [active, setActive] = useState(hasFollowing ? 0 : 1);

  return (
    <div className="overflow-x-auto">
      <div className="tabs tabs-border flex">
        <input type="radio" name="timeline-tabs" className={`tab flex-auto ${hasFollowing ? "" : "tab-disabled"}`} aria-label="ホーム" onClick={()=>setActive(0)} defaultChecked={hasFollowing} />
        <div className="tab-content">
          { active === 0 && (
            <Suspense fallback={<Loading />}>
              <TweetList stream authUserId={authUserId} filterFollowing />
            </Suspense>
          ) }
        </div>

        <input type="radio" name="timeline-tabs" className="tab flex-auto" aria-label="グローバル" onClick={()=>setActive(1)} defaultChecked={!hasFollowing} />
        <div className="tab-content">
          { active === 1 && (
            <Suspense fallback={<Loading />}>
              <TweetList stream authUserId={authUserId} />
            </Suspense>
          ) }
        </div>
      </div>
    </div>
  )
}

function Loading() {
  return (
    <span className="loading loading-spinner loading-md mx-auto"></span>
  )
}