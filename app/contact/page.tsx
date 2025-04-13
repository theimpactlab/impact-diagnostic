import type { Metadata } from "next"
import { Mail, MapPin, Phone } from "lucide-react"
import LandingNavbar from "@/components/landing/landing-navbar"
import ContactForm from "@/components/landing/contact-form"

export const metadata: Metadata = {
  title: "Contact | Impact Diagnostic Assessment",
  description: "Contact us about the Impact Diagnostic Assessment tool",
}

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Contact Us</h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl mt-4">
                  Have questions about the Impact Diagnostic Assessment? We're here to help.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form and Info */}
        <section className="w-full py-12 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                <ContactForm />
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium">Address</h3>
                      <p className="text-gray-500">
                        123 Impact Street
                        <br />
                        London, EC1A 1BB
                        <br />
                        United Kingdom
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Mail className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-gray-500">
                        <a href="mailto:info@impactdiagnostic.com" className="hover:text-primary">
                          info@impactdiagnostic.com
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Phone className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium">Phone</h3>
                      <p className="text-gray-500">
                        <a href="tel:+442071234567" className="hover:text-primary">
                          +44 20 7123 4567
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-12">
                  <h3 className="text-xl font-bold mb-4">Office Hours</h3>
                  <p className="text-gray-500 mb-2">Monday - Friday: 9:00 AM - 5:00 PM</p>
                  <p className="text-gray-500">Saturday - Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Frequently Asked Questions</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">Find quick answers to common questions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  question: "How quickly will you respond to my inquiry?",
                  answer: "We aim to respond to all inquiries within 24 business hours.",
                },
                {
                  question: "Can I schedule a demo of the platform?",
                  answer: "Yes, you can request a demo through our contact form or by emailing us directly.",
                },
                {
                  question: "Do you offer custom solutions for large organizations?",
                  answer:
                    "Yes, we offer tailored solutions for enterprise clients. Please contact our sales team for details.",
                },
                {
                  question: "How can I get technical support?",
                  answer:
                    "Technical support is available through our help center or by contacting our support team via email.",
                },
              ].map((faq) => (
                <div key={faq.question} className="text-left">
                  <h3 className="font-medium text-lg mb-2">{faq.question}</h3>
                  <p className="text-gray-500">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
