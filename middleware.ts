import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// Add "/admin" to the publicRoutes array to bypass middleware checks temporarily
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/about",
  "/features",
  "/pricing",
  "/contact",
  "/forgot-password",
  "/admin",
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Check if the path is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith("/auth/"),
  )

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session and trying to access a protected route, redirect to login
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL("/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If has session and trying to access login/register, redirect to dashboard
  if (session && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")) {
    const redirectUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
}
