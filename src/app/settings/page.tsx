import ClientSettings from "@/components/settings/client-settings"

export default async function Settings() {
  return (
    <div className="flex flex-col items-center">
      <h2 className="my-4">
        <span className="text-3xl font-semibold">設定</span>
      </h2>
      <div className="w-[90vw] lg:w-lg">
        <ClientSettings />
      </div>
    </div>
  )
}