import CreateProjectForm from "@/components/projects/create-project-form"

export const metadata = { title: "Create New Project" }

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <p className="text-muted-foreground mt-2">Start a new impact assessment project for an organization</p>
      </div>

      <CreateProjectForm />
    </div>
  )
}
