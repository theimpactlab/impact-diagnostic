"use client"
import Link from "next/link"
import { signIn } from "@/lib/actions/auth-actions"
import { useFormState, useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Initial state for the form
const initialState = {
  success: false,
  error: null as string | null,
}

// Submit button with loading state
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing in..." : "Sign In"}
    </Button>
  )
}

export default function LoginForm() {
  // Use React's useFormState hook to handle form submission
  const [state, formAction] = useFormState(async (prevState: any, formData: FormData) => {
    const result = await signIn(formData)
    return { ...prevState, ...result }
  }, initialState)

  return (
    <div className="space-y-6">
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input id="email" name="email" type="email" placeholder="name@example.com" required />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input id="password" name="password" type="password" required />
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <SubmitButton />
      </form>
    </div>
  )
}
