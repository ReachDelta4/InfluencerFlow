import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BarChart3, Users, Zap, Plus, PieChart, LineChart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Campaign } from "@/lib/workflowTypes";

export default function Dashboard() {
  const { data: campaigns, isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns'],
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/campaigns/builder">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Campaign
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Campaigns</CardDescription>
            <CardTitle className="text-2xl">
              {campaignsLoading ? "..." : campaigns?.filter(c => c.status === "active").length || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {campaignsLoading ? "" : 
                campaigns?.filter(c => c.status === "active").length ? 
                  "Currently running" : "No active campaigns"}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Leads</CardDescription>
            <CardTitle className="text-2xl">238</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              +18 this week
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Messages Sent</CardDescription>
            <CardTitle className="text-2xl">512</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              98.2% delivery rate
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Response Rate</CardDescription>
            <CardTitle className="text-2xl">24%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              +2.3% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Campaigns</CardTitle>
              <Link href="/campaigns">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {campaignsLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns && campaigns.length > 0 ? (
                  campaigns.slice(0, 5).map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(campaign.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                          campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-neutral-100 text-neutral-800'
                        }`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No campaigns yet</p>
                    <Link href="/campaigns/builder">
                      <Button className="mt-4" variant="outline">
                        <Plus className="mr-2 h-4 w-4" /> Create your first campaign
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Engagements by Platform</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-72">
            <div className="text-center flex items-center justify-center flex-col">
              <PieChart className="h-16 w-16 text-muted-foreground mb-2" strokeWidth={1} />
              <p className="text-muted-foreground">Analytics charts will appear here when you have more data</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engagement Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <div className="text-center flex items-center justify-center flex-col">
            <LineChart className="h-16 w-16 text-muted-foreground mb-2" strokeWidth={1} />
            <p className="text-muted-foreground">Activity visualization will appear here as you run campaigns</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary-50 border-primary-100">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Zap className="h-10 w-10 text-primary flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-primary-900">Steel Browser Status</h3>
              <p className="text-primary-700 mt-1">
                Steel Browser is running locally on your machine. All automations will use your local browser instance.
              </p>
              <div className="mt-4">
                <Button variant="outline" className="bg-white border-primary-200 text-primary-700 hover:bg-primary-100">
                  Check Connection
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
