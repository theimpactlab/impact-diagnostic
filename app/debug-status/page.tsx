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
          <CardDescription>If you need to manually add the missing columns to your projects table</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your projects table is missing the `status` and `updated_at` columns. Run this SQL command in your
              Supabase SQL Editor:
            </p>
            <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
              {`-- Add missing columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add a check constraint to ensure valid status values
ALTER TABLE projects 
ADD CONSTRAINT IF NOT EXISTS projects_status_check 
CHECK (status IN ('active', 'completed', 'on_hold'));

-- Update existing projects to have 'active' status and current timestamp
UPDATE projects 
SET status = 'active', updated_at = NOW()
WHERE status IS NULL OR updated_at IS NULL;

-- Create a trigger to automatically update updated_at when a row is modified
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to the projects table
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
