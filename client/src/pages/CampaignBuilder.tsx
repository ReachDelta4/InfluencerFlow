import { useState, useEffect, useCallback, useMemo } from "react";
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
  RotateCcw,
  Plus
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
import { Campaign, SteelBrowserStatus } from "@/lib/workflowTypes";
import { CampaignTypeDialog, CampaignPlatform } from "@/components/CampaignTypeDialog";

export default function CampaignBuilder() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [campaignName, setCampaignName] = useState("New Campaign");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [steelPanelOpen, setSteelPanelOpen] = useState(false);
  const [steelStatus, setSteelStatus] = useState<Partial<SteelBrowserStatus>>({ running: false, status: 'error' });
  const [zoom, setZoom] = useState(100);
  const [campaignPlatform, setCampaignPlatform] = useState<CampaignPlatform>('linkedin');
  const [showPlatformDialog, setShowPlatformDialog] = useState(false);
  
  // Define node types with useMemo to prevent unnecessary re-renders
  const nodeTypes = useMemo(() => ({
    customNode: WorkflowNode,
  }), []);
  
  // Fetch campaign if id is provided
  const { data: campaign, isLoading } = useQuery<Campaign>({
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

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Show platform dialog if creating a new campaign
  useEffect(() => {
    if (!id && !isLoading) {
      setShowPlatformDialog(true);
    } else if (campaign?.platform) {
      // Set platform based on campaign data if editing
      setCampaignPlatform(campaign.platform as CampaignPlatform);
    }
  }, [id, isLoading, campaign]);
  
  // Handle platform selection from the dialog
  const handlePlatformSelect = (platform: CampaignPlatform) => {
    setCampaignPlatform(platform);
    setShowPlatformDialog(false);
    
    // Generate a suitable starter node based on the platform
    const getInitialNodeProps = () => {
      switch (platform) {
        case 'linkedin':
          return {
            label: 'LinkedIn Search',
            type: 'linkedin',
            nodeColor: '#0A66C2'
          };
        case 'instagram':
          return {
            label: 'Instagram Profile',
            type: 'instagram',
            nodeColor: '#E4405F'
          };
        case 'twitter':
          return {
            label: 'Twitter Search',
            type: 'twitter',
            nodeColor: '#000000'
          };
        default:
          return {
            label: 'Node',
            type: 'node',
            nodeColor: '#6B7280'
          };
      }
    };
    
    const nodeProps = getInitialNodeProps();
    
    // Create an initial starter node
    const initialNode = {
      id: `${platform}_${Date.now()}`,
      type: 'customNode',
      position: { x: 100, y: 100 },
      data: { 
        label: nodeProps.label,
        type: nodeProps.type,
        nodeColor: nodeProps.nodeColor,
        platform: platform
      }
    };
    
    setNodes([initialNode]);
    
    // Set campaign name based on platform
    setCampaignName(`New ${nodeProps.label} Campaign`);
  };

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
        platform: campaignPlatform, // Include the campaign platform
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
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
          }}
          onDrop={(event) => {
            event.preventDefault();
            
            const reactFlowBounds = event.currentTarget.getBoundingClientRect();
            const type = event.dataTransfer.getData('application/reactflow');
            const nodeColor = event.dataTransfer.getData('nodeColor');
            
            // Check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
              return;
            }
            
            const position = {
              x: event.clientX - reactFlowBounds.left,
              y: event.clientY - reactFlowBounds.top
            };
            
            const newNode = {
              id: `${type}_${Date.now()}`,
              type: 'customNode',
              position,
              data: { 
                label: type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' '),
                type: type,
                nodeColor: nodeColor,
              },
            };
            
            setNodes((nds) => [...nds, newNode]);
          }}
        >
          <Controls />
          <Background color="#d1d5db" gap={25} size={1} />
          
          <Panel position="top-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-md px-3 py-1 text-sm text-neutral-500 font-mono">
              {nodes.length} nodes · {edges.length} connections
            </div>
          </Panel>
          
          <SidePanel campaignPlatform={campaignPlatform} />
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
      
      {/* Campaign Platform Selection Dialog */}
      <CampaignTypeDialog 
        open={showPlatformDialog}
        onOpenChange={setShowPlatformDialog}
        onSelect={handlePlatformSelect}
      />
    </div>
  );
}
