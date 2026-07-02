"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

function getSafeRedirectPath(redirectTo: FormDataEntryValue | null) {
    if (typeof redirectTo !== "string" || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
        return "/dashboard"
    }

    return redirectTo
}

// Keep only MFA verification for auth flow - other MFA operations can be done securely client-side
export async function verifyMFA(formData: FormData) {
    const factorId = formData.get("factorId") as string
    const code = formData.get("code") as string
    const redirectTo = getSafeRedirectPath(formData.get("redirectTo"))

    // Validate inputs
    if (!factorId || !code) {
        return {
            error: "All MFA fields are required",
        }
    }

    try {
        const supabase = await createServerSupabaseClient()

        // Create the challenge and verify the code in the same invocation so
        // both requests reach Supabase from the same IP (it rejects a verify
        // coming from a different IP than the challenge).
        const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
            factorId,
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
