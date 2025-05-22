import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import ClientOnly from "@/components/providers/client-only"
import { SessionProvider } from "@/components/providers/session-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Impact Diagnostic Assessment",
    template: "%s | Impact Diagnostic Assessment",
  },
  description: "Measure and improve your organization's social impact",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ClientOnly>
            <SessionProvider>{children}</SessionProvider>
          </ClientOnly>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
