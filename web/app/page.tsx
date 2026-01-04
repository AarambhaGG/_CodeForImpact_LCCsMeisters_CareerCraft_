import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Zap,
  Target,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Users,
  Award,
  Clock
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/ToggleButton"

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50/30 to-slate-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 sm:px-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {/* <div className="relative">
            <Target
              className="h-8 w-8 text-purple-600 dark:text-purple-400"
              fill="currentColor"
            />
            <div className="absolute inset-0 blur-lg bg-purple-600/20 dark:bg-purple-400/20"></div>
          </div> */}
          <Image
            src="/logo.png"
            alt="CareerCraft Logo"
            width={102}
            height={102}
          />
        </div>
        <div className="flex gap-3 items-center">
          <ModeToggle />
          <Link href="/login">
            <Button variant="ghost" className="dark:text-slate-200">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30">
              Sign Up Free
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 sm:px-12 sm:py-32 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 dark:bg-pink-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <Badge className="mb-6 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-200 dark:hover:bg-purple-900">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Career Intelligence
          </Badge>

          <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 leading-tight">
            <span className="text-slate-900 dark:text-white">
              Know Your Gap.
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400 animate-gradient bg-size-[200%_auto]">
              Close Your Gap.
            </span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            CareerCraft analyzes the gap between your current skills and your
            dream job. Get AI-powered insights telling you exactly what skills
            you're missing and receive a personalized week-by-week roadmap to
            bridge those gaps and land the job.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl shadow-purple-500/30 dark:shadow-purple-500/20 text-lg h-12"
              >
                Start Free Analysis <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link href="#features">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/50 text-lg h-12"
              >
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { label: "Active Users", value: "10K+", icon: Users },
              { label: "Skills Analyzed", value: "500K+", icon: BarChart3 },
              { label: "Success Rate", value: "94%", icon: TrendingUp },
              { label: "Avg. Time Saved", value: "40hrs", icon: Clock },
            ].map((stat) => (
              <Card
                key={stat.label}
                className="border-purple-100 dark:border-purple-900/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur"
              >
                <CardContent className="p-6 text-center">
                  <stat.icon className="h-6 w-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="px-6 py-20 sm:px-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
              Features
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Comprehensive tools designed to transform your career journey with
              data-driven insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10" />}
              badge="Most Popular"
              title="Skill Gap Analysis"
              description="Upload your resume or profile and get AI analysis of your current skills, experience, and education. See exactly what you have and where you stand."
              features={[
                "Resume/Profile extraction",
                "Skill categorization",
                "Experience evaluation",
              ]}
            />

            <FeatureCard
              icon={<Target className="h-10 w-10" />}
              badge="New"
              title="Dream Job Matching"
              description="Tell us your dream job or paste a job posting. Our AI analyzes requirements and tells you instantly if you're a FIT or UNFIT for the role."
              features={[
                "FIT/UNFIT assessment",
                "Gap identification",
                "Match percentage",
              ]}
            />

            <FeatureCard
              icon={<BookOpen className="h-10 w-10" />}
              title="Personalized Roadmaps"
              description="Get a custom week-by-week learning plan tailored to bridge your skill gaps and transform you into a job-ready candidate."
              features={[
                "Weekly milestones",
                "Resource curation",
                "Progress tracking",
              ]}
            />

            <FeatureCard
              icon={<Award className="h-10 w-10" />}
              title="Job Readiness Score"
              description="Understand your current position with a comprehensive analysis of strengths, critical gaps, and a clear path to job-ready status."
              features={[
                "Detailed feedback",
                "Transferable skills",
                "Action priorities",
              ]}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 sm:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
              How It Works
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Your Path to Success in 3 Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload Your Profile",
                description:
                  "Share your resume, profile info, or describe your background. Our AI extracts and analyzes your skills in seconds.",
                icon: Users,
              },
              {
                step: "02",
                title: "Define Your Dream Job",
                description:
                  "Tell us about your ideal role or paste a job posting. We analyze requirements and compare against your profile.",
                icon: Target,
              },
              {
                step: "03",
                title: "Get Your Roadmap",
                description:
                  "Receive a FIT/UNFIT assessment and a personalized week-by-week roadmap to bridge your skill gaps.",
                icon: TrendingUp,
              },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <Card className="border-purple-100 dark:border-purple-900/50 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 text-white shadow-lg">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <span className="text-5xl font-bold text-purple-100 dark:text-purple-950">
                        {item.step}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <CardDescription className="text-base">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-8 w-8 text-purple-300 dark:text-purple-800" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 sm:px-12">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 bg-linear-to-br from-purple-600 via-pink-600 to-purple-700 text-white shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <CardContent className="p-12 sm:p-16 text-center relative z-10">
              <Sparkles className="h-12 w-12 mx-auto mb-6 animate-pulse" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Know Your Gap. Close Your Gap.
              </h2>
              <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
                Stop guessing if you're job-ready. Let CareerCraft analyze your
                gap and create your personalized roadmap. Start your free
                analysis today and take control of your career.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-slate-100 shadow-xl text-lg h-12"
                  >
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    className="border-2 border-white text-black dark:text-white hover:bg-white/10 text-lg h-12"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-purple-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>No credit card required</span>
                </div>
                <Separator orientation="vertical" className="h-4 bg-white/30" />
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Free forever plan</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 sm:px-12 bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target
              className="h-6 w-6 text-purple-600 dark:text-purple-400"
              fill="currentColor"
            />
            <span className="text-xl font-bold bg-linear-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              CareerCraft
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            AI Career Gap Analyzer - Know Your Gap. Close Your Gap.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            © 2025 CareerCraft. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, badge, title, description, features }: {
  icon: React.ReactNode
  badge?: string
  title: string
  description: string
  features: string[]
}) {
  return (
    <Card className="border-purple-100 dark:border-purple-900/50 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:shadow-xl group bg-white/50 dark:bg-slate-900/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 text-white shadow-lg group-hover:scale-110 transition-transform">
            {icon}
          </div>
          {badge && (
            <Badge className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
              {badge}
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl mb-2">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
