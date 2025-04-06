import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from '@/components/ui/badge';
import { Settings, Grip, MessagesSquare, Clock, ThumbsUp, Filter } from 'lucide-react';
import { SiLinkedin, SiInstagram, SiX } from 'react-icons/si';

// Icon mapping for different node types
const getNodeIcon = (type: string) => {
  switch (type) {
    case 'linkedin':
      return <SiLinkedin className="h-5 w-5" />;
    case 'instagram':
      return <SiInstagram className="h-5 w-5" />;
    case 'twitter':
      return <SiX className="h-5 w-5" />;
    case 'send-dm':
      return <MessagesSquare className="h-5 w-5" />;
    case 'wait':
      return <Clock className="h-5 w-5" />;
    case 'like-post':
      return <ThumbsUp className="h-5 w-5" />;
    case 'condition':
      return <Filter className="h-5 w-5" />;
    case 'google-sheets':
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.318 12.545H7.91v-1.909h3.41v1.91zm4.25 0h-3.41v-1.909h3.41v1.91zm-4.25 3.864H7.91v-1.909h3.41v1.91zm4.25 0h-3.41v-1.909h3.41v1.91zm4.25-9.205v12.818c0 .93-.754 1.682-1.682 1.682H5.864c-.928 0-1.682-.752-1.682-1.682V7.204c0-.93.754-1.682 1.682-1.682h12.272c.928 0 1.682.753 1.682 1.682zm-1.682 0H5.863v12.818h12.273V7.204zM11.318 8.59H7.91V6.682h3.41V8.59zm4.25 0h-3.41V6.682h3.41V8.59z"/>
        </svg>
      );
    default:
      return <div className="h-5 w-5" />;
  }
};

export const WorkflowNode = memo(({ data, isConnectable }: NodeProps) => {
  const { label, type, nodeColor = '#3B82F6', fields = {} } = data;
  
  // Render different node content based on type
  const renderNodeContent = () => {
    switch (type) {
      case 'linkedin':
      case 'instagram':
      case 'twitter':
        return (
          <>
            {fields.query && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Profile Search</label>
                <input 
                  type="text" 
                  className="block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 text-sm"
                  value={fields.query}
                  readOnly
                />
              </div>
            )}
            {fields.filters && fields.filters.length > 0 && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Filters</label>
                <div className="flex flex-wrap gap-2">
                  {fields.filters.map((filter: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-neutral-100">
                      {filter}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        );
      
      case 'send-dm':
        return (
          <>
            {fields.message && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Message Template</label>
                <textarea 
                  className="block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 text-sm"
                  rows={3}
                  value={fields.message}
                  readOnly
                />
              </div>
            )}
            <div className="text-xs text-neutral-500 flex items-center">
              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Variables like {'{{first_name}}'} will be replaced with lead data
            </div>
          </>
        );
      
      case 'wait':
        return (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Wait Duration</label>
              <div className="flex space-x-2">
                <input 
                  type="number" 
                  className="block w-16 border border-neutral-300 rounded-md shadow-sm py-2 px-3 text-sm"
                  value={fields.duration || 3}
                  readOnly
                />
                <select 
                  className="block border border-neutral-300 rounded-md shadow-sm py-2 px-3 text-sm"
                  defaultValue={fields.unit || "days"}
                >
                  <option>Minutes</option>
                  <option>Hours</option>
                  <option>Days</option>
                  <option>Weeks</option>
                </select>
              </div>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                checked={fields.randomize}
                readOnly
              />
              <label className="ml-2 block text-sm text-neutral-700">Add random variation (±20%)</label>
            </div>
          </>
        );
      
      case 'condition':
        return (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium text-neutral-700 mb-1">If</label>
              <select 
                className="block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 text-sm"
                defaultValue={fields.condition || "not-replied"}
              >
                <option value="not-replied">Message not replied to</option>
                <option value="viewed">Profile viewed message</option>
                <option value="connection-accepted">Connection accepted</option>
                <option value="message-received">Message received</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Within</label>
              <div className="flex space-x-2">
                <input 
                  type="number" 
                  className="block w-16 border border-neutral-300 rounded-md shadow-sm py-2 px-3 text-sm"
                  value={fields.withinDuration || 2}
                  readOnly
                />
                <select 
                  className="block border border-neutral-300 rounded-md shadow-sm py-2 px-3 text-sm"
                  defaultValue={fields.withinUnit || "days"}
                >
                  <option>Hours</option>
                  <option>Days</option>
                  <option>Weeks</option>
                </select>
              </div>
            </div>
            <div className="flex justify-between px-10 pb-3">
              <div className="text-xs text-neutral-500">Yes</div>
              <div className="text-xs text-neutral-500">No</div>
            </div>
          </>
        );
      
      case 'google-sheets':
        return (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Sheet ID</label>
              <input 
                type="text" 
                className="block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 text-sm"
                value={fields.sheetId || ""}
                placeholder="Google Sheet ID"
                readOnly
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Sheet Range</label>
              <input 
                type="text" 
                className="block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 text-sm"
                value={fields.sheetRange || "Leads!A2:G"}
                placeholder="Sheet range"
                readOnly
              />
            </div>
            <div className="flex items-center mt-2">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center">
                <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Connected
              </Badge>
            </div>
          </>
        );
      
      default:
        return <div className="p-4 text-sm">Configure this node</div>;
    }
  };

  return (
    <div className="workflow-node min-w-[180px] max-w-[250px] bg-white border border-neutral-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Header */}
      <div 
        className="px-4 py-2 text-white flex items-center justify-between drag-handle"
        style={{ backgroundColor: nodeColor }}
      >
        <div className="flex items-center">
          {getNodeIcon(type)}
          <span className="ml-2">{label}</span>
        </div>
        <div className="flex items-center space-x-1">
          <button 
            className="p-1 rounded hover:bg-opacity-20 hover:bg-black"
            style={{ color: 'white' }}
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {renderNodeContent()}
      </div>
      
      {/* Connection points */}
      {type === 'condition' ? (
        <>
          <Handle
            type="target"
            position={Position.Top}
            style={{ background: '#6B7280', width: '10px', height: '10px' }}
            isConnectable={isConnectable}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            style={{ background: '#6B7280', width: '10px', height: '10px', left: '30%' }}
            isConnectable={isConnectable}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            style={{ background: '#6B7280', width: '10px', height: '10px', left: '70%' }}
            isConnectable={isConnectable}
          />
        </>
      ) : (
        <>
          <Handle
            type="target"
            position={Position.Top}
            style={{ background: '#6B7280', width: '10px', height: '10px' }}
            isConnectable={isConnectable}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            style={{ background: '#6B7280', width: '10px', height: '10px' }}
            isConnectable={isConnectable}
          />
        </>
      )}
    </div>
  );
});

WorkflowNode.displayName = 'WorkflowNode';
