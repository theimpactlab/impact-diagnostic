import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import LoginForm from "@/components/auth/login-form"
import LandingNavbar from "@/components/landing/landing-navbar"

export default async function LoginPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

    // Only redirect when the middleware would let /dashboard through
    // (no MFA enrolled, or MFA already verified this session). A user at
    // aal1 who still needs aal2 must see the login form to complete the
    // TOTP challenge — redirecting them would loop with the middleware.
    if (!aal || aal.currentLevel === aal.nextLevel) {
      redirect("/dashboard")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />

      <div className="container flex flex-1 w-full items-center justify-center py-12">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
