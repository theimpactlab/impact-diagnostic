// API client for the PHP backend (replaces all Supabase clients)
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://impctlab.uk/id-staging/api"

export class ApiError extends Error {
  status: number
  code: string
  constructor(status: number, code: string, message?: string) {
    super(message || code)
    this.status = status
    this.code = code
  }
}

export async function apiFetch<T = any>(
  path: string,
  options: { method?: string; body?: any; formData?: FormData } = {}
): Promise<T> {
  const init: RequestInit = {
    method: options.method || (options.body || options.formData ? "POST" : "GET"),
    credentials: "include",
    headers: {},
  }
  if (options.formData) {
    init.body = options.formData
  } else if (options.body !== undefined) {
    init.headers = { "Content-Type": "application/json" }
    init.body = JSON.stringify(options.body)
  }
  const res = await fetch(`${API_BASE}/${path.replace(/^\//, "")}`, init)
  let data: any = null
  try {
    data = await res.json()
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    throw new ApiError(res.status, data?.error || `http_${res.status}`, data?.message)
  }
  return data as T
}

// --- Session hook (client-side auth gate) ---
import { useCallback, useEffect, useState } from "react"

export interface SessionUser {
  id: number
  email: string
  mfa_enabled: number | boolean
}
export interface SessionProfile {
  full_name?: string | null
  avatar_url?: string | null
  organization_id?: number | null
  organization_name?: string | null
  is_super_user?: number | boolean
}
export interface SessionData {
  user: SessionUser
  profile: SessionProfile
}

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch<{ user: SessionUser; profile: SessionProfile }>("session.php")
      setSession({ user: data.user, profile: data.profile })
      return true
    } catch {
      setSession(null)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { session, loading, refresh }
}

export async function signOut() {
  await apiFetch("signout.php", { method: "POST", body: {} })
}
