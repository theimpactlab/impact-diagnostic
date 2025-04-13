"use client"

import { getCookie } from "cookies-next"
import { supabase } from "./client"

export async function forceLogin() {
  try {
    // Get the auth token cookie directly
    const authTokenCookie = getCookie("sb-ujjbzummjplrvhwybiqp-auth-token")

    if (!authTokenCookie) {
      throw new Error("No auth token cookie found")
    }

    // Parse the cookie to get the access token and refresh token
    const { access_token, refresh_token } = JSON.parse(authTokenCookie as string)

    if (!access_token || !refresh_token) {
      throw new Error("Invalid auth token format")
    }

    // Set the session manually
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })

    if (error) {
      throw error
    }

    // Force reload the page to ensure all components pick up the new session
    window.location.reload()

    return { success: true, user: data.user }
  } catch (error: any) {
    console.error("Force login error:", error)
    return { success: false, error: error.message }
  }
}
