import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    // Sign out the user
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error signing out:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Redirect to home page after successful sign out
    return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://impact-diagnostic.com"))
  } catch (error) {
    console.error("Unexpected error during sign out:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function GET() {
  // Handle GET requests by redirecting to POST
  return POST()
}
