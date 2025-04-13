import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import LandingNavbar from "@/components/landing/landing-navbar"

export const metadata: Metadata = {
  title: "About | Trust Impact",
  description: "Learn about Trust Impact and our mission to help organizations measure their social impact",
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/impact-hero.jpg"
              alt="Measuring social impact"
              fill
              className="object-cover opacity-80"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-white mb-6">
                We're here to help you <span className="bg-yellow-400 text-black px-2 inline-block">measure</span>
                <br />
                your social impact
              </h1>
              <p className="text-xl text-white/90 max-w-[600px]">
                Trust Impact helps organizations understand, measure, and communicate their social impact effectively.
              </p>
            </div>
          </div>
        </section>

        {/* Our Mission */}
        <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter mb-6">Our Mission</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    At Trust Impact, we believe that every organization creating positive social change should be able
                    to measure and communicate their impact effectively.
                  </p>
                  <p>
                    Our mission is to democratize impact measurement by providing accessible tools and expertise that
                    empower organizations of all sizes to understand their social impact.
                  </p>
                  <p>
                    We combine academic rigor with practical experience to create solutions that are both robust and
                    usable in real-world contexts.
                  </p>
                </div>
              </div>
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <Image src="/mission-image.jpg" alt="Trust Impact team collaborating" fill className="object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* Our Approach */}
        <section className="w-full py-12 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter mb-12 text-center">Our Approach</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Diagnose</h3>
                <p className="text-gray-600">
                  We start by understanding your current impact measurement capabilities through our comprehensive
                  diagnostic assessment.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Design</h3>
                <p className="text-gray-600">
                  Based on the diagnostic results, we design a tailored impact measurement framework that aligns with
                  your organization's goals and capacity.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Deliver</h3>
                <p className="text-gray-600">
                  We help you implement the framework, collect and analyze data, and communicate your impact to key
                  stakeholders.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter mb-6">Our Team</h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl">
              Our team combines academic expertise with practical experience in impact measurement across various
              sectors.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 relative">
                  <Image src="/team-member-1.jpg" alt="Dr. Sarah Johnson" fill className="object-cover" />
                </div>
                <h3 className="text-xl font-bold">Dr. Sarah Johnson</h3>
                <p className="text-primary font-medium mb-2">Founder & CEO</p>
                <p className="text-gray-600">
                  With over 15 years of experience in impact measurement, Sarah leads our methodology development and
                  strategic direction.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 relative">
                  <Image src="/team-member-2.jpg" alt="Michael Chen" fill className="object-cover" />
                </div>
                <h3 className="text-xl font-bold">Michael Chen</h3>
                <p className="text-primary font-medium mb-2">Research Director</p>
                <p className="text-gray-600">
                  Michael brings academic rigor to our work, ensuring our methodologies are grounded in the latest
                  research and best practices.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 relative">
                  <Image src="/team-member-3.jpg" alt="Priya Patel" fill className="object-cover" />
                </div>
                <h3 className="text-xl font-bold">Priya Patel</h3>
                <p className="text-primary font-medium mb-2">Implementation Lead</p>
                <p className="text-gray-600">
                  Priya specializes in helping organizations implement effective impact data systems and processes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="w-full py-12 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter mb-12 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Accessibility</h3>
                  <p className="text-gray-600">
                    We believe impact measurement should be accessible to all organizations, regardless of size or
                    resources.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Rigor</h3>
                  <p className="text-gray-600">
                    We maintain high standards of methodological rigor while ensuring our approaches are practical and
                    usable.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Collaboration</h3>
                  <p className="text-gray-600">
                    We work closely with our clients, recognizing that they are the experts in their own work.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Continuous Learning</h3>
                  <p className="text-gray-600">
                    We constantly refine our approaches based on new research, feedback, and evolving best practices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 bg-black text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to measure your impact?
              </h2>
              <p className="mx-auto max-w-[700px] md:text-xl">
                Start with our Impact Diagnostic Assessment to understand your current capabilities and get actionable
                recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button asChild size="lg" className="h-12 px-8 bg-yellow-400 text-black hover:bg-yellow-500">
                  <Link href="/register">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 bg-transparent border-white hover:bg-white hover:text-black"
                >
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
