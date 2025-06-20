"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Keep only MFA verification for auth flow - other MFA operations can be done securely client-side
export async function verifyMFA(formData: FormData) {
    const factorId = formData.get("factorId") as string
    const challengeId = formData.get("challengeId") as string
    const code = formData.get("code") as string
    const redirectTo = formData.get("redirectTo") as string || "/dashboard"

    // Validate inputs
    if (!factorId || !challengeId || !code) {
        return {
            error: "All MFA fields are required",
        }
    }

    try {
        const supabase = createServerActionClient({ cookies })

        // Verify the MFA code
        const { error: verifyError } = await supabase.auth.mfa.verify({
            factorId,
            challengeId,
            code,
        })

        if (verifyError) {
            return {
                error: verifyError.message,
            }
        }

        // MFA verification successful, return success with redirect URL
        return {
            success: true,
            redirectTo,
        }
    } catch (error) {
        console.error("MFA verification error:", error)
        return {
            error: "An unexpected error occurred during MFA verification",
        }
    }
} 