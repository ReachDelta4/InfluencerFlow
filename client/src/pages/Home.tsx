import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Zap, MessageSquare, MousePointer2 } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Automate Your Social Media Outreach
              </h1>
              <p className="mx-auto max-w-[700px] text-neutral-600 md:text-xl">
                Build powerful automated outreach campaigns for LinkedIn, Instagram, and X with our visual workflow builder.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/campaigns/builder">
                <Button className="h-11 px-8">
                  Create Campaign <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="h-11 px-8">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 lg:py-32 bg-neutral-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Visual Workflow Builder</CardTitle>
                <CardDescription>
                  Create outreach sequences with our intuitive drag-and-drop builder
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Design complex outreach workflows by connecting action blocks like "Send DM," "Wait," and "Follow Up" with conditional logic.</p>
              </CardContent>
              <CardFooter>
                <Link href="/campaigns/builder">
                  <Button variant="ghost" className="gap-1">
                    Try it out <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Smart Personalization</CardTitle>
                <CardDescription>
                  Connect to your lead sources and send personalized messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Import leads from Google Sheets or your internal database and use dynamic variables to personalize each message.</p>
              </CardContent>
              <CardFooter>
                <Link href="/campaigns">
                  <Button variant="ghost" className="gap-1">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <MousePointer2 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Local Browser Automation</CardTitle>
                <CardDescription>
                  Powered by Steel Browser for human-like interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Our app uses Steel Browser to run automations locally on your machine, mimicking human behavior when interacting with social platforms.</p>
              </CardContent>
              <CardFooter>
                <Link href="/settings">
                  <Button variant="ghost" className="gap-1">
                    Configure <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
