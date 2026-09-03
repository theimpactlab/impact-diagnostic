"use client"

import { useEffect, useState } from "react"
import { apiFetch, useSession } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function MFAForm() {
  const { session, refresh } = useSession()
  const { toast } = useToast()
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [checked, setChecked] = useState(false)

  // Enrolment state
  const [secret, setSecret] = useState<string | null>(null)
  const [otpauthUri, setOtpauthUri] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)
  const [disablePassword, setDisablePassword] = useState("")
  const [isUnenrolling, setIsUnenrolling] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session) {
      setIsEnrolled(!!session.user.mfa_enabled)
      setChecked(true)
    }
  }, [session])

  const startEnrollment = async () => {
    setIsLoading(true)
    try {
      const d = await apiFetch<{ secret: string; otpauth_uri: string }>("mfa-enrol.php", { body: {} })
      setSecret(d.secret)
      setOtpauthUri(d.otpauth_uri)
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to start MFA enrolment", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const verifyEnrollment = async () => {
    if (!verificationCode) return
    setIsLoading(true)
    try {
      const d = await apiFetch<{ recovery_codes: string[] }>("mfa-verify.php", {
        body: { code: verificationCode },
      })
      setRecoveryCodes(d.recovery_codes || [])
      setIsEnrolled(true)
      setSecret(null)
      setOtpauthUri(null)
      setVerificationCode("")
      toast({ title: "Success", description: "MFA has been successfully enabled for your account." })
      refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.code === "invalid_code"
            ? "Invalid code. Please check your authenticator app and try again."
            : error.message || "Verification failed",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const completeUnenrollment = async () => {
    if (!disablePassword) return
    setIsLoading(true)
    try {
      await apiFetch("mfa-disable.php", { body: { password: disablePassword } })
      toast({ title: "Success", description: "MFA has been successfully disabled for your account." })
      setIsEnrolled(false)
      setIsUnenrolling(false)
      setDisablePassword("")
      refresh()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to disable MFA", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
  }

  if (!checked) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (recoveryCodes) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recovery Codes</CardTitle>
          <CardDescription>
            Save these codes somewhere safe — each can be used once to sign in if you lose access to your
            authenticator app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
            {recoveryCodes.map((code) => (
              <div key={code} className="rounded border bg-muted px-2 py-1">
                {code}
              </div>
            ))}
          </div>
          <Button onClick={() => setRecoveryCodes(null)}>Done</Button>
        </CardContent>
      </Card>
    )
  }

  if (isEnrolled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Multi-factor Authentication</CardTitle>
          <CardDescription>
            MFA is currently <span className="font-semibold text-green-600">enabled</span> on your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isUnenrolling ? (
            <Button variant="destructive" onClick={() => setIsUnenrolling(true)}>
              Disable MFA
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Confirm your password to disable multi-factor authentication.
              </p>
              <div className="space-y-2">
                <Label htmlFor="mfa-password">Password</Label>
                <Input
                  id="mfa-password"
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={completeUnenrollment} disabled={isLoading || !disablePassword}>
                  {isLoading ? "Disabling..." : "Confirm disable"}
                </Button>
                <Button variant="outline" onClick={() => setIsUnenrolling(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (secret) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Set up your authenticator app</CardTitle>
          <CardDescription>
            Add the secret below to your authenticator app (or paste the otpauth URI), then enter the 6-digit code it
            generates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Secret (base32)</Label>
            <code className="block rounded border bg-muted px-3 py-2 font-mono text-sm break-all">{secret}</code>
          </div>
          <div className="space-y-2">
            <Label>otpauth URI</Label>
            <code className="block rounded border bg-muted px-3 py-2 font-mono text-xs break-all">{otpauthUri}</code>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mfa-code">Verification code</Label>
            <Input
              id="mfa-code"
              inputMode="numeric"
              value={verificationCode}
              onChange={handleVerificationCodeChange}
              placeholder="123456"
            />
          </div>
          <Button onClick={verifyEnrollment} disabled={isLoading || verificationCode.length !== 6}>
            {isLoading ? "Verifying..." : "Verify & enable MFA"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-factor Authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account using a time-based one-time password (TOTP) app such as Google
          Authenticator or 1Password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={startEnrollment} disabled={isLoading}>
          {isLoading ? "Starting..." : "Enable MFA"}
        </Button>
      </CardContent>
    </Card>
  )
}
