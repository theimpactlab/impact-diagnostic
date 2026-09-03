"use client"

import type React from "react"

import { useState } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      await apiFetch("register.php", { body: { email, password, full_name: fullName } })
      const text = "Account created. Please check your email for a verification link."
      setMessage({ type: "success", text })
      toast({ title: "Account created", description: text })
    } catch (err: any) {
      const text =
        err.code === "email_taken"
          ? "An account with this email already exists."
          : err.code === "password_too_short"
            ? "Password must be at least 12 characters."
            : err.message || "Registration failed. Please try again."
      setMessage({ type: "error", text })
      toast({ title: "Error", description: text, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex flex-1 w-full items-center justify-center py-12">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <Card className="mx-auto w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Sign Up</CardTitle>
              <CardDescription>Create an account to get started</CardDescription>
            </CardHeader>
            <CardContent>
              {message && (
                <div
                  className={`mb-4 rounded-md p-3 text-sm ${
                    message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  }`}
                >
                  {message.text}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={12}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Minimum 12 characters</p>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Link href="/login">
                  <Button variant="link" className="gap-1">
                    <ArrowLeft className="h-4 w-4" /> Back to sign in
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
