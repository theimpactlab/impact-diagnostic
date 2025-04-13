import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import CreateProjectForm from "@/components/projects/create-project-form"

export const dynamic = "force-dynamic"

export default async function NewProjectPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <p className="text-muted-foreground mt-2">Start a new impact assessment project for an organization</p>
      </div>

      <CreateProjectForm userId={session!.user.id} />
    </div>
  )
}
