"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TweetForm from "@/components/tweet/tweet-form";

export default function TweetButton() {
  const pathname = usePathname();
  const [formKey, setFormKey] = useState(0);
  const handleShortcutKey = useCallback(handleClick, [formKey]);

  const getFormDefaultValue = (path: string) => {
    if (path.startsWith("/ir/")) {
      const s = path.slice(4);
      const sp = s.split("/");
      const slug = sp[0];
      return ` #ir_${slug}`;
    }

    return "";
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // フォーカスがinputやtextareaなどにあるときは無視
      const tag = (event.target as HTMLElement).tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
  
      if (event.key === "n" || event.key === "N") {
        event.preventDefault(); // デフォルト動作の抑制（必要に応じて）
        handleShortcutKey();
      }
    }
  
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleShortcutKey]);

  function handleClick() {
    setFormKey(formKey + 1); // モーダルを開くたびにフォームを初期状態に戻す
    document.querySelector('dialog#tweet-form-dialog')!.showModal();
  }

  function handleClose() {
    document.querySelector('dialog#tweet-form-dialog')!.close();
  }

  return (
    <div>
      <button
        className="btn btn-circle bg-tw-primary text-white hidden lg:flex"
        onClick={handleClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-[1.2em]">
          <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
        </svg>
      </button>
      <Link
        href={{
          pathname: "/mobile/new",
          query: {
            text: getFormDefaultValue(pathname),
          },
        }}
        className="btn btn-circle bg-tw-primary text-white flex lg:hidden"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-[1.2em]">
          <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
        </svg>
      </Link>
      <dialog id="tweet-form-dialog" className="modal">
        <div className="modal-box">
          <button
            className="btn btn-ghost btn-circle mb-2"
            onClick={handleClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          <TweetForm key={formKey} defaultValue={getFormDefaultValue(pathname)} />
        </div>
      </dialog>
    </div>
  );
}