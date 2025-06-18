"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import MFAVerificationForm from "./mfa-verification-form"

export default function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/dashboard"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mfaData, setMfaData] = useState<{
    factorId: string
    challengeId: string
    redirectTo: string
  } | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Verify we have a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("No session created after login")
      }

      // Check if MFA is required
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()

      if (factorsError) {
        throw factorsError
      }

      const totpFactor = factors?.totp?.find(factor => factor.status === 'verified')

      if (totpFactor) {
        // MFA is required, challenge the user
        const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
          factorId: totpFactor.id
        })

        if (challengeError) {
          throw challengeError
        }

        setMfaData({
          factorId: totpFactor.id,
          challengeId: challengeData.id,
          redirectTo
        })
        return
      }

      // No MFA required, redirect to the intended destination
      window.location.href = redirectTo
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (mfaData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Multi-factor Authentication</h1>
          <p className="text-sm text-muted-foreground">
            Enter the verification code from your authenticator app
          </p>
        </div>
        <MFAVerificationForm
          factorId={mfaData.factorId}
          challengeId={mfaData.challengeId}
          redirectTo={mfaData.redirectTo}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Enter your email to sign in to your account</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="px-8 text-center text-sm text-muted-foreground">
        <Link href="/register" className="hover:text-primary underline underline-offset-4">
          Don&apos;t have an account? Sign Up
        </Link>
      </p>
    </div>
  )
}
