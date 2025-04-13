"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { Camera, Loader2 } from "lucide-react"

const formSchema = z.object({
  full_name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z
    .string()
    .email({
      message: "Please enter a valid email address.",
    })
    .optional(),
  username: z
    .string()
    .min(3, {
      message: "Username must be at least 3 characters.",
    })
    .optional(),
})

interface ProfileFormProps {
  profile: {
    id: string
    full_name: string | null
    email: string | null
    username: string | null
    avatar_url: string | null
    is_super_user: boolean
    organizations: {
      id: string
      name: string
    } | null
  }
  organizations: {
    id: string
    name: string
  }[]
}

export default function ProfileForm({ profile, organizations }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: profile.full_name || "",
      email: profile.email || "",
      username: profile.username || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: values.full_name,
          username: values.username,
        })
        .eq("id", profile.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      router.refresh()
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      // Upload the file to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${profile.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

      if (uploadError) throw uploadError

      // Get the public URL
      const { data: publicURL } = supabase.storage.from("avatars").getPublicUrl(filePath)

      // Update the user's avatar_url
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicURL.publicUrl })
        .eq("id", profile.id)

      if (updateError) throw updateError

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      })

      router.refresh()
    } catch (error: any) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update avatar.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const userInitials = profile.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : profile.email?.[0].toUpperCase() || "U"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Update your profile picture</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="relative mb-4">
            <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || "User"} />
              <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
              <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 shadow-sm">
                <Camera className="h-4 w-4 text-primary-foreground" />
              </div>
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              disabled={isUploading}
            />
          </div>
          <p className="text-sm text-muted-foreground">Click on the avatar to upload a new image</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormDescription>This will be used for your profile URL</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" disabled {...field} />
                    </FormControl>
                    <FormDescription>Email cannot be changed</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
          <CardDescription>Your organization details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Organization</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {profile.organizations?.name || "No organization assigned"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Role</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {profile.is_super_user ? "Super User" : "Standard User"}
              </p>
              {profile.is_super_user && (
                <p className="text-xs text-muted-foreground mt-1">
                  As a Super User, you have access to all projects and the admin dashboard.
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Organization and role changes can only be made by administrators.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
