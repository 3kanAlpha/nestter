"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import Form from 'next/form';
import { insertTweet } from "@/app/action/tweet";
import { getStringLength } from "@/utils/string-util";
import { TWEET_TEXT_MAX_LENGTH } from "@/consts/tweet";

import { ActionResponse } from "@/types/action";

type Props = {
  replyTo?: {
    id: number;
    screenName: string;
  };
  defaultValue?: string;
}

export default function TweetForm({ replyTo, defaultValue }: Props) {
  const [state, action, pending] = useActionState(async (prev: ActionResponse, formData: FormData) => {
    formData.set("replyTo", replyTo ? replyTo.id.toString() : "");
    return insertTweet(prev, formData);
  }, undefined);
  const [content, setContent] = useState(defaultValue ?? "");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [hasImage, setHasImage] = useState(false);
  const canSubmit = (content.length > 0 || fileName.length > 0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        const active = document.activeElement;
        // textarea にフォーカスがあるときのみ送信
        if (active && active.tagName.toLowerCase() === "textarea") {
          e.preventDefault();
          // 最も近い form を取得して submit
          const form = active.closest("form");
          if (form) {
            (form as HTMLFormElement).requestSubmit();
          }
        }
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName("");
    }
  };

  const resetFileInput = () => {
    if (fileInputRef.current?.value) {
      fileInputRef.current.value = "";
    }
    setFileName("");
  };

  useEffect(() => {
    setHasImage(fileName.length > 0);
  }, [fileName]);

  return (
    <div className="w-[90vw] lg:w-full">
      { JSON.stringify(state) && null }
      { replyTo && (
        <div className="mb-2">
          <p className="text-gray-500 text-sm">返信先: <span className="text-blue-500">@{ replyTo.screenName }</span>さん</p>
        </div>
      ) }
      <Form action={action} className="w-full">
        <textarea
          name="textContent"
          value={content}
          className="textarea textarea-lg textarea-ghost w-full h-36"
          placeholder={replyTo ? "返信をツイート" : "今なにしてる？"}
          maxLength={400}
          autoFocus
          onChange={(e)=>setContent(e.target.value)}
        ></textarea>
        <div className="flex flex-row items-center gap-2 w-full mt-2">
          <input
            type="file"
            name="attachments"
            className="file-input file-input-ghost grow w-full"
            accept="image/jpeg,image/png"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost"
            onClick={resetFileInput}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
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
            <p className={getStringLength(content) > TWEET_TEXT_MAX_LENGTH ? "text-error" : "text-gray-500"}>{getStringLength(content)} / {TWEET_TEXT_MAX_LENGTH}</p>
          </div>
          <button className="btn btn-primary" type="submit" disabled={pending || !canSubmit}>
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