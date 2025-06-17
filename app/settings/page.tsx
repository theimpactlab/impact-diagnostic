import { createServerSupabaseClient } from "@/lib/supabase/server"
import MFASettings from "@/components/profile/mfa-settings"

export default async function SettingsPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

   return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <MFASettings />
     </div>
   )
 }

