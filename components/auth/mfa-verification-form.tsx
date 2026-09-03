"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiFetch } from "@/lib/api"
import Link from "next/link"

interface MFAVerificationFormProps {
  redirectTo: string
}

export default function MFAVerificationForm({ redirectTo }: MFAVerificationFormProps) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [recoveryMode, setRecoveryMode] = useState(false)
  const [recoveryCode, setRecoveryCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await apiFetch("mfa-challenge.php", {
        body: recoveryMode
          ? { recovery_code: recoveryCode.trim() }
          : { code: code.trim() },
      })
      router.push(redirectTo)
      router.refresh()
    } catch (err: any) {
      setError(
        err.code === "invalid_code"
          ? "Invalid verification code. Please try again."
          : err.code === "challenge_expired"
            ? "Your session expired. Please sign in again."
            : "Verification failed. Please try again."
      )
      setCode("")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleVerify} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!recoveryMode ? (
        <div className="flex flex-col items-center space-y-4">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="recovery-code">Recovery code</Label>
          <input
            id="recovery-code"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={recoveryCode}
            onChange={(e) => setRecoveryCode(e.target.value)}
            placeholder="XXXXX-XXXXX"
            required
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading || (!recoveryMode && code.length !== 6)}>
        {isLoading ? "Verifying..." : "Verify"}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setRecoveryMode(!recoveryMode)}
          className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
        >
          {recoveryMode ? "Use authenticator code instead" : "Use a recovery code instead"}
        </button>
      </div>

      <p className="px-8 text-center text-sm text-muted-foreground">
        <Link href="/login" className="hover:text-primary underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </form>
  )
}
