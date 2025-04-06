import { useState } from 'react';
import { Search, Maximize, Minimize, ZoomIn, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface ToolbarPanelProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export function ToolbarPanel({ zoom, onZoomChange }: ToolbarPanelProps) {
  const [lastSaved, setLastSaved] = useState('5 minutes ago');

  const handleZoomChange = (value: string) => {
    onZoomChange(parseInt(value));
  };

  return (
    <div className="px-4 py-2 sm:px-6 lg:px-8 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Search className="h-4 w-4" />
          </Button>
          <span className="ml-2 text-sm text-neutral-500">Zoom:</span>
          <Select
            value={zoom.toString()}
            onValueChange={handleZoomChange}
          >
            <SelectTrigger className="ml-1 h-8 w-24">
              <SelectValue placeholder="100%" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25%</SelectItem>
              <SelectItem value="50">50%</SelectItem>
              <SelectItem value="75">75%</SelectItem>
              <SelectItem value="100">100%</SelectItem>
              <SelectItem value="125">125%</SelectItem>
              <SelectItem value="150">150%</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="border-l border-neutral-300 h-6"></div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Maximize className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center">
        <span className="text-sm text-neutral-500">Last saved: {lastSaved}</span>
      </div>
    </div>
  );
}
