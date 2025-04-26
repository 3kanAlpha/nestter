"use client";
import { useActionState, useState } from 'react';
import { useDebouncedCallback } from "use-debounce";
import { initializeAccount, isScreenNameAvailable } from '@/app/action/account';

export default function SignupForm() {
  const [state, action, pending] = useActionState(initializeAccount, undefined);
  const [isDuplicated, setDuplicated] = useState(false);

  const debounceCallback = useDebouncedCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const res = await isScreenNameAvailable(event.target.value);
    setDuplicated(!res);
  }, 1000);

  return (
    <div>
      { state?.status === "error" && (
        <div role="alert" className="alert alert-error alert-soft my-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>アカウントの初期設定に失敗しました。({ <span>{ state.message }</span> })</span>
        </div>
      ) }
      <form action={action} className="flex flex-col items-center">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">アカウントID</legend>
          <input
            type="text"
            name="screenName"
            className="input w-[90vw] lg:w-md validator"
            placeholder="Type here"
            required
            pattern="^[a-zA-Z0-9_]+$"
            minLength={3}
            maxLength={15}
            onChange={(e) => debounceCallback(e)}
          />
          <p className="validator-hint hidden">アカウントIDは3文字以上15文字以下、<br />かつ半角英数字およびアンダースコアが使用可能です。</p>
          { isDuplicated && <p className="text-error">このIDは既に使用されています。</p> }
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">表示名</legend>
          <input
            type="text"
            name="displayName"
            className="input w-[90vw] lg:w-md validator"
            placeholder="Type here"
            required
            maxLength={50}
          />
          <div className="validator-hint">表示名は空白でなく、かつ50文字以下である必要があります。</div>
        </fieldset>
        <button className="btn btn-wide btn-primary mt-4" type="submit" disabled={pending || isDuplicated}>
          { pending ? <LoadingContent /> : "Submit"}
        </button>
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