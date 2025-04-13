import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import LandingNavbar from "@/components/landing/landing-navbar"

export const metadata: Metadata = {
  title: "Pricing | Impact Diagnostic Assessment",
  description: "Pricing plans for the Impact Diagnostic Assessment tool",
}

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Simple, Transparent Pricing</h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl mt-4">
                  Choose the plan that's right for your organization
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="w-full py-12 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Basic Plan */}
              <div className="flex flex-col p-6 bg-white rounded-lg shadow-sm border">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">Basic</h3>
                  <div className="mt-2 text-3xl font-bold">Free</div>
                  <p className="text-sm text-gray-500 mt-1">For small organizations</p>
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>1 project</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Basic assessment</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Results visualization</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>CSV export</span>
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>

              {/* Pro Plan */}
              <div className="flex flex-col p-6 bg-white rounded-lg shadow-sm border border-primary relative">
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-4 py-1 bg-primary text-white text-sm font-medium rounded-full">
                  Most Popular
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium">Professional</h3>
                  <div className="mt-2 text-3xl font-bold">
                    $99<span className="text-lg font-normal text-gray-500">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">For growing organizations</p>
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Unlimited projects</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Full assessment</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Advanced visualizations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Team collaboration (up to 5)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>PDF & CSV exports</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Email support</span>
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/register">Start Free Trial</Link>
                </Button>
              </div>

              {/* Enterprise Plan */}
              <div className="flex flex-col p-6 bg-white rounded-lg shadow-sm border">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">Enterprise</h3>
                  <div className="mt-2 text-3xl font-bold">Custom</div>
                  <p className="text-sm text-gray-500 mt-1">For large organizations</p>
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Everything in Professional</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Unlimited team members</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Dedicated account manager</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Custom reporting</span>
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Frequently Asked Questions</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Find answers to common questions about our pricing and features
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  question: "Can I switch plans later?",
                  answer:
                    "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
                },
                {
                  question: "Is there a free trial?",
                  answer:
                    "Yes, all paid plans come with a 14-day free trial so you can test all features before committing.",
                },
                {
                  question: "What payment methods do you accept?",
                  answer:
                    "We accept all major credit cards, including Visa, Mastercard, and American Express. Enterprise customers can also pay by invoice.",
                },
                {
                  question: "Can I cancel my subscription?",
                  answer:
                    "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.",
                },
                {
                  question: "Do you offer discounts for nonprofits?",
                  answer:
                    "Yes, we offer special pricing for registered nonprofit organizations. Please contact our sales team for details.",
                },
                {
                  question: "What kind of support is included?",
                  answer:
                    "All plans include access to our help center. Professional plans include email support, while Enterprise plans include priority support and a dedicated account manager.",
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
