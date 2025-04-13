"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"

const formSchema = z.object({
  organization_id: z.string().min(1, {
    message: "Please select an organization.",
  }),
  assessment_round: z.enum(["first", "follow_up"], {
    required_error: "Please select an assessment round.",
  }),
  description: z.string().optional(),
})

interface Organization {
  id: string
  name: string
}

interface CreateProjectFormProps {
  userId: string
}

export default function CreateProjectForm({ userId }: CreateProjectFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true)
  const [selectedOrgName, setSelectedOrgName] = useState<string>("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organization_id: "",
      assessment_round: "first",
      description: "",
    },
  })

  // Watch the organization_id field to update the selected org name
  const organizationId = form.watch("organization_id")
  const assessmentRound = form.watch("assessment_round")

  // Generate project name based on selected organization, assessment round, and current date
  const generatedProjectName = useMemo(() => {
    if (!selectedOrgName) return ""

    const roundText = assessmentRound === "first" ? "First Assessment" : "Follow-up Assessment"
    const dateText = format(new Date(), "MM/yy")

    return `${selectedOrgName} - ${roundText} - ${dateText}`
  }, [selectedOrgName, assessmentRound])

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const { data, error } = await supabase.from("organizations").select("id, name").order("name")

        if (error) throw error

        setOrganizations(data || [])
      } catch (error) {
        console.error("Error fetching organizations:", error)
        toast({
          title: "Error",
          description: "Failed to load organizations. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingOrgs(false)
      }
    }

    fetchOrganizations()
  }, [])

  // Update selected org name when organization_id changes
  useEffect(() => {
    if (organizationId) {
      const org = organizations.find((org) => org.id === organizationId)
      setSelectedOrgName(org?.name || "")
    } else {
      setSelectedOrgName("")
    }
  }, [organizationId, organizations])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!generatedProjectName) {
      toast({
        title: "Error",
        description: "Please select an organization first.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Get the organization name from the selected ID
      const organization = organizations.find((org) => org.id === values.organization_id)

      if (!organization) {
        throw new Error("Selected organization not found")
      }

      // Create the project with the generated name
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          name: generatedProjectName,
          organization_id: values.organization_id,
          organization_name: organization.name,
          description: values.description || null,
          owner_id: userId,
          metadata: {
            assessment_round: values.assessment_round,
          },
        })
        .select()
        .single()

      if (projectError) throw projectError

      // Create initial assessment
      const { error: assessmentError } = await supabase.from("assessments").insert({
        project_id: project.id,
        created_by: userId,
      })

      if (assessmentError) throw assessmentError

      // Add more detailed logging
      console.log("Project created successfully:", project)
      console.log("Current user ID:", userId)

      toast({
        title: "Project created",
        description: "Your new project has been created successfully.",
      })

      // Force a router refresh before navigation to ensure data is updated
      router.refresh()

      // Add a small delay before navigation to ensure refresh completes
      setTimeout(() => {
        router.push(`/projects/${project.id}`)
      }, 500)
    } catch (error: any) {
      console.error("Error creating project:", error)
      toast({
        title: "Something went wrong",
        description: error.message || "Failed to create project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="organization_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an organization" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingOrgs ? (
                    <SelectItem value="loading" disabled>
                      Loading organizations...
                    </SelectItem>
                  ) : organizations.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No organizations available
                    </SelectItem>
                  ) : (
                    organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>Select the organization being assessed.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assessment_round"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Assessment Round</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="first" />
                    </FormControl>
                    <FormLabel className="font-normal">First Assessment</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="follow_up" />
                    </FormControl>
                    <FormLabel className="font-normal">Follow-up Assessment</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormDescription>
                Indicate whether this is the first assessment or a follow-up assessment for this organization.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Display the generated project name */}
        {selectedOrgName && (
          <div className="space-y-2">
            <FormLabel>Project Name</FormLabel>
            <div className="p-3 border rounded-md bg-muted/30">
              <p className="font-medium">{generatedProjectName}</p>
            </div>
            <FormDescription>This name is automatically generated based on your selections.</FormDescription>
          </div>
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of this assessment project"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>Provide additional context about this assessment project.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || isLoadingOrgs || !selectedOrgName}>
            {isLoading ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
