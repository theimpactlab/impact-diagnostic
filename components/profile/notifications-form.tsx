"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface NotificationsFormProps {
  userId: string
}

interface NotificationSettings {
  email_project_updates: boolean
  email_assessment_reminders: boolean
  email_new_features: boolean
  browser_notifications: boolean
}

export default function NotificationsForm({ userId }: NotificationsFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    email_project_updates: true,
    email_assessment_reminders: true,
    email_new_features: true,
    browser_notifications: true,
  })

  useEffect(() => {
    async function loadNotificationSettings() {
      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("notification_settings")
          .eq("user_id", userId)
          .single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data?.notification_settings) {
          setSettings(data.notification_settings as NotificationSettings)
        }
      } catch (error) {
        console.error("Error loading notification settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotificationSettings()
  }, [userId])

  async function saveSettings() {
    setIsSaving(true)

    try {
      const { error } = await supabase.from("user_settings").upsert({
        user_id: userId,
        notification_settings: settings,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      })
    } catch (error: any) {
      console.error("Error saving notification settings:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save notification settings.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Manage your notification preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Email Notifications</h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Project Updates</p>
              <p className="text-sm text-muted-foreground">Receive emails about changes to your projects</p>
            </div>
            <Switch
              checked={settings.email_project_updates}
              onCheckedChange={() => handleToggle("email_project_updates")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Assessment Reminders</p>
              <p className="text-sm text-muted-foreground">Receive reminders about incomplete assessments</p>
            </div>
            <Switch
              checked={settings.email_assessment_reminders}
              onCheckedChange={() => handleToggle("email_assessment_reminders")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New Features & Updates</p>
              <p className="text-sm text-muted-foreground">Receive emails about new features and platform updates</p>
            </div>
            <Switch checked={settings.email_new_features} onCheckedChange={() => handleToggle("email_new_features")} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Browser Notifications</h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Browser Notifications</p>
              <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
            </div>
            <Switch
              checked={settings.browser_notifications}
              onCheckedChange={() => handleToggle("browser_notifications")}
            />
          </div>
        </div>

        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  )
}
