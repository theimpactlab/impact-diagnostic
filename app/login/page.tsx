import { Suspense } from "react"
import LoginForm from "@/components/auth/login-form"
import LandingNavbar from "@/components/landing/landing-navbar"

export const metadata = {
  title: "Sign In",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />

      <div className="container flex flex-1 w-full items-center justify-center py-12">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
