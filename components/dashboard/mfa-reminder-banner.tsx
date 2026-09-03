"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Banner is rendered by the layout only when MFA is not enabled (from session.php),
// so no additional data fetching is needed here.
export default function MFAReminderBanner() {
  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
      <AlertDescription className="flex items-center justify-between">
        <span>
          <strong>Secure your account:</strong> Enable multi-factor authentication for enhanced security
        </span>
        <Link href="/profile?tab=mfa">
          <Button variant="outline" size="sm" className="border-amber-300 bg-white text-amber-800 hover:bg-amber-100">
            Enable MFA
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  )
}
