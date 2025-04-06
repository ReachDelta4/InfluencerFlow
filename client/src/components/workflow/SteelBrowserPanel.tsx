import { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SteelBrowserStatus } from '@/lib/workflowTypes';

interface SteelBrowserPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steelStatus: Partial<SteelBrowserStatus>;
}

export function SteelBrowserPanel({ open, onOpenChange, steelStatus }: SteelBrowserPanelProps) {
  const [logs, setLogs] = useState<string[]>([
    "✓ Steel Browser connected and ready",
    "→ Waiting for campaign execution..."
  ]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  useEffect(() => {
    if (open) {
      // Simulate log updates when panel is open
      const timer = setTimeout(() => {
        addLog("→ Starting browser session...");
        
        setTimeout(() => {
          addLog("✓ Browser instance launched");
          
          setTimeout(() => {
            addLog("→ Navigating to LinkedIn");
            
            setTimeout(() => {
              addLog("✓ Successfully loaded LinkedIn");
            }, 2000);
          }, 1500);
        }, 1000);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleTestAction = () => {
    addLog("→ Running test action...");
    
    setTimeout(() => {
      addLog("→ Opening LinkedIn");
      
      setTimeout(() => {
        addLog("✓ Test action completed successfully");
      }, 2000);
    }, 1000);
  };

  return (
    <div 
      className={`absolute bottom-0 right-0 w-full md:w-1/3 bg-white border-t md:border-l border-neutral-200 shadow-md z-20 transition-all duration-300 transform ${
        open ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="absolute -top-10 right-4 flex space-x-2">
        <Button
          variant="default"
          size="sm"
          className="rounded-t-md rounded-b-none"
          onClick={() => onOpenChange(!open)}
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Steel Browser
        </Button>
      </div>
      
      <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-neutral-900">Live Browser View</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setLogs([
            "✓ Steel Browser connected and ready",
            "→ Waiting for campaign execution..."
          ])}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-1" /> Open
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="bg-neutral-100 border border-neutral-200 rounded-md w-full aspect-video flex flex-col items-center justify-center text-neutral-500">
          <svg className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-center">Browser will appear here during campaign execution<br/>Start a campaign to view live automation</p>
          <Button
            className="mt-4"
            onClick={handleTestAction}
          >
            Run Test Action
          </Button>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-2">Execution Log</h4>
          <div className="bg-neutral-900 text-neutral-100 p-3 rounded-md h-40 overflow-y-auto font-mono text-xs">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={
                  log.startsWith("✓") ? "text-green-400" : 
                  log.startsWith("→") ? "text-neutral-400" : 
                  log.startsWith("!") ? "text-red-400" : 
                  "text-neutral-100"
                }
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
