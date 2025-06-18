"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface MFAVerificationFormProps {
    factorId: string
    challengeId: string
    redirectTo: string
}

export default function MFAVerificationForm({ factorId, challengeId: initialChallengeId, redirectTo }: MFAVerificationFormProps) {
    const router = useRouter()
    const [verificationCode, setVerificationCode] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [failedAttempts, setFailedAttempts] = useState(0)
    const [isLocked, setIsLocked] = useState(false)
    const [lockoutTime, setLockoutTime] = useState<number | null>(null)

    const MAX_ATTEMPTS = 5
    const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isLocked) {
            const timeLeft = lockoutTime ? Math.ceil((lockoutTime - Date.now()) / 1000 / 60) : 0
            setError(`Too many failed attempts. Please try again in ${timeLeft} minutes.`)
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            // Create a fresh challenge for this verification attempt
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId
            })

            if (challengeError) {
                throw challengeError
            }

            // Use the new challenge ID for verification
            const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
                factorId,
                challengeId: challengeData.id,
                code: verificationCode,
            })

            if (verifyError) {
                throw verifyError
            }

            // Explicitly set the session to ensure it's persisted properly
            if (verifyData.access_token && verifyData.refresh_token) {
                const { error: setSessionError } = await supabase.auth.setSession({
                    access_token: verifyData.access_token,
                    refresh_token: verifyData.refresh_token
                })

                if (setSessionError) {
                    throw setSessionError
                }
            }

            // Wait a moment for the session to be updated
            await new Promise(resolve => setTimeout(resolve, 500))

            // Reset failed attempts on success
            setFailedAttempts(0)
            setIsLocked(false)
            setLockoutTime(null)

            // Redirect to the intended destination
            window.location.href = redirectTo
        } catch (err: any) {
            const newFailedAttempts = failedAttempts + 1
            setFailedAttempts(newFailedAttempts)

            if (newFailedAttempts >= MAX_ATTEMPTS) {
                setIsLocked(true)
                const lockTime = Date.now() + LOCKOUT_DURATION
                setLockoutTime(lockTime)
                setError(`Too many failed attempts. Account locked for 15 minutes.`)

                // Auto-unlock after lockout period
                setTimeout(() => {
                    setIsLocked(false)
                    setFailedAttempts(0)
                    setLockoutTime(null)
                }, LOCKOUT_DURATION)
            } else {
                const attemptsLeft = MAX_ATTEMPTS - newFailedAttempts
                // Generic error message to avoid information disclosure
                const errorMessage = err.message.includes('Invalid TOTP code')
                    ? 'Invalid verification code'
                    : 'Verification failed'
                setError(`${errorMessage}. ${attemptsLeft} attempts remaining.`)
            }

            // Clear the verification code on error
            setVerificationCode("")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleVerification} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="verification-code" className="text-sm font-medium">
                        Verification Code
                    </label>
                    <Input
                        id="verification-code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        autoComplete="one-time-code"
                        disabled={isLocked}
                        required
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !verificationCode || isLocked}
                >
                    {isLoading ? "Verifying..." : "Verify"}
                </Button>
            </form>
        </div>
    )
} 