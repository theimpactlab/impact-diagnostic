"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function login(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const redirectTo = formData.get("redirectTo") as string || "/dashboard"

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
        const supabase = createServerActionClient({ cookies })

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
            // MFA is required, create challenge
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId: totpFactor.id
            })

            if (challengeError) {
                return {
                    error: challengeError.message,
                }
            }

            return {
                requiresMFA: true,
                factorId: totpFactor.id,
                challengeId: challengeData.id,
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