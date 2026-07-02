"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

function getSafeRedirectPath(redirectTo: FormDataEntryValue | null) {
    if (typeof redirectTo !== "string" || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
        return "/dashboard"
    }

    return redirectTo
}

export async function login(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const redirectTo = getSafeRedirectPath(formData.get("redirectTo"))

    // Validate inputs
    if (!email || !password) {
        return {
            error: "Email and password are required",
        }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return {
            error: "Please enter a valid email address",
        }
    }

    try {
        const supabase = await createServerSupabaseClient()

        // Attempt to sign in
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return {
                error: error.message,
            }
        }

        // Verify session was created
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
            return {
                error: "Failed to create session after login",
            }
        }

        // Check if MFA is required
        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()

        if (factorsError) {
            return {
                error: factorsError.message,
            }
        }

        const totpFactor = factors?.totp?.find(factor => factor.status === 'verified')

        if (totpFactor) {
            // MFA is required. The challenge is created together with the
            // verification in verifyMFA (challengeAndVerify): creating it here
            // in a separate server invocation can fail on serverless hosting,
            // where challenge and verify may egress from different IPs and
            // Supabase rejects the mismatch.
            return {
                requiresMFA: true,
                factorId: totpFactor.id,
                redirectTo,
            }
        }

        // No MFA required, return success with redirect URL
        return {
            success: true,
            redirectTo,
        }
    } catch (error) {
        console.error("Login error:", error)
        return {
            error: "An unexpected error occurred during login",
        }
    }
}
