"use client";

export default function ClientSettings() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col">
        <h3 className="mb-2">
          <span className="text-lg font-semibold">試験的な機能</span>
        </h3>
        <div className="flex flex-row gap-2">
          <input
            type="checkbox"
            defaultChecked
            disabled
            className="toggle toggle-primary"
          />
          <p>タイムラインを自動的に更新する（β）</p>
        </div>
      </div>
    </div>
  )
}