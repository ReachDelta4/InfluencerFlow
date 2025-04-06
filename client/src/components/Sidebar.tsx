import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  Clock, 
  Filter, 
  MessagesSquare, 
  Repeat, 
  ThumbsUp, 
  Zap 
} from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { SiLinkedin, SiInstagram, SiX } from "react-icons/si";

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <div className="flex flex-col w-64 border-r border-neutral-200 bg-white h-full">
      <div className="px-4 py-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-neutral-900">Campaign Builder</h2>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-6">
          <div>
            <h3 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Social Platforms
            </h3>
            <Accordion type="multiple" className="mt-2 space-y-1">
              <AccordionItem value="linkedin" className="border-0">
                <div className="bg-neutral-50 text-neutral-700 group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-grab drag-handle">
                  <SiLinkedin className="mr-3 h-5 w-5 text-[#0A66C2]" />
                  LinkedIn
                </div>
              </AccordionItem>
              <AccordionItem value="instagram" className="border-0">
                <div className="text-neutral-700 hover:bg-neutral-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-grab drag-handle">
                  <SiInstagram className="mr-3 h-5 w-5 text-[#E4405F]" />
                  Instagram
                </div>
              </AccordionItem>
              <AccordionItem value="twitter" className="border-0">
                <div className="text-neutral-700 hover:bg-neutral-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-grab drag-handle">
                  <SiX className="mr-3 h-5 w-5" />
                  X (Twitter)
                </div>
              </AccordionItem>
            </Accordion>
          </div>
          
          <div>
            <h3 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Actions
            </h3>
            <div className="mt-2 space-y-1">
              <div className="text-neutral-700 hover:bg-neutral-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-grab drag-handle">
                <MessagesSquare className="mr-3 h-5 w-5 text-neutral-600" />
                Send DM
              </div>
              <div className="text-neutral-700 hover:bg-neutral-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-grab drag-handle">
                <Clock className="mr-3 h-5 w-5 text-neutral-600" />
                Wait
              </div>
              <div className="text-neutral-700 hover:bg-neutral-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-grab drag-handle">
                <ThumbsUp className="mr-3 h-5 w-5 text-neutral-600" />
                Like Post
              </div>
              <div className="text-neutral-700 hover:bg-neutral-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-grab drag-handle">
                <MessagesSquare className="mr-3 h-5 w-5 text-neutral-600" />
                Comment
              </div>
              <div className="text-neutral-700 hover:bg-neutral-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-grab drag-handle">
                <Repeat className="mr-3 h-5 w-5 text-neutral-600" />
                Follow-up
              </div>
              <div className="text-neutral-700 hover:bg-neutral-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-grab drag-handle">
                <Filter className="mr-3 h-5 w-5 text-neutral-600" />
                Condition
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Data Sources
            </h3>
            <div className="mt-2 space-y-1">
              <div className="text-neutral-700 hover:bg-neutral-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-grab drag-handle">
                <svg className="mr-3 h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.318 12.545H7.91v-1.909h3.41v1.91zm4.25 0h-3.41v-1.909h3.41v1.91zm-4.25 3.864H7.91v-1.909h3.41v1.91zm4.25 0h-3.41v-1.909h3.41v1.91zm4.25-9.205v12.818c0 .93-.754 1.682-1.682 1.682H5.864c-.928 0-1.682-.752-1.682-1.682V7.204c0-.93.754-1.682 1.682-1.682h12.272c.928 0 1.682.753 1.682 1.682zm-1.682 0H5.863v12.818h12.273V7.204zM11.318 8.59H7.91V6.682h3.41V8.59zm4.25 0h-3.41V6.682h3.41V8.59z"/>
                </svg>
                Google Sheets
              </div>
              <div className="text-neutral-700 hover:bg-neutral-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-grab drag-handle">
                <svg className="mr-3 h-5 w-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                Database
              </div>
              <div className="text-neutral-700 hover:bg-neutral-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-grab drag-handle">
                <svg className="mr-3 h-5 w-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                CSV Import
              </div>
            </div>
          </div>
        </nav>
      </div>
      
      <div className="flex-shrink-0 border-t border-neutral-200 p-4">
        <div className="bg-primary-50 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-primary-700">Steel Browser</h3>
              <div className="mt-1 text-xs text-primary-600">
                Running locally
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 ml-1">
                  <Check className="h-3 w-3 mr-1" /> Active
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
