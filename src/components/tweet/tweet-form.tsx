"use client";

import { useActionState } from "react";
import { insertTweet } from "@/app/action/tweet";

export default function TweetForm() {
  const [state, action, pending] = useActionState(insertTweet, undefined);

  return (
    <div>
      { JSON.stringify(state) && null }
      <form action={action} className="w-full">
        <textarea
          name="textContent"
          className="textarea textarea-lg validator w-full h-36"
          placeholder="今なにしてる？"
          required
          maxLength={280}
          autoFocus
        ></textarea>
        <p className="validator-hint">ツイートの内容は空でない、かつ280文字以下である必要があります</p>
        { state?.status === "error" && (
          <p>ツイートの投稿に失敗しました（{ state.message }）</p>
        ) }

        <div className="w-full flex flex-row mt-2">
          <button className="btn btn-primary ml-auto" type="submit" disabled={pending}>
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