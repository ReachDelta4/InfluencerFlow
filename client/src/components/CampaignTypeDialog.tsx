import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { SiLinkedin, SiInstagram, SiX } from 'react-icons/si';

export type CampaignPlatform = 'linkedin' | 'instagram' | 'twitter';

interface CampaignTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (platform: CampaignPlatform) => void;
}

export function CampaignTypeDialog({ open, onOpenChange, onSelect }: CampaignTypeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">Choose Campaign Platform</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300"
              onClick={() => onSelect('linkedin')}
            >
              <SiLinkedin className="h-8 w-8 text-[#0A66C2]" />
              <span className="font-medium">LinkedIn Campaign</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-pink-50 hover:border-pink-300"
              onClick={() => onSelect('instagram')}
            >
              <SiInstagram className="h-8 w-8 text-[#E4405F]" />
              <span className="font-medium">Instagram Campaign</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-neutral-50 hover:border-neutral-300"
              onClick={() => onSelect('twitter')}
            >
              <SiX className="h-8 w-8" />
              <span className="font-medium">X (Twitter) Campaign</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}