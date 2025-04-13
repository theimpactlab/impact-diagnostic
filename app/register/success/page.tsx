import Link from "next/link"
import type { Metadata } from "next"
import { CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Registration Successful | Impact Diagnostic Assessment",
  description: "Your registration has been submitted successfully.",
}

export default function RegistrationSuccessPage() {
  return (
    <div className="container flex h-screen w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center space-y-6 text-center">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Registration Successful</h1>
        <p className="text-muted-foreground">
          Thank you for registering for the Impact Diagnostic Assessment. Your request has been submitted and is pending
          approval.
        </p>
        <p className="text-muted-foreground">
          An administrator will review your request and contact you at the email address you provided.
        </p>
        <Button asChild className="mt-4">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  )
}
