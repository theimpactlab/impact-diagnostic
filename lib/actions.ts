"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

type RegisterUserData = {
  name: string
  email: string
  organization: string
  role: string
  reason?: string
}

export async function registerUser(data: RegisterUserData) {
  try {
    // Send notification email to admin
    const { error } = await resend.emails.send({
      from: "Impact Diagnostic <noreply@yourdomain.com>",
      to: "admin@trustimpact.com",
      subject: "New User Registration Request",
      html: `
        <h1>New User Registration</h1>
        <p>A new user has registered for the Impact Diagnostic Assessment:</p>
        <ul>
          <li><strong>Name:</strong> ${data.name}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>Organization:</strong> ${data.organization}</li>
          <li><strong>Role:</strong> ${data.role}</li>
          ${data.reason ? `<li><strong>Reason:</strong> ${data.reason}</li>` : ""}
        </ul>
        <p>Please review this request and approve or deny access as appropriate.</p>
      `,
    })

    if (error) {
      console.error("Error sending email:", error)
      return {
        success: false,
        message: "Failed to send notification email",
      }
    }

    // Here you would typically also save the user to your database
    // For example: await db.user.create({ data })

    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      message: "An error occurred during registration",
    }
  }
}
