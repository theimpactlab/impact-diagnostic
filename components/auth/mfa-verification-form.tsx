"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { verifyMFA } from "@/app/actions/mfa-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MFAVerificationFormProps {
    factorId: string
    challengeId: string
    redirectTo: string
}

export default function MFAVerificationForm({ factorId, challengeId, redirectTo }: MFAVerificationFormProps) {
    const router = useRouter()
    const [code, setCode] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append("factorId", factorId)
            formData.append("challengeId", challengeId)
            formData.append("code", code)
            formData.append("redirectTo", redirectTo)

            const result = await verifyMFA(formData)

            if (result?.error) {
                setError(result.error)
            } else if (result?.success && result?.redirectTo) {
                // Successful MFA verification, redirect to dashboard
                router.push(result.redirectTo)
                return
            }
        } catch (err: any) {
            console.error("MFA verification error:", err)
            setError("An unexpected error occurred during MFA verification")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="code">Verification Code</Label>
                    <Input
                        id="code"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        required
                        autoFocus
                    />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || !code}>
                    {isLoading ? "Verifying..." : "Verify"}
                </Button>
            </form>
        </div>
    )
} 