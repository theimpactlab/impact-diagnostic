"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { toast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }),
})

interface Organization {
  id: string
  name: string
  created_at: string
}

interface OrganizationsManagementProps {
  organizations: Organization[]
}

export default function OrganizationsManagement({ organizations: initialOrganizations }: OrganizationsManagementProps) {
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations)
  const [isLoading, setIsLoading] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    try {
      if (editingOrg) {
        // Update existing organization
        const { data, error } = await supabase
          .from("organizations")
          .update({ name: values.name, updated_at: new Date().toISOString() })
          .eq("id", editingOrg.id)
          .select()
          .single()

        if (error) throw error

        setOrganizations((prev) => prev.map((org) => (org.id === editingOrg.id ? { ...org, name: values.name } : org)))

        toast({
          title: "Organization updated",
          description: `${values.name} has been updated successfully.`,
        })
      } else {
        // Create new organization
        const { data, error } = await supabase.from("organizations").insert({ name: values.name }).select().single()

        if (error) throw error

        setOrganizations((prev) => [...prev, data])

        toast({
          title: "Organization created",
          description: `${values.name} has been created successfully.`,
        })
      }

      form.reset()
      setEditingOrg(null)
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error("Error saving organization:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save organization.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (org: Organization) => {
    setEditingOrg(org)
    form.setValue("name", org.name)
    setIsDialogOpen(true)
  }

  const handleDelete = async (orgId: string) => {
    try {
      const { error } = await supabase.from("organizations").delete().eq("id", orgId)

      if (error) throw error

      setOrganizations((prev) => prev.filter((org) => org.id !== orgId))

      toast({
        title: "Organization deleted",
        description: "The organization has been deleted successfully.",
      })
    } catch (error: any) {
      console.error("Error deleting organization:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete organization.",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Organizations</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingOrg(null)
                form.reset()
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Organization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingOrg ? "Edit Organization" : "Add Organization"}</DialogTitle>
              <DialogDescription>
                {editingOrg ? "Update the organization details below." : "Enter the details for the new organization."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter organization name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : editingOrg ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                  No organizations found
                </TableCell>
              </TableRow>
            ) : (
              organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>{new Date(org.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(org)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
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
                            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {org.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(org.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
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
    </div>
  )
}
