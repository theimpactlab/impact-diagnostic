"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield, CheckCircle } from "lucide-react"

export default function MFAForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [verificationCode, setVerificationCode] = useState("")
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [factorId, setFactorId] = useState<string | null>(null)
    const [isEnrolled, setIsEnrolled] = useState(false)
    const [isUnenrolling, setIsUnenrolling] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        checkMFAStatus()
    }, [])

    const checkMFAStatus = async () => {
        const { data, error } = await supabase.auth.mfa.listFactors()
        if (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
            return
        }

        const totpFactor = data?.totp?.find(factor => factor.status === 'verified')
        setIsEnrolled(!!totpFactor)
    }

    const startEnrollment = async () => {
        setIsLoading(true)
        try {
            const { data: existingFactors, error: listError } = await supabase.auth.mfa.listFactors()
            if (listError) throw listError

            const unverifiedFactor = existingFactors?.all?.find(
                factor => factor.factor_type === 'totp' && factor.status === 'unverified'
            )

            if (unverifiedFactor) {
                const { error: unenrollError } = await supabase.auth.mfa.unenroll({
                    factorId: unverifiedFactor.id
                })
                if (unenrollError) throw unenrollError
            }

            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp'
            })

            if (error) throw error

            setQrCode(data.totp.qr_code)
            setFactorId(data.id)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const verifyEnrollment = async () => {
        if (!factorId || !verificationCode) return

        setIsLoading(true)
        try {
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId
            })

            if (challengeError) throw challengeError

            const { error: verifyError } = await supabase.auth.mfa.verify({
                factorId,
                challengeId: challengeData.id,
                code: verificationCode
            })

            if (verifyError) throw verifyError

            toast({
                title: "Success",
                description: "MFA has been successfully enabled for your account.",
            })
            setIsEnrolled(true)
            setQrCode(null)
            setFactorId(null)
            setVerificationCode("")
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const startUnenrollment = async () => {
        setIsUnenrolling(true)
        try {
            const { data, error: listError } = await supabase.auth.mfa.listFactors()
            if (listError) throw listError

            const totpFactor = data?.totp?.find(factor => factor.status === 'verified')
            if (!totpFactor) {
                throw new Error("No verified MFA factor found")
            }

            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId: totpFactor.id
            })

            if (challengeError) throw challengeError

            setFactorId(totpFactor.id)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
            setIsUnenrolling(false)
        }
    }

    const completeUnenrollment = async () => {
        if (!factorId || !verificationCode) return

        setIsLoading(true)
        try {
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId
            })

            if (challengeError) throw challengeError

            const { error: verifyError } = await supabase.auth.mfa.verify({
                factorId,
                challengeId: challengeData.id,
                code: verificationCode
            })

            if (verifyError) throw verifyError

            const { error: unenrollError } = await supabase.auth.mfa.unenroll({
                factorId
            })

            if (unenrollError) throw unenrollError

            toast({
                title: "Success",
                description: "MFA has been successfully disabled for your account.",
            })
            setIsEnrolled(false)
            setIsUnenrolling(false)
            setFactorId(null)
            setVerificationCode("")

            await supabase.auth.refreshSession()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to disable MFA",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Secure input handler for verification codes
    const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow numeric input, max 6 digits
        const value = e.target.value.replace(/\D/g, '').slice(0, 6)
        setVerificationCode(value)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Multi-Factor Authentication</CardTitle>
                <CardDescription>
                    Add an extra layer of security to your account using an authenticator app.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!isEnrolled && !qrCode && (
                    <Button onClick={startEnrollment} disabled={isLoading}>
                        {isLoading ? "Setting up..." : "Enable MFA"}
                    </Button>
                )}

                {qrCode && !isUnenrolling && (
                    <div className="space-y-4">
                        <Alert>
                            <Shield className="h-4 w-4" />
                            <AlertTitle>Setup Instructions</AlertTitle>
                            <AlertDescription>
                                <ol className="list-decimal list-inside space-y-2 mt-2">
                                    <li>Open your authenticator app (like Google Authenticator or Authy)</li>
                                    <li>Scan the QR code below</li>
                                    <li>Enter the 6-digit code from your authenticator app</li>
                                </ol>
                            </AlertDescription>
                        </Alert>

                        <div className="flex justify-center p-4 bg-white rounded-lg">
                            <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="verification-code-setup">Verification Code</Label>
                            <Input
                                id="verification-code-setup"
                                value={verificationCode}
                                onChange={handleVerificationCodeChange}
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                pattern="[0-9]{6}"
                                autoComplete="one-time-code"
                                inputMode="numeric"
                                aria-describedby="verification-code-help"
                            />
                            <p id="verification-code-help" className="text-xs text-muted-foreground">
                                Enter the 6-digit code shown in your authenticator app
                            </p>
                        </div>

                        <Button onClick={verifyEnrollment} disabled={isLoading || verificationCode.length !== 6}>
                            {isLoading ? "Verifying..." : "Verify and Enable"}
                        </Button>
                    </div>
                )}

                {isEnrolled && !isUnenrolling && (
                    <div className="space-y-4">
                        <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>MFA is Enabled</AlertTitle>
                            <AlertDescription>
                                Your account is protected with multi-factor authentication.
                            </AlertDescription>
                        </Alert>

                        <Button onClick={startUnenrollment} disabled={isLoading} variant="destructive">
                            {isLoading ? "Disabling..." : "Disable MFA"}
                        </Button>
                    </div>
                )}

                {isUnenrolling && (
                    <div className="space-y-4">
                        <Alert>
                            <Shield className="h-4 w-4" />
                            <AlertTitle>Verify Your Identity</AlertTitle>
                            <AlertDescription>
                                Please enter the verification code from your authenticator app to disable MFA.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <Label htmlFor="verification-code-disable">Verification Code</Label>
                            <Input
                                id="verification-code-disable"
                                value={verificationCode}
                                onChange={handleVerificationCodeChange}
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                pattern="[0-9]{6}"
                                autoComplete="one-time-code"
                                inputMode="numeric"
                                aria-describedby="verification-code-disable-help"
                            />
                            <p id="verification-code-disable-help" className="text-xs text-muted-foreground">
                                Enter the 6-digit code shown in your authenticator app
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={completeUnenrollment} disabled={isLoading || verificationCode.length !== 6}>
                                {isLoading ? "Verifying..." : "Verify and Disable"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsUnenrolling(false)
                                    setVerificationCode("")
                                    setFactorId(null)
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 