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
          <CardDescription>Corrected SQL to add missing columns to your projects table</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your projects table is missing the `status` and `updated_at` columns. Run this corrected SQL command in
              your Supabase SQL Editor:
            </p>
            <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
              {`-- Add missing columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing projects to have 'active' status and current timestamp
UPDATE projects 
SET status = COALESCE(status, 'active'), 
    updated_at = COALESCE(updated_at, NOW());

-- Add a check constraint to ensure valid status values (with proper error handling)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'projects_status_check' 
        AND table_name = 'projects'
    ) THEN
        ALTER TABLE projects 
        ADD CONSTRAINT projects_status_check 
        CHECK (status IN ('active', 'completed', 'on_hold'));
    END IF;
END $$;

-- Create a function to automatically update updated_at when a row is modified
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to the projects table (drop first if exists)
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();`}
            </pre>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h5 className="font-medium text-blue-800">Alternative Simple Approach</h5>
              <p className="text-sm text-blue-700 mt-1">
                If the above doesn't work, you can run these commands one by one:
              </p>
              <pre className="bg-blue-100 p-2 rounded text-xs mt-2 overflow-x-auto">
                {`-- Step 1: Add columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 2: Update existing data
UPDATE projects SET status = 'active' WHERE status IS NULL;
UPDATE projects SET updated_at = NOW() WHERE updated_at IS NULL;

-- Step 3: Add constraint (run only if it doesn't exist)
ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('active', 'completed', 'on_hold'));`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
