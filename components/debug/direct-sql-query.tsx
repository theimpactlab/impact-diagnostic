"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase/client"
import { Loader2, AlertCircle } from "lucide-react"

export default function DirectSqlQuery() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState<string>(
    `
-- Example: List all projects
SELECT * FROM projects LIMIT 10;

-- Or check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'projects';
  `.trim(),
  )

  const runQuery = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      // This will only work if the user has permission to run SQL queries
      // or if you've created a special RPC function for this purpose
      const { data, error: queryError } = await supabase.rpc("run_sql_query", {
        query_text: query,
      })

      if (queryError) throw new Error(`Query error: ${queryError.message}`)

      setResults(data)
    } catch (err: any) {
      console.error("SQL query error:", err)
      setError(err.message || "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Direct SQL Query</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This tool requires a special RPC function to be set up in your Supabase project. It may not work if you don't
          have the necessary permissions.
        </p>

        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="font-mono text-sm h-40"
          placeholder="Enter SQL query..."
        />

        <Button onClick={runQuery} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running query...
            </>
          ) : (
            "Run Query"
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Query Results:</h3>
            <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
              <pre className="text-xs">{JSON.stringify(results, null, 2)}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
