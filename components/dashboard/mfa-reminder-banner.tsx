"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"

export default function MFAReminderBanner() {
    const [showBanner, setShowBanner] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        checkMFAStatus()
    }, [])

    const checkMFAStatus = async () => {
        try {
            const { data: factors, error } = await supabase.auth.mfa.listFactors()

            if (error) {
                // If we can't check MFA status, don't show the banner
                setIsLoading(false)
                return
            }

            // Check if user has any verified MFA factors
            const hasVerifiedMFA = factors?.all?.some(factor => factor.status === 'verified') || false

            // Show banner only if MFA is not enabled
            setShowBanner(!hasVerifiedMFA)
        } catch (error) {
            // If there's any error, don't show the banner
            setShowBanner(false)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading || !showBanner) {
        return null
    }

    return (
        <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
            <AlertDescription className="flex items-center justify-between">
                <span>
                    <strong>Secure your account:</strong> Enable multi-factor authentication for enhanced security
                </span>
                <Link href="/profile?tab=mfa">
                    <Button variant="outline" size="sm" className="border-amber-300 bg-white text-amber-800 hover:bg-amber-100">
                        Enable MFA
                    </Button>
                </Link>
            </AlertDescription>
        </Alert>
    )
} 