"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TestRLSPage() {
  const [results, setResults] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const runTests = async () => {
    setIsLoading(true)
    const testResults: any = {}

    try {
      // Test 1: Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      testResults.user = { data: user, error: userError }

      if (user) {
        // Test 2: Try to read own profile
        const { data: ownProfile, error: ownProfileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        testResults.ownProfile = { data: ownProfile, error: ownProfileError }

        // Test 3: Try to read just is_super_user field
        const { data: superUserCheck, error: superUserError } = await supabase
          .from("profiles")
          .select("is_super_user")
          .eq("id", user.id)
          .single()
        testResults.superUserCheck = { data: superUserCheck, error: superUserError }

        // Test 4: Try to read all profiles (should fail if not super user)
        const { data: allProfiles, error: allProfilesError } = await supabase.from("profiles").select("id, email")
        testResults.allProfiles = { data: allProfiles, error: allProfilesError }

        // Test 5: Try to update own profile (test write access)
        const { data: updateTest, error: updateError } = await supabase
          .from("profiles")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", user.id)
          .select()
        testResults.updateTest = { data: updateTest, error: updateError }
      }
    } catch (error) {
      testResults.generalError = error
    }

    setResults(testResults)
    setIsLoading(false)
  }

  useEffect(() => {
    runTests()
  }, [])

  const copyFixScript = () => {
    const fixScript = `-- Fix RLS policies to allow users to read their own profiles
-- Run this in your Supabase SQL Editor

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super users can delete profiles" ON public.profiles;

-- Create simple, working policies
CREATE POLICY "Enable read access for own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow super users to see all profiles (but only if they can read their own first)
CREATE POLICY "Enable read access for super users" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_super_user = true
    )
  );

-- Set yourself as super user (replace with your email)
UPDATE public.profiles 
SET is_super_user = true 
WHERE email = 'your-email@example.com';

-- Verify the fix worked
SELECT id, email, is_super_user FROM public.profiles WHERE id = auth.uid();`

    navigator.clipboard.writeText(fixScript)
    toast({
      title: "Copied!",
      description: "RLS fix script copied to clipboard",
    })
  }

  const TestResult = ({ title, result, description }: any) => {
    const hasError = result?.error
    const hasData = result?.data

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            {hasError ? (
              <XCircle className="h-4 w-4 text-red-500" />
            ) : hasData ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
            {title}
          </CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {hasError && (
              <div className="text-red-600 text-xs">
                <strong>Error:</strong> {result.error.message}
              </div>
            )}
            {hasData && (
              <div className="text-green-600 text-xs">
                <strong>Success:</strong> {Array.isArray(result.data) ? `${result.data.length} records` : "Data found"}
              </div>
            )}
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground">View Details</summary>
              <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
            </details>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">RLS Policy Test</h1>
        <p className="text-muted-foreground">Testing if Row Level Security is blocking profile access</p>
      </div>

      <div className="flex gap-4">
        <Button onClick={runTests} disabled={isLoading}>
          {isLoading ? "Running Tests..." : "Run Tests Again"}
        </Button>
        <Button onClick={copyFixScript} variant="outline">
          <Copy className="h-4 w-4 mr-2" />
          Copy Fix Script
        </Button>
      </div>

      {results.ownProfile?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>RLS Issue Detected!</AlertTitle>
          <AlertDescription>
            You cannot read your own profile due to RLS policies. This is why the admin link isn't showing in the
            navigation. Use the "Copy Fix Script" button above to get the SQL that will fix this.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <TestResult title="Get Current User" result={results.user} description="Test if authentication is working" />

        <TestResult
          title="Read Own Profile"
          result={results.ownProfile}
          description="Test if you can read your own profile (this is the key test)"
        />

        <TestResult
          title="Check Super User Status"
          result={results.superUserCheck}
          description="Test if you can read your is_super_user field specifically"
        />

        <TestResult
          title="Read All Profiles"
          result={results.allProfiles}
          description="Test if you can read other users (should fail unless super user)"
        />

        <TestResult
          title="Update Own Profile"
          result={results.updateTest}
          description="Test if you can update your own profile"
        />
      </div>

      {results.ownProfile?.data && (
        <Card>
          <CardHeader>
            <CardTitle>Your Profile Data</CardTitle>
            <CardDescription>If you can see this, RLS is working for reading your own profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Email:</span>
                <span>{results.ownProfile.data.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Super User:</span>
                <span className={results.ownProfile.data.is_super_user ? "text-green-600" : "text-red-600"}>
                  {results.ownProfile.data.is_super_user ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Full Name:</span>
                <span>{results.ownProfile.data.full_name || "Not set"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
