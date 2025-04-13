import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { features } from "@/lib/landing-data"
import FeatureCard from "@/components/landing/feature-card"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/impact-hero.jpg"
            alt="Impact Assessment Hero"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Measure Your Social Impact</h1>
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
              Our diagnostic tool helps organizations assess, track, and improve their social impact measurement
              capabilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link href="/features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Impact Assessment</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our diagnostic tool evaluates your organization across seven key domains of impact measurement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg mb-6">
                We believe that effective impact measurement is essential for organizations to maximize their social and
                environmental impact. Our diagnostic tool is designed to help organizations of all sizes assess their
                current capabilities and develop a roadmap for improvement.
              </p>
              <p className="text-lg mb-6">
                By providing a structured framework and actionable insights, we empower organizations to make
                data-driven decisions and demonstrate their impact to stakeholders.
              </p>
              <Button asChild size="lg">
                <Link href="/register">Join Us Today</Link>
              </Button>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image src="/mission-image.jpg" alt="Our Mission" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Image
                src="/trust-impact-logo.png"
                alt="Trust Impact Logo"
                width={180}
                height={60}
                className="h-12 w-auto"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                © {new Date().getFullYear()} Trust Impact. All rights reserved.
              </p>
            </div>
            <div className="flex gap-8">
              <Link href="/features" className="text-sm hover:underline">
                Features
              </Link>
              <Link href="/login" className="text-sm hover:underline">
                Login
              </Link>
              <Link href="/register" className="text-sm hover:underline">
                Register
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
