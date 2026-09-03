"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

function ResetPasswordInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") || ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [checking, setChecking] = useState(true)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      setChecking(false)
      return
    }
    apiFetch<{ token_valid: boolean }>(`reset-password.php?token=${encodeURIComponent(token)}`)
      .then((d) => setTokenValid(d.token_valid))
      .catch(() => setTokenValid(false))
      .finally(() => setChecking(false))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" })
      return
    }
    setIsSubmitting(true)
    try {
      await apiFetch("reset-password.php", { body: { token, password } })
      toast({ title: "Success", description: "Your password has been updated. Redirecting to sign in..." })
      setTimeout(() => router.push("/login"), 2000)
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err.code === "password_too_short"
            ? "Password must be at least 12 characters."
            : err.code === "invalid_or_expired_token"
              ? "This reset link is invalid or has expired. Please request a new one."
              : err.message || "Failed to reset password.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex flex-1 w-full items-center justify-center py-12">
        <div className="mx-auto w-full max-w-md space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Reset your password</CardTitle>
              <CardDescription>Choose a new password for your account (minimum 12 characters).</CardDescription>
            </CardHeader>
            <CardContent>
              {checking ? (
                <p className="text-sm text-muted-foreground">Checking your reset link...</p>
              ) : tokenValid ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={12}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm password</Label>
                    <Input
                      id="confirm"
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      minLength={12}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update password"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    This password reset link is invalid or has expired. Please request a new one.
                  </p>
                  <Link href="/forgot-password">
                    <Button variant="outline" className="w-full">
                      Request a new link
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  )
}
