import type React from "react"

// Admin gating is handled inside the admin page (client-side session check +
// server-side super-user enforcement on every admin API endpoint).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
