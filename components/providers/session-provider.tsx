"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"

type SessionContextType = {
  session: Session | null
  isLoading: boolean
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  isLoading: true,
})

export const useSession = () => useContext(SessionContext)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return <SessionContext.Provider value={{ session, isLoading }}>{children}</SessionContext.Provider>
}
