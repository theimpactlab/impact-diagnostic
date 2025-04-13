import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Check session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      return NextResponse.json(
        {
          status: "error",
          message: `Session error: ${sessionError.message}`,
          cookies: Array.from(cookieStore.getAll()).map((c) => c.name),
        },
        { status: 400 },
      )
    }

    if (!session) {
      return NextResponse.json({
        status: "unauthenticated",
        message: "No active session found",
        cookies: Array.from(cookieStore.getAll()).map((c) => c.name),
      })
    }

    // Get user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      return NextResponse.json(
        {
          status: "error",
          message: `User error: ${userError.message}`,
          session: session
            ? {
                expires_at: session.expires_at,
                created_at: session.created_at,
              }
            : null,
          cookies: Array.from(cookieStore.getAll()).map((c) => c.name),
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      status: "authenticated",
      user: {
        id: user?.id,
        email: user?.email,
        created_at: user?.created_at,
      },
      session: {
        expires_at: session.expires_at,
        created_at: session.created_at,
      },
      cookies: Array.from(cookieStore.getAll()).map((c) => c.name),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: `Unexpected error: ${error.message}`,
      },
      { status: 500 },
    )
  }
}
