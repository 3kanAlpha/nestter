"use client";

import { useActionState, useState } from "react";
import { insertTweet } from "@/app/action/tweet";

export default function TweetForm() {
  const [state, action, pending] = useActionState(insertTweet, undefined);
  const [content, setContent] = useState('');

  return (
    <div className="w-[90vw] lg:w-full">
      { JSON.stringify(state) && null }
      <form action={action} className="w-full">
        <textarea
          id="tweet-text-content"
          name="textContent"
          value={content}
          className="textarea textarea-lg textarea-ghost w-full h-36"
          placeholder="今なにしてる？"
          required
          maxLength={280}
          autoFocus
          onChange={(e)=>setContent(e.target.value)}
        ></textarea>
        { state?.status === "error" && (
          <p className="text-sm text-error mt-2">ツイートの投稿に失敗しました：<br />{ state.message }</p>
        ) }

        <div className="w-full flex flex-row justify-end items-center gap-4 mt-4">
          <div>
            <p className="text-gray-500">{content.length} / 280</p>
          </div>
          <button className="btn btn-primary" type="submit" disabled={pending}>
            { pending ? <LoadingContent /> : "Tweet"}
          </button>
        </div>
      </form>
    </div>
  )
}

function LoadingContent() {
  return (
    <>
      <span className="loading loading-spinner"></span>
      Pending...
    </>
  )
}