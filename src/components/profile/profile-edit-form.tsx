"use client";
import { useActionState, useState } from 'react';
import Form from 'next/form';
import { updatePublicProfile } from "@/app/action/account";
import { getStringLength } from '@/utils/string-util';
import { ACCOUNT_BIO_MAX_LENGTH, ACCOUNT_DISPLAY_NAME_MAX_LENGTH } from '@/consts/account';

type Props = {
  displayName: string;
  bio?: string;
  location?: string;
  website?: string;
  avatarUrl?: string;
}

export default function ProfileEditForm({ displayName, bio, location, website }: Props) {
  const [state, action, pending] = useActionState(updatePublicProfile, undefined);
  const [newDisplayName, setNewDisplayName] = useState(displayName);
  const [newBio, setNewBio] = useState(bio ?? '');

  return (
    <div className="w-full">
      { JSON.stringify(state) && null }
      <Form action={action} className="w-full">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">アイコン画像</legend>
          <input
            name="avatarImage"
            type="file"
            className="file-input w-full"
            accept="image/jpeg,image/png,image/gif"
          />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">表示名</legend>
          <input
            name="displayName"
            type="text"
            className="input w-full"
            required
            maxLength={120}
            value={newDisplayName}
            onChange={(e)=>setNewDisplayName(e.target.value)}
          />
          <p className={`${getStringLength(newDisplayName) > ACCOUNT_DISPLAY_NAME_MAX_LENGTH ? "text-error" : "text-gray-500"} ml-auto`}>{ getStringLength(newDisplayName) } / { ACCOUNT_DISPLAY_NAME_MAX_LENGTH }</p>
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">自己紹介</legend>
          <textarea
            name="bio"
            className="textarea w-full"
            maxLength={400}
            value={newBio}
            onChange={(e)=>setNewBio(e.target.value)}
          />
          <p className={`${getStringLength(newBio) > ACCOUNT_BIO_MAX_LENGTH ? "text-error" : "text-gray-500"} ml-auto`}>{ getStringLength(newBio) } / { ACCOUNT_BIO_MAX_LENGTH }</p>
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">場所</legend>
          <input
            name="location"
            type="text"
            className="input w-full"
            defaultValue={location}
          />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">ウェブサイト</legend>
          <input
            name="website"
            type="text"
            className="input w-full"
            defaultValue={website}
          />
        </fieldset>
        { state?.status === "error" && (
          <p className="text-sm text-error mt-2">プロフィールの更新に失敗しました：<br />{ state.message }</p>
        ) }

        <div className="flex flex-row justify-center mt-4">
          <button className="btn btn-wide btn-primary" type="submit" disabled={pending}>
          { pending ? <LoadingContent /> : "Save"}
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