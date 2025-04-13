"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

const formSchema = z.object({
  organization_name: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }),
  lead_consultant: z.string().min(2, {
    message: "Lead consultant name must be at least 2 characters.",
  }),
  research_consultant: z.string().optional(),
  data_consultant: z.string().optional(),
})

interface ProjectDetailsFormProps {
  project: {
    id: string
    name: string
    organization_name: string
    metadata?: {
      lead_consultant?: string
      research_consultant?: string
      data_consultant?: string
    } | null
  }
}

export default function ProjectDetailsForm({ project }: ProjectDetailsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organization_name: project.organization_name || "",
      lead_consultant: project.metadata?.lead_consultant || "",
      research_consultant: project.metadata?.research_consultant || "",
      data_consultant: project.metadata?.data_consultant || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          organization_name: values.organization_name,
          metadata: {
            lead_consultant: values.lead_consultant,
            research_consultant: values.research_consultant,
            data_consultant: values.data_consultant,
          },
        })
        .eq("id", project.id)

      if (error) throw error

      toast({
        title: "Project details updated",
        description: "Your project details have been updated successfully.",
      })

      router.refresh()
    } catch (error: any) {
      console.error("Error updating project details:", error)
      toast({
        title: "Something went wrong",
        description: error.message || "Failed to update project details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="organization_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Nonprofit" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lead_consultant"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lead Impact Consultant</FormLabel>
              <FormControl>
                <Input placeholder="Enter lead consultant name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="research_consultant"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Research Consultant (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter research consultant name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_consultant"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Consultant (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter data consultant name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Details"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
