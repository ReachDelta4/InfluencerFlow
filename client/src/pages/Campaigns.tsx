import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Campaign } from "@/lib/workflowTypes";
import { Button } from "@/components/ui/button";
import { Plus, Play, Pause, Trash2, Edit, Copy, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Campaigns() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: campaigns, isLoading, refetch } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns'],
  });

  const filteredCampaigns = campaigns?.filter(campaign => {
    if (activeTab === "all") return true;
    return campaign.status === activeTab;
  });

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await apiRequest("PUT", `/api/campaigns/${id}`, { status });
      refetch();
      toast({
        title: "Campaign updated",
        description: `Campaign status changed to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update campaign status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/campaigns/${id}`);
      refetch();
      toast({
        title: "Campaign deleted",
        description: "Campaign has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case "paused":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Paused</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>;
      default:
        return <Badge variant="outline" className="bg-neutral-100 text-neutral-800">Draft</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Link href="/campaigns/builder">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Campaign
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Campaigns</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>
                {activeTab === "all" 
                  ? "All Campaigns" 
                  : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Campaigns`}
              </CardTitle>
              <CardDescription>
                {isLoading 
                  ? "Loading campaigns..." 
                  : filteredCampaigns?.length 
                    ? `Showing ${filteredCampaigns.length} campaign${filteredCampaigns.length > 1 ? 's' : ''}` 
                    : "No campaigns found"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredCampaigns && filteredCampaigns.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCampaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">
                          <Link href={`/campaigns/builder/${campaign.id}`}>
                            <span className="text-primary hover:underline cursor-pointer">
                              {campaign.name}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                        <TableCell>{new Date(campaign.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(campaign.updatedAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            {campaign.status === "active" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(campaign.id, "paused")}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(campaign.id, "active")}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            <Link href={`/campaigns/builder/${campaign.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => alert("Duplicate feature coming soon")}>
                                  <Copy className="h-4 w-4 mr-2" /> Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDelete(campaign.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <p className="text-neutral-500">No campaigns found</p>
                  <Link href="/campaigns/builder">
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" /> Create Campaign
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
