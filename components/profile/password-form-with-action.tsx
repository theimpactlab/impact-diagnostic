"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { updatePassword } from "@/lib/actions/auth"
import { useSession } from "@/components/providers/session-provider"

const formSchema = z
  .object({
    newPassword: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export default function PasswordFormWithAction() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { session, isLoading: sessionLoading } = useSession()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!session) {
      toast({
        title: "Not authenticated",
        description: "Please log in to change your password.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setIsLoading(true)

    try {
      const result = await updatePassword(values.newPassword)

      if (result.success) {
        toast({
          title: "Password updated",
          description: "Your password has been updated successfully.",
        })
        form.reset()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error("Error updating password:", error)

      // Check if it's an expired session error
      if (error.message?.includes("session") || error.message?.includes("JWT") || error.message?.includes("auth")) {
        toast({
          title: "Session expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        })
        router.push("/login")
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to update password.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking session
  if (sessionLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <p>Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show login message if no session
  if (!session) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            <p>You need to be logged in to change your password.</p>
            <Button onClick={() => router.push("/login")}>Go to Login</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your password</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
