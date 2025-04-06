import { useState } from 'react';
import { useReactFlow, Panel, XYPosition } from 'reactflow';
import { SiLinkedin, SiInstagram, SiX } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import { 
  MessagesSquare, 
  Clock, 
  ThumbsUp, 
  MessagesSquare as Comment, 
  Repeat, 
  Filter,
  UserPlus,
  AlertCircle,
  GitBranch
} from 'lucide-react';
import { CampaignPlatform } from '@/components/CampaignTypeDialog';

// Core nodes that appear in all platforms
const coreNodes = [
  { id: 'condition', label: 'Condition', icon: <Filter className="h-5 w-5" />, color: '#6366F1', platform: 'core' },
  { id: 'if-else', label: 'If Else', icon: <GitBranch className="h-5 w-5" />, color: '#7C3AED', platform: 'core' },
  { id: 'delay', label: 'Delay', icon: <Clock className="h-5 w-5" />, color: '#6B7280', platform: 'core' },
  { id: 'if-replies', label: 'If Lead Replies', icon: <AlertCircle className="h-5 w-5" />, color: '#D97706', platform: 'core' },
];

// LinkedIn specific nodes
const linkedinNodes = [
  { id: 'send-connection', label: 'Send Connection Request', icon: <UserPlus className="h-5 w-5" />, color: '#0A66C2', platform: 'linkedin' },
  { id: 'send-message', label: 'Send Message', icon: <MessagesSquare className="h-5 w-5" />, color: '#0A66C2', platform: 'linkedin' },
  { id: 'like-post', label: 'Like Latest Post', icon: <ThumbsUp className="h-5 w-5" />, color: '#0A66C2', platform: 'linkedin' },
];

// Instagram specific nodes
const instagramNodes = [
  { id: 'send-follow', label: 'Send Follow Request', icon: <UserPlus className="h-5 w-5" />, color: '#E4405F', platform: 'instagram' },
  { id: 'send-dm', label: 'Send DM', icon: <MessagesSquare className="h-5 w-5" />, color: '#E4405F', platform: 'instagram' },
  { id: 'like-post', label: 'Like Latest Post', icon: <ThumbsUp className="h-5 w-5" />, color: '#E4405F', platform: 'instagram' },
];

// Twitter (X) specific nodes
const twitterNodes = [
  { id: 'send-follow', label: 'Send Follow Request', icon: <UserPlus className="h-5 w-5" />, color: '#000000', platform: 'twitter' },
  { id: 'send-dm', label: 'Send DM', icon: <MessagesSquare className="h-5 w-5" />, color: '#000000', platform: 'twitter' },
  { id: 'like-post', label: 'Like Latest Post', icon: <ThumbsUp className="h-5 w-5" />, color: '#000000', platform: 'twitter' },
];

interface SidePanelProps {
  campaignPlatform: CampaignPlatform;
}

export function SidePanel({ campaignPlatform }: SidePanelProps) {
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const instance = useReactFlow();

  const onDragStart = (event: React.DragEvent, nodeType: string, nodeColor: string) => {
    // React Flow expects these to be strings, not objects
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('nodeColor', nodeColor);
    // Required for Firefox
    event.dataTransfer.effectAllowed = 'move';
    setDraggedNode(nodeType);
  };

  const onDragEnd = () => {
    setDraggedNode(null);
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();

    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');
    const nodeColor = event.dataTransfer.getData('nodeColor');
    
    // Check if the dropped element is valid
    if (typeof type === 'undefined' || !type) {
      return;
    }

    const position = instance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    }) as XYPosition;
    
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

    instance.addNodes(newNode);
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  // Select platform-specific nodes
  const getPlatformNodes = () => {
    switch (campaignPlatform) {
      case 'linkedin':
        return linkedinNodes;
      case 'instagram':
        return instagramNodes;
      case 'twitter':
        return twitterNodes;
      default:
        return []; // This should never happen
    }
  };

  // Get platform name for display
  const getPlatformName = () => {
    switch (campaignPlatform) {
      case 'linkedin':
        return 'LinkedIn';
      case 'instagram':
        return 'Instagram';
      case 'twitter':
        return 'X (Twitter)';
      default:
        return '';
    }
  };

  // Get platform color
  const getPlatformColor = () => {
    switch (campaignPlatform) {
      case 'linkedin':
        return '#0A66C2';
      case 'instagram':
        return '#E4405F';
      case 'twitter':
        return '#000000';
      default:
        return '#6B7280';
    }
  };

  const platformNodes = getPlatformNodes();
  const platformName = getPlatformName();
  const platformColor = getPlatformColor();

  return (
    <Panel position="top-left" className="ml-4 mt-4 w-64 bg-white rounded-md shadow-md overflow-hidden">
      <div className="p-3 border-b border-neutral-200">
        <h3 className="font-medium text-sm flex items-center">
          <span className="mr-2" style={{ color: platformColor }}>
            {campaignPlatform === 'linkedin' && <SiLinkedin className="h-4 w-4" />}
            {campaignPlatform === 'instagram' && <SiInstagram className="h-4 w-4" />}
            {campaignPlatform === 'twitter' && <SiX className="h-4 w-4" />}
          </span>
          {platformName} Campaign Builder
        </h3>
        <p className="text-xs text-neutral-500">Drag and drop nodes to build your workflow</p>
      </div>
      
      <div className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Platform Specific Nodes */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-2 mb-1">
            {platformName} Actions
          </h4>
          <div className="space-y-1">
            {platformNodes.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => onDragStart(e, item.id, item.color)}
                onDragEnd={onDragEnd}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-grab
                  ${draggedNode === item.id ? 'bg-neutral-100' : 'hover:bg-neutral-50'}
                  text-neutral-700
                `}
              >
                <span className="mr-3" style={{ color: item.color }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Core Nodes - Always visible */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-2 mb-1">
            Core Actions
          </h4>
          <div className="space-y-1">
            {coreNodes.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => onDragStart(e, item.id, item.color)}
                onDragEnd={onDragEnd}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-grab
                  ${draggedNode === item.id ? 'bg-neutral-100' : 'hover:bg-neutral-50'}
                  text-neutral-700
                `}
              >
                <span className="mr-3" style={{ color: item.color }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-3 border-t border-neutral-200 bg-neutral-50">
        <Button variant="ghost" size="sm" className="w-full text-xs justify-start">
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Custom Node
        </Button>
      </div>
    </Panel>
  );
}
