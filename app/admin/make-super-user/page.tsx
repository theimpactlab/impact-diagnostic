"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Shield, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function MakeSuperUserPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleMakeSuperUser = async () => {
    setIsLoading(true)
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("Not authenticated")
      }

      // Update the user's profile to make them a super user
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_super_user: true })
        .eq('id', user.id)
        .select('id, email, is_super_user')
        .single()

      if (error) {
        throw new Error(error.message)
      }

      setResult({
        success: true,
        message: "Successfully granted super user privileges!",
        data: data,
      })

      toast({
        title: "Success",
        description: "You are now a super user!",
      })
    } catch (error: any) {
      console.error("Error making super user:", error)
      setResult({
        success: false,
        message: error.message || "An unexpected error occurred",
      })
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const goToAdmin = () => {
    router.push("/admin")
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Make Super User</h1>
        <p className="text-muted-foreground">Grant super user privileges to your account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Super User Access
          </CardTitle>
          <CardDescription>Make your account a super user to access admin features and see all users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>What This Does</AlertTitle>
            <AlertDescription>
              This will update your profile in the database to set is_super_user = TRUE, giving you admin privileges.
            </AlertDescription>
          </Alert>

          <Button onClick={handleMakeSuperUser} disabled={isLoading} className="w-full">
            {isLoading ? "Processing..." : "Make Me Super User"}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>
                <p>{result.message}</p>
                {result.success && (
                  <Button onClick={goToAdmin} className="mt-2" size="sm">
                    Go to Admin Dashboard
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {result?.success === false && (
            <div className="space-y-2">
              <p className="font-medium">Alternative Method:</p>
              <p className="text-sm">Run this SQL in your Supabase SQL Editor:</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                {`-- Make yourself a super user
UPDATE public.profiles 
SET is_super_user = TRUE 
WHERE id = auth.uid();

-- Verify it worked
SELECT id, email, is_super_user FROM profiles WHERE id = auth.uid();`}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
