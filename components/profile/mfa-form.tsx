"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Shield } from "lucide-react"

export default function MFAForm() {
    const [isEnrolled, setIsEnrolled] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isUnenrolling, setIsUnenrolling] = useState(false)
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [factorId, setFactorId] = useState<string | null>(null)
    const [verificationCode, setVerificationCode] = useState("")
    const { toast } = useToast()
    const supabase = createClientComponentClient()

    useEffect(() => {
        checkMFAStatus()
    }, [])

    const checkMFAStatus = async () => {
        try {
            const { data: factors, error } = await supabase.auth.mfa.listFactors()

            if (error) {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                })
                return
            }

            const totpFactor = factors?.totp?.find((factor: any) => factor.status === 'verified')
            setIsEnrolled(!!totpFactor)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to check MFA status",
                variant: "destructive",
            })
        }
    }

    const startEnrollment = async () => {
        setIsLoading(true)
        try {
            // Unenroll existing TOTP factors first
            const { data: existingFactors, error: listError } = await supabase.auth.mfa.listFactors()

            if (listError) {
                throw new Error(listError.message)
            }

            // Remove existing TOTP factors
            if (existingFactors?.totp && existingFactors.totp.length > 0) {
                for (const factor of existingFactors.totp) {
                    await supabase.auth.mfa.unenroll({
                        factorId: factor.id,
                    })
                }
            }

            // Enroll new factor
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: "totp",
                friendlyName: "Authenticator App",
            })

            if (error) {
                throw new Error(error.message)
            }

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
            // First create a challenge
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId,
            })

            if (challengeError) {
                throw new Error(challengeError.message)
            }

            // Then verify the code
            const { error: verifyError } = await supabase.auth.mfa.verify({
                factorId,
                challengeId: challengeData.id,
                code: verificationCode,
            })

            if (verifyError) {
                throw new Error(verifyError.message)
            }

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
            const { data: factors, error } = await supabase.auth.mfa.listFactors()

            if (error) {
                throw new Error(error.message)
            }

            const totpFactor = factors?.totp?.find((factor: any) => factor.status === 'verified')
            if (!totpFactor) {
                throw new Error("No verified MFA factor found")
            }

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
            const { error: unenrollError } = await supabase.auth.mfa.unenroll({
                factorId,
            })

            if (unenrollError) {
                throw new Error(unenrollError.message)
            }

            toast({
                title: "Success",
                description: "MFA has been successfully disabled for your account.",
            })
            setIsEnrolled(false)
            setIsUnenrolling(false)
            setFactorId(null)
            setVerificationCode("")
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
                                    <li>Enter the 6-digit code from your app</li>
                                </ol>
                            </AlertDescription>
                        </Alert>

                        <div className="flex justify-center">
                            <img src={qrCode} alt="QR Code for MFA setup" className="border rounded" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="verification-code">Verification Code</Label>
                            <Input
                                id="verification-code"
                                value={verificationCode}
                                onChange={handleVerificationCodeChange}
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                pattern="[0-9]{6}"
                                autoComplete="one-time-code"
                                required
                            />
                        </div>

                        <Button
                            onClick={verifyEnrollment}
                            disabled={isLoading || !verificationCode || verificationCode.length !== 6}
                            className="w-full"
                        >
                            {isLoading ? "Verifying..." : "Complete Setup"}
                        </Button>
                    </div>
                )}

                {isEnrolled && !isUnenrolling && (
                    <div className="space-y-4">
                        <Alert>
                            <Shield className="h-4 w-4" />
                            <AlertTitle>MFA Enabled</AlertTitle>
                            <AlertDescription>
                                Multi-factor authentication is currently enabled on your account.
                                You'll need to enter a code from your authenticator app when signing in.
                            </AlertDescription>
                        </Alert>

                        <Button
                            onClick={startUnenrollment}
                            variant="destructive"
                            disabled={isLoading}
                        >
                            Disable MFA
                        </Button>
                    </div>
                )}

                {isUnenrolling && (
                    <div className="space-y-4">
                        <Alert>
                            <Shield className="h-4 w-4" />
                            <AlertTitle>Disable MFA</AlertTitle>
                            <AlertDescription>
                                To disable multi-factor authentication, please enter a verification code from your authenticator app.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <Label htmlFor="unenroll-verification-code">Verification Code</Label>
                            <Input
                                id="unenroll-verification-code"
                                value={verificationCode}
                                onChange={handleVerificationCodeChange}
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                pattern="[0-9]{6}"
                                autoComplete="one-time-code"
                                required
                            />
                        </div>

                        <div className="flex space-x-2">
                            <Button
                                onClick={completeUnenrollment}
                                disabled={isLoading || !verificationCode || verificationCode.length !== 6}
                                variant="destructive"
                                className="flex-1"
                            >
                                {isLoading ? "Disabling..." : "Confirm Disable"}
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsUnenrolling(false)
                                    setVerificationCode("")
                                    setFactorId(null)
                                }}
                                variant="outline"
                                className="flex-1"
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