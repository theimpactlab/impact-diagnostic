"use client"

import { useState } from "react"
import { getAdminAccessFix } from "@/app/actions/fix-admin-access"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Copy, Shield, AlertCircle, CheckCircle } from "lucide-react"

export default function FixAccessPage() {
  const [sqlScript, setSqlScript] = useState<string>("")
  const { toast } = useToast()

  const generateFixScript = async () => {
    try {
      const result = await getAdminAccessFix()
      setSqlScript(result.sqlScript)
      toast({
        title: "Fix Script Generated",
        description: "Copy and run the SQL script in Supabase to fix admin access",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate fix script",
        variant: "destructive",
      })
    }
  }

  const copySqlScript = () => {
    navigator.clipboard.writeText(sqlScript)
    toast({
      title: "Copied",
      description: "SQL script copied to clipboard",
    })
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fix Admin Access</h1>
        <p className="text-muted-foreground">Fix RLS policies to allow super users to see all profiles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Access Issue
          </CardTitle>
          <CardDescription>
            Super users should be able to see all user profiles, but RLS policies may be blocking this access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Problem</AlertTitle>
            <AlertDescription>
              The Row Level Security (RLS) policies created during the auth setup are preventing super users from seeing
              all profiles. This script will fix the policies to allow proper admin access.
            </AlertDescription>
          </Alert>

          <Button onClick={generateFixScript} className="w-full">
            Generate Admin Access Fix Script
          </Button>

          {sqlScript && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Instructions</AlertTitle>
                <AlertDescription>
                  1. Copy the SQL script below
                  <br />
                  2. Go to your Supabase dashboard → SQL Editor
                  <br />
                  3. Paste and run the entire script
                  <br />
                  4. Check if your email shows is_super_user = true in the results
                  <br />
                  5. If not, uncomment and modify the UPDATE statement with your email
                  <br />
                  6. Go back to the admin dashboard to verify you can see all users
                </AlertDescription>
              </Alert>

              <div className="relative">
                <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto max-h-96 border">{sqlScript}</pre>
                <Button size="sm" variant="outline" className="absolute top-2 right-2" onClick={copySqlScript}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What This Fix Does</CardTitle>
          <CardDescription>Explanation of the changes being made</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Updated RLS Policies</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Allows users to see their own profile (as before)</li>
                <li>• Allows super users to see ALL profiles</li>
                <li>• Allows super users to update any profile</li>
                <li>• Allows super users to delete profiles if needed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Super User Check</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Shows your current super user status</li>
                <li>• Provides option to manually set super user flag</li>
                <li>• Ensures proper admin permissions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
