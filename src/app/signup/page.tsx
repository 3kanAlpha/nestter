import SignupForm from "@/components/signup/signup-form";

export default function Signup() {
  return (
    <div className="flex flex-col items-center py-4">
      <h2 className="mb-2">
        <span className="text-3xl font-semibold">新規登録</span>
      </h2>
      <SignupForm />
    </div>
  )
}