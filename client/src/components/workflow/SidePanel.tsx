import { useState } from 'react';
import { useReactFlow, Panel, XYPosition } from 'reactflow';
import { SiLinkedin } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import { 
  MessagesSquare, 
  Clock, 
  ThumbsUp, 
  MessagesSquare as Comment, 
  Repeat, 
  Filter,
  Plus
} from 'lucide-react';

const nodeTypes = [
  {
    category: 'Social Platforms',
    items: [
      { id: 'linkedin', label: 'LinkedIn', icon: <SiLinkedin className="h-5 w-5 text-[#0A66C2]" />, color: '#0A66C2' },
    ]
  },
  {
    category: 'Actions',
    items: [
      { id: 'send-dm', label: 'Send DM', icon: <MessagesSquare className="h-5 w-5" />, color: '#3B82F6' },
      { id: 'wait', label: 'Wait', icon: <Clock className="h-5 w-5" />, color: '#6B7280' },
      { id: 'like-post', label: 'Like Post', icon: <ThumbsUp className="h-5 w-5" />, color: '#10B981' },
      { id: 'comment', label: 'Comment', icon: <Comment className="h-5 w-5" />, color: '#8B5CF6' },
      { id: 'follow-up', label: 'Follow-up', icon: <Repeat className="h-5 w-5" />, color: '#F59E0B' },
      { id: 'condition', label: 'Condition', icon: <Filter className="h-5 w-5" />, color: '#6366F1' },
    ]
  },
  {
    category: 'Data Sources',
    items: [
      { 
        id: 'google-sheets', 
        label: 'Google Sheets', 
        icon: (
          <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.318 12.545H7.91v-1.909h3.41v1.91zm4.25 0h-3.41v-1.909h3.41v1.91zm-4.25 3.864H7.91v-1.909h3.41v1.91zm4.25 0h-3.41v-1.909h3.41v1.91zm4.25-9.205v12.818c0 .93-.754 1.682-1.682 1.682H5.864c-.928 0-1.682-.752-1.682-1.682V7.204c0-.93.754-1.682 1.682-1.682h12.272c.928 0 1.682.753 1.682 1.682zm-1.682 0H5.863v12.818h12.273V7.204zM11.318 8.59H7.91V6.682h3.41V8.59zm4.25 0h-3.41V6.682h3.41V8.59z"/>
          </svg>
        ),
        color: '#34A853'
      },
      { 
        id: 'database', 
        label: 'Database', 
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        ),
        color: '#6B7280'
      },
      { 
        id: 'csv', 
        label: 'CSV Import', 
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        color: '#6B7280'
      },
    ]
  }
];

export function SidePanel() {
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const instance = useReactFlow();

  const onDragStart = (event: React.DragEvent, nodeType: string, nodeColor: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('nodeColor', nodeColor);
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

  return (
    <Panel position="top-left" className="ml-4 mt-4 w-64 bg-white rounded-md shadow-md overflow-hidden">
      <div className="p-3 border-b border-neutral-200">
        <h3 className="font-medium text-sm">Node Gallery</h3>
        <p className="text-xs text-neutral-500">Drag and drop nodes to build your workflow</p>
      </div>
      
      <div className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {nodeTypes.map((category) => (
          <div key={category.category} className="mb-4">
            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-2 mb-1">
              {category.category}
            </h4>
            <div className="space-y-1">
              {category.items.map((item) => (
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
        ))}
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
