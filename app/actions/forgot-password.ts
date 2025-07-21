"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function forgotPassword(formData: FormData) {
    const email = formData.get("email") as string

    // Validate email
    if (!email) {
        return {
            error: "Email is required",
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

        // Reset password for email - this will be executed server-side
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.impact-diagnostic.com'}/reset-password?from=email`,

        })

        if (error) {
            return {
                error: error.message,
            }
        }

        return {
            success: "Check your email for a password reset link",
        }
    } catch (error) {
        console.error("Error sending password reset email:", error)
        return {
            error: "An unexpected error occurred",
        }
    }
} 
