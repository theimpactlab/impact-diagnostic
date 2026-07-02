import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createServerSupabaseClient()

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
