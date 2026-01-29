import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-700',
            card: 'bg-zinc-900 border-zinc-800',
          }
        }}
      />
    </div>
  )
}
