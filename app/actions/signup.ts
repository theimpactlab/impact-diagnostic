"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function signUp(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string

    // Validate inputs
    if (!email || !password) {
        return {
            error: "Email and password are required",
        }
    }

    if (password.length < 6) {
        return {
            error: "Password must be at least 6 characters",
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

        // Sign up with email and password - this will be executed server-side
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.impact-diagnostic.com'}/auth/callback`,
            },
        })

        if (error) {
            return {
                error: error.message,
            }
        }

        return {
            success: "Registration successful! Check your email to confirm your account.",
            data: data,
        }
    } catch (error) {
        console.error("Error during signup:", error)
        return {
            error: "An unexpected error occurred during registration",
        }
    }
} 