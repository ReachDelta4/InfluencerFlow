import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Handle, Position } from 'reactflow';
import { Database } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LeadList {
  id: number;
  name: string;
  count: number;
}

export function DataSourceNode({ data, isConnectable }: any) {
  const [selectedList, setSelectedList] = useState<string>(data?.selectedListId || '');
  
  // Fetch all lead lists
  const { data: leadLists, isLoading } = useQuery<LeadList[]>({
    queryKey: ['/api/lead-lists'],
  });

  // Update the parent flow when selection changes
  useEffect(() => {
    if (data.onDataChange && selectedList) {
      data.onDataChange({
        selectedListId: selectedList,
        selectedListName: leadLists?.find(list => list.id.toString() === selectedList)?.name || ''
      });
    }
  }, [selectedList, leadLists, data.onDataChange]);

  return (
    <div className="bg-white shadow-md rounded-md p-3 border-2 border-primary/30 min-w-[250px]">
      <div className="flex items-center mb-3">
        <div className="bg-primary/10 p-2 rounded-md">
          <Database className="h-5 w-5 text-primary" />
        </div>
        <div className="ml-2">
          <h3 className="text-sm font-medium">Data Source</h3>
          <p className="text-xs text-neutral-500">Starting point</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div>
          <Label htmlFor="lead-list">Lead List</Label>
          <Select 
            disabled={isLoading} 
            value={selectedList}
            onValueChange={setSelectedList}
          >
            <SelectTrigger id="lead-list" className="w-full">
              <SelectValue placeholder="Select lead list" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : leadLists && leadLists.length > 0 ? (
                leadLists.map(list => (
                  <SelectItem key={list.id} value={list.id.toString()}>
                    {list.name} ({list.count} leads)
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="empty" disabled>No lead lists available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        {selectedList && leadLists && (
          <div className="text-xs text-neutral-600 bg-primary/5 p-2 rounded-md mt-2">
            {leadLists.find(list => list.id.toString() === selectedList)?.count || 0} leads will be processed
          </div>
        )}
      </div>
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="source"
        style={{ background: '#4f46e5' }}
        isConnectable={isConnectable}
      />
    </div>
  );
}