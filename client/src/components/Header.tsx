import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Bell, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  children?: ReactNode;
}

export default function Header({ children }: HeaderProps) {
  const [location] = useLocation();
  
  return (
    <header className="bg-white border-b border-neutral-200 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {children}
        
        <div className="text-xl font-semibold text-primary flex items-center">
          <svg className="h-7 w-7 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          SocialFlow
        </div>
        
        <nav className="hidden md:flex items-center ml-6 space-x-4">
          <Link href="/dashboard">
            <a className={`px-3 py-2 text-sm font-medium rounded-md ${
              location === "/dashboard" 
                ? "text-primary bg-primary-50" 
                : "text-neutral-900 hover:bg-neutral-100"
            }`}>
              Dashboard
            </a>
          </Link>
          <Link href="/campaigns">
            <a className={`px-3 py-2 text-sm font-medium rounded-md ${
              location.startsWith("/campaigns") 
                ? "text-primary bg-primary-50" 
                : "text-neutral-900 hover:bg-neutral-100"
            }`}>
              Campaigns
            </a>
          </Link>
          <Link href="/leads">
            <a className={`px-3 py-2 text-sm font-medium rounded-md ${
              location === "/leads" 
                ? "text-primary bg-primary-50" 
                : "text-neutral-900 hover:bg-neutral-100"
            }`}>
              Leads
            </a>
          </Link>
          <Link href="/analytics">
            <a className={`px-3 py-2 text-sm font-medium rounded-md ${
              location === "/analytics" 
                ? "text-primary bg-primary-50" 
                : "text-neutral-900 hover:bg-neutral-100"
            }`}>
              Analytics
            </a>
          </Link>
          <Link href="/settings">
            <a className={`px-3 py-2 text-sm font-medium rounded-md ${
              location === "/settings" 
                ? "text-primary bg-primary-50" 
                : "text-neutral-900 hover:bg-neutral-100"
            }`}>
              Settings
            </a>
          </Link>
        </nav>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        
        <div className="h-6 w-px bg-neutral-200"></div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">Tom Cook</span>
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
