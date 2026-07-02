import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "@/types/supabase"

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/features", "/register"]

export async function middleware(request: NextRequest) {
  let res = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          res = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  // Validate the session and refresh expired tokens (also on public routes,
  // so Server Components downstream always see fresh cookies). getUser()
  // verifies the JWT with the Auth server instead of trusting the cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isPublicRoute = PUBLIC_ROUTES.some((route) => (route === "/" ? pathname === "/" : pathname.startsWith(route)))

  if (
    isPublicRoute ||
    pathname.startsWith("/api/") ||
    // Auth callbacks (PKCE code exchange, email confirmation/recovery links)
    // must be reachable without a session.
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    /\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/.test(pathname)
  ) {
    return res
  }

  const redirectToLogin = () => {
    const url = new URL("/login", request.url)
    url.searchParams.set("redirectTo", pathname)
    const redirect = NextResponse.redirect(url)
    // Carry over cookies written by the token refresh above; dropping them
    // would lose a rotated refresh token and invalidate the session.
    res.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    return redirect
  }

  if (!user) {
    return redirectToLogin()
  }

  // MFA gate: nextLevel is "aal2" only when the user has a verified factor,
  // so this redirects exactly the users who still need to complete MFA.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal && aal.currentLevel !== aal.nextLevel) {
    return redirectToLogin()
  }

  // Prevent caching of authenticated pages
  res.headers.set("Cache-Control", "no-store, must-revalidate")
  res.headers.set("Pragma", "no-cache")
  res.headers.set("Expires", "0")

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
