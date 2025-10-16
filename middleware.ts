import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/features",
    "/register",
  ]

  const isPublicRoute = publicRoutes.some((route) => {
    if (route === "/") {
      // Only match exact root path, not paths that start with "/"
      return request.nextUrl.pathname === "/"
    }
    return request.nextUrl.pathname.startsWith(route)
  })

  // Allow access to public routes, API routes, and static assets
  if (
    isPublicRoute ||
    request.nextUrl.pathname.startsWith("/api/") ||
    request.nextUrl.pathname.startsWith("/_next/") ||
    request.nextUrl.pathname.startsWith("/favicon") ||
    // Allow common static file extensions
    /\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/.test(request.nextUrl.pathname)
  ) {
    return res
  }

  // If no session and trying to access protected route, redirect to login
  if (!session) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check if user has MFA factors enrolled
  const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()

  if (!factorsError && factors) {
    // Check if user has any verified MFA factors
    const hasVerifiedMFA = factors.all?.some(factor => factor.status === 'verified') || false

    if (hasVerifiedMFA) {
      // User has MFA enrolled, check if they're at AAL2
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

      if (aalData?.currentLevel !== 'aal2') {
        // User has MFA but hasn't verified it in this session - redirect to login
        const redirectUrl = new URL("/login", request.url)
        redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  // Set cache control headers to prevent caching of authenticated pages
  res.headers.set('Cache-Control', 'no-store, must-revalidate')
  res.headers.set('Pragma', 'no-cache')
  res.headers.set('Expires', '0')

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
