// This file contains server-side configuration for Supabase

// Get the site URL from environment or use a fallback
export function getSiteUrl() {
  // For production, use the NEXT_PUBLIC_SITE_URL environment variable
  // For development, use localhost
  return process.env.NEXT_PUBLIC_SITE_URL || "https://impact-diagnostic.vercel.app"
}

// Configure Supabase Auth settings
export const authConfig = {
  // The site URL that will be used for redirects
  siteUrl: getSiteUrl(),

  // The path to redirect to after a successful sign-in
  redirectTo: `${getSiteUrl()}/auth/callback`,
}

// Export the full callback URL for use in Supabase configuration
export const getAuthCallbackUrl = () => {
  return `${getSiteUrl()}/auth/callback`
}
