import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Use the auth helpers client which properly handles cookies in Next.js
export const supabase = createClientComponentClient<Database>()
