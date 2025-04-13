"use client"

import { useState } from "react"
import { Trash2, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"

interface Project {
  id: string
  name: string
  description: string | null
  organization_name: string
  owner_id: string
  owner_email: string | null
  owner_name: string | null
  created_at: string
}

interface ProjectsManagementProps {
  projects: Project[]
}

export default function ProjectsManagement({ projects: initialProjects }: ProjectsManagementProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const handleDelete = async (projectId: string) => {
    setIsLoading(true)

    try {
      // Delete the project
      const { error } = await supabase.from("projects").delete().eq("id", projectId)

      if (error) throw error

      // Update the local state
      setProjects((prev) => prev.filter((project) => project.id !== projectId))

      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully.",
      })
    } catch (error: any) {
      console.error("Error deleting project:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete project.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project)
    setIsDetailsOpen(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projects</h2>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No projects found
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.organization_name}</TableCell>
                  <TableCell>{project.owner_name || project.owner_email || "Unknown"}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(project)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Project</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {project.name}? This action cannot be undone. All
                              associated assessments and data will be permanently deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(project.id)}
                              className="bg-red-500 hover:bg-red-600"
                              disabled={isLoading}
                            >
                              {isLoading ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Project Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
            <DialogDescription>Detailed information about the selected project.</DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Project Name</h3>
                <p>{selectedProject.name}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
                <p>{selectedProject.description || "No description provided"}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Organization</h3>
                <p>{selectedProject.organization_name}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Owner</h3>
                <p>{selectedProject.owner_name || selectedProject.owner_email || "Unknown"}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Created</h3>
                <p>{new Date(selectedProject.created_at).toLocaleString()}</p>
              </div>
              <div className="pt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Delete Project
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Project</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedProject.name}? This action cannot be undone. All
                        associated assessments and data will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          handleDelete(selectedProject.id)
                          setIsDetailsOpen(false)
                        }}
                        className="bg-red-500 hover:bg-red-600"
                        disabled={isLoading}
                      >
                        {isLoading ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
