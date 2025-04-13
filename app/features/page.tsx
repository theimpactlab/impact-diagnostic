import type { Metadata } from "next"
import { CheckCircle } from "lucide-react"
import LandingNavbar from "@/components/landing/landing-navbar"
import { features } from "@/lib/landing-data"
import FeatureCard from "@/components/landing/feature-card"

export const metadata: Metadata = {
  title: "Features | Impact Diagnostic Assessment",
  description: "Explore the features of the Impact Diagnostic Assessment tool",
}

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
                  Comprehensive Impact Assessment Features
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl mt-4">
                  Our diagnostic tool provides everything you need to understand, measure, and improve your
                  organization's social impact.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full py-12 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Assessment Domains */}
        <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Seven Key Assessment Domains</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Our comprehensive assessment covers all aspects of impact measurement
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {[
                "Purpose Alignment",
                "Purpose Statement",
                "Leadership for Impact",
                "Theory of Change",
                "Impact Measurement Framework",
                "Status of Data",
                "Systems Capabilities",
              ].map((domain) => (
                <div key={domain} className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">{domain}</h3>
                    <p className="text-gray-500 text-sm">
                      Comprehensive assessment of your organization's capabilities
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Features */}
        <section className="w-full py-12 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Detailed Features</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Everything you need to measure and improve your social impact
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {[
                {
                  title: "Interactive Assessment",
                  description: "User-friendly questionnaires with guidance for each question",
                },
                {
                  title: "Visual Results",
                  description: "Intuitive charts and graphs to visualize your assessment results",
                },
                {
                  title: "Collaborative Projects",
                  description: "Invite team members to contribute to assessments",
                },
                {
                  title: "Progress Tracking",
                  description: "Monitor improvements over time with comparative analysis",
                },
                {
                  title: "Downloadable Reports",
                  description: "Export your results in various formats for presentations and reporting",
                },
                {
                  title: "Actionable Recommendations",
                  description: "Receive tailored suggestions to improve your impact measurement",
                },
                {
                  title: "Secure Data Storage",
                  description: "Your assessment data is securely stored and protected",
                },
                {
                  title: "Expert Support",
                  description: "Access to impact measurement experts for guidance",
                },
              ].map((feature) => (
                <div key={feature.title} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
