import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import ResetPasswordForm from "@/components/auth/reset-password-form"
import LandingNavbar from "@/components/landing/landing-navbar"

export default async function ResetPasswordPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session, redirect to login
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />

      <div className="container flex flex-1 w-full items-center justify-center py-12">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Set New Password</h1>
            <p className="text-sm text-muted-foreground">Create a new password for your account</p>
          </div>
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
