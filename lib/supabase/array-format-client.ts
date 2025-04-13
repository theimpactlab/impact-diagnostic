import { createClient } from "@supabase/supabase-js"
import { getCookie, setCookie } from "cookies-next"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// This specialized client handles the array-formatted auth cookie
export const createArrayFormatClient = () => {
  // Get the current auth cookie
  const authCookie = getCookie("sb-ujjbzummjplrvhwybiqp-auth-token")

  let session = null

  // If the cookie exists and is in array format, extract the JWT
  if (authCookie) {
    try {
      const parsedCookie = JSON.parse(String(authCookie))

      // If it's an array and has at least one element (the JWT)
      if (Array.isArray(parsedCookie) && parsedCookie.length > 0) {
        // Create a properly formatted session object
        session = {
          access_token: parsedCookie[0], // The JWT is the first element
          refresh_token: parsedCookie[1] || "", // The refresh token is the second element
          expires_at: Math.floor(Date.now() / 1000) + 3600, // Set expiry to 1 hour from now
        }

        // Store the properly formatted session
        localStorage.setItem("sb-ujjbzummjplrvhwybiqp-auth-token", JSON.stringify(session))

        // Also set the cookie in the proper format
        setCookie("sb-ujjbzummjplrvhwybiqp-auth-token-fixed", JSON.stringify(session), {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
      }
    } catch (error) {
      console.error("Error parsing auth cookie:", error)
    }
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: "pkce",
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
      storage: {
        getItem: (key) => {
          // If we have a fixed session, use that
          if (key === "sb-ujjbzummjplrvhwybiqp-auth-token" && session) {
            return JSON.stringify(session)
          }
          // Otherwise fall back to localStorage
          return localStorage.getItem(key)
        },
        setItem: (key, value) => {
          localStorage.setItem(key, value)
          // Also set as a cookie for server-side access
          if (key === "sb-ujjbzummjplrvhwybiqp-auth-token") {
            setCookie("sb-ujjbzummjplrvhwybiqp-auth-token-fixed", value, {
              path: "/",
              maxAge: 60 * 60 * 24 * 7, // 7 days
            })
          }
        },
        removeItem: (key) => {
          localStorage.removeItem(key)
          // Also remove the cookie
          if (key === "sb-ujjbzummjplrvhwybiqp-auth-token") {
            setCookie("sb-ujjbzummjplrvhwybiqp-auth-token-fixed", "", {
              path: "/",
              maxAge: 0,
            })
          }
        },
      },
    },
  })
}
