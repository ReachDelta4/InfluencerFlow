import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import ReactFlow, {
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  RefreshCw, 
  Save, 
  Play, 
  Search, 
  Maximize, 
  Minimize, 
  ZoomIn,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { WorkflowNode } from "@/components/workflow/WorkflowNode";
import { SidePanel } from "@/components/workflow/SidePanel";
import { NodeConfig } from "@/components/workflow/NodeConfig";
import { SteelBrowserPanel } from "@/components/workflow/SteelBrowserPanel";
import { ToolbarPanel } from "@/components/workflow/ToolbarPanel";
import { executeSteelAction, getSteelStatus } from "@/lib/steelBrowser";

// Define node types
const nodeTypes = {
  customNode: WorkflowNode,
};

export default function CampaignBuilder() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [campaignName, setCampaignName] = useState("New Campaign");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [steelPanelOpen, setSteelPanelOpen] = useState(false);
  const [steelStatus, setSteelStatus] = useState({ running: false, status: 'unknown' });
  const [zoom, setZoom] = useState(100);
  
  // Fetch campaign if id is provided
  const { data: campaign, isLoading } = useQuery({
    queryKey: ['/api/campaigns', id],
    enabled: !!id,
  });

  // Check Steel Browser status
  useEffect(() => {
    getSteelStatus()
      .then(status => setSteelStatus(status))
      .catch(error => {
        console.error("Failed to get Steel status:", error);
        setSteelStatus({ running: false, status: 'error' });
      });
  }, []);

  // Initialize campaign data if editing existing campaign
  useEffect(() => {
    if (campaign) {
      setCampaignName(campaign.name);
      if (campaign.workflow?.nodes) {
        setNodes(campaign.workflow.nodes);
      }
      if (campaign.workflow?.edges) {
        setEdges(campaign.workflow.edges);
      }
    }
  }, [campaign]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  // Generate initial demo node if no nodes exist
  useEffect(() => {
    if (!isLoading && nodes.length === 0 && !id) {
      const initialNode = {
        id: '1',
        type: 'customNode',
        position: { x: 100, y: 100 },
        data: { 
          label: 'LinkedIn',
          type: 'linkedin',
          nodeColor: '#0A66C2',
          icon: 'linkedin',
          fields: {
            query: 'Marketing Directors',
            filters: ['Location: United States', 'Industry: Technology']
          }
        }
      };
      
      setNodes([initialNode]);
    }
  }, [isLoading, nodes.length, id, setNodes]);

  const handleSave = async () => {
    try {
      const workflowData = {
        nodes,
        edges,
      };
      
      const payload = {
        name: campaignName,
        workflow: workflowData,
        status: 'draft',
      };
      
      if (id) {
        await apiRequest("PUT", `/api/campaigns/${id}`, payload);
        toast({
          title: "Campaign updated",
          description: "Your campaign has been updated successfully",
        });
      } else {
        const response = await apiRequest("POST", "/api/campaigns", payload);
        const data = await response.json();
        toast({
          title: "Campaign created",
          description: "Your campaign has been saved successfully",
        });
        navigate(`/campaigns/builder/${data.id}`);
      }
      
      // Invalidate campaigns query
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save campaign",
        variant: "destructive",
      });
    }
  };

  const handleRunCampaign = async () => {
    try {
      if (!id) {
        toast({
          title: "Save required",
          description: "Please save your campaign before running it",
        });
        return;
      }
      
      setSteelPanelOpen(true);
      
      // Test action for demo
      const result = await executeSteelAction(parseInt(id), {
        action: 'navigate',
        platform: 'linkedin',
        params: {
          url: 'https://www.linkedin.com/search/results/people/'
        }
      });
      
      if (result.success) {
        toast({
          title: "Campaign started",
          description: "Your campaign is now running",
        });
      } else {
        throw new Error(result.message);
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run campaign. Check Steel Browser connection.",
        variant: "destructive",
      });
    }
  };

  if (isLoading && id) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-neutral-200 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Input
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="text-lg font-semibold border-none shadow-none h-auto py-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              {id ? campaign?.status || "Draft" : "Draft"}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setNodes([])}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            
            <Button
              variant="default"
              onClick={handleRunCampaign}
            >
              <Play className="mr-2 h-4 w-4" />
              Run Campaign
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSave}
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
        
        <ToolbarPanel 
          zoom={zoom}
          onZoomChange={setZoom}
        />
      </div>
      
      {/* Workflow Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Controls />
          <Background color="#d1d5db" gap={25} size={1} />
          
          <Panel position="top-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-md px-3 py-1 text-sm text-neutral-500 font-mono">
              {nodes.length} nodes · {edges.length} connections
            </div>
          </Panel>
          
          <SidePanel />
        </ReactFlow>
      </div>
      
      {/* Node Configuration Panel (if a node is selected) */}
      {selectedNode && (
        <NodeConfig
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onUpdate={(updatedData) => {
            setNodes(nodes.map(node => 
              node.id === selectedNode.id 
                ? { ...node, data: { ...node.data, ...updatedData } }
                : node
            ));
          }}
        />
      )}
      
      {/* Steel Browser Panel */}
      <SteelBrowserPanel 
        open={steelPanelOpen}
        onOpenChange={setSteelPanelOpen}
        steelStatus={steelStatus}
      />
    </div>
  );
}
