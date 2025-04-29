"use client";

import { useActionState, useState, useEffect } from "react";
import Form from 'next/form';
import { insertTweet } from "@/app/action/tweet";

export default function TweetForm() {
  const [state, action, pending] = useActionState(insertTweet, undefined);
  const [content, setContent] = useState('');
  const [file, setFile] = useState('');
  const [hasImage, setHasImage] = useState(false);

  useEffect(() => {
    setHasImage(file.length > 0);
  }, [file]);

  return (
    <div className="w-[90vw] lg:w-full">
      { JSON.stringify(state) && null }
      <Form action={action} className="w-full">
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
        <input
          type="file"
          name="attachments"
          className="file-input file-input-ghost w-full mt-2"
          accept="image/*"
          value={file}
          onChange={(e)=>setFile(e.target.value)}
        />
        <div className="flex flex-row items-center gap-2 mt-2">
          <input
            type="checkbox"
            name="isSpoiler"
            className="checkbox checkbox-sm"
            disabled={!hasImage}
          />
          <p className="text-sm">Mark as Spoiler</p>
        </div>
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
      </Form>
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