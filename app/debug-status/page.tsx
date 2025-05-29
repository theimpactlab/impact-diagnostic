import DatabaseSetup from "@/components/admin/database-setup"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugStatusPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Debug Project Status</h1>
        <p className="text-muted-foreground">Troubleshoot project status update issues</p>
      </div>

      <DatabaseSetup />

      <Card>
        <CardHeader>
          <CardTitle>Manual Database Setup</CardTitle>
          <CardDescription>If you need to manually add the status column to your projects table</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If the automatic check doesn't work, you can manually run this SQL command in your Supabase SQL Editor:
            </p>
            <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
              {`-- Add status column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add a check constraint to ensure valid status values
ALTER TABLE projects 
ADD CONSTRAINT IF NOT EXISTS projects_status_check 
CHECK (status IN ('active', 'completed', 'on_hold'));

-- Update existing projects to have 'active' status
UPDATE projects 
SET status = 'active' 
WHERE status IS NULL;`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
