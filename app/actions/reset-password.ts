"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function resetPassword(formData: FormData) {
    const newPassword = formData.get("new_password") as string
    const confirmPassword = formData.get("confirm_password") as string

    // Validate passwords
    if (!newPassword || !confirmPassword) {
        return {
            error: "Both password fields are required",
        }
    }

    if (newPassword !== confirmPassword) {
        return {
            error: "Passwords do not match",
        }
    }

    if (newPassword.length < 12) {
        return {
            error: "Password must be at least 12 characters",
        }
    }

    try {
        const supabase = createServerActionClient({ cookies })

        // Get the user's session
        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
            return {
                error: "You must be logged in to reset your password",
            }
        }

        // Update the user's password
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        })

        if (error) {
            return {
                error: error.message,
            }
        }

        return {
            success: "Your password has been updated successfully",
        }
    } catch (error) {
        console.error("Error resetting password:", error)
        return {
            error: "An unexpected error occurred",
        }
    }
} 