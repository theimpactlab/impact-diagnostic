"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function MFASettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    async function loadFactors() {
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error) {
        console.error("Error loading MFA factors", error)
      } else {
        const totp = data?.totp?.find((f: any) => f.status === "verified")
        if (totp) {
          setVerified(true)
        }
      }
      setLoading(false)
    }
    loadFactors()
  }, [])

  const startEnrollment = async () => {
    setEnrolling(true)
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" })
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
      setEnrolling(false)
      return
    }
    setFactorId(data.id)
    setQrCode(data.totp.qr_code)
    setSecret(data.totp.secret)
  }

  const verifyEnrollment = async () => {
    if (!factorId) return

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId })
    if (challengeError) {
      toast({ title: "Error", description: challengeError.message, variant: "destructive" })
      return
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    })

    if (verifyError) {
      toast({ title: "Error", description: verifyError.message, variant: "destructive" })
      return
    }

    toast({ title: "Success", description: "Multi-factor authentication enabled" })
    setVerified(true)
    setEnrolling(false)
  }

  if (loading) {
    return null
  }

  if (verified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>MFA is enabled for your account.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>Secure your account with an authenticator app.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {qrCode ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode} alt="TOTP QR Code" />
            </div>
            <p className="text-sm text-muted-foreground break-all">Secret: {secret}</p>
            <div className="space-y-2">
              <Label htmlFor="code">Enter the 6-digit code</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <Button onClick={verifyEnrollment} disabled={code.length === 0}>Verify</Button>
          </div>
        ) : (
          <Button onClick={startEnrollment} disabled={enrolling}>
            {enrolling ? "Loading..." : "Enable Two-Factor Authentication"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}