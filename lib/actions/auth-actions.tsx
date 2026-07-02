"use server"

import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Redirect to dashboard
  redirect("/dashboard")
}

export async function signOut() {
  const supabase = await createServerSupabaseClient()

  await supabase.auth.signOut()

  // Redirect to login
  redirect("/login")
}
