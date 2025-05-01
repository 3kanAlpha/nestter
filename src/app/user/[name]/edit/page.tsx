import { forbidden } from 'next/navigation';
import { auth } from "@/auth";
import ProfileEditForm from "@/components/profile/profile-edit-form";

type Props = {
  params: Promise<{ name: string }>
}

export default async function EditProfile({ params }: Props) {
  const { name } = await params;
  const session = await auth();
  if (!session?.user || !session.user.screenName || session.user.screenName !== name) {
    forbidden();
  }
  const user = session.user;

  return (
    <div className="flex flex-col items-center py-4">
      <h2 className="mb-4">
        <span className="text-2xl font-semibold">プロフィールの編集</span>
      </h2>
      <div className="w-[90vw] lg:w-lg">
        <div tabIndex={0} className="collapse collapse-arrow bg-base-100 border-base-300 border mb-4">
          <div className="collapse-title font-semibold">画像アップロード時の注意</div>
          <div className="collapse-content text-sm">
            <p>アイコンとしてアップロードする画像は以下の条件を満たす必要があります。</p>

            <ul className="list-disc pl-4 my-2">
              <li>短辺が<span className="font-semibold">128px以上</span></li>
              <li>サイズが5MiB以下</li>
            </ul>
            
            <p>正方形ではない画像はアップロード時に正方形に変形されてしまうため、ご注意ください。</p>
          </div>
        </div>
        <ProfileEditForm displayName={user.displayName!} bio={user.bio} location={user.location} website={user.website} avatarUrl={user.avatarUrl} />
      </div>
    </div>
  )
}