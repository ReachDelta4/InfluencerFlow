import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Plus, Trash2, Database, FileText } from "lucide-react";

interface LeadList {
  id: number;
  name: string;
  count: number;
  createdAt: string;
}

interface Lead {
  id: number;
  name: string;
  profileUrl: string;
  message: string;
  leadListId: number;
}

export default function Leads() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Lead[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [currentListId, setCurrentListId] = useState<number | null>(null);
  
  // Fetch lead lists
  const { data: leadLists, isLoading: isLoadingLists } = useQuery<LeadList[]>({
    queryKey: ['/api/lead-lists'],
  });
  
  // Fetch leads for selected list
  const { data: leads, isLoading: isLoadingLeads } = useQuery<Lead[]>({
    queryKey: ['/api/leads', currentListId],
    enabled: !!currentListId,
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    setCsvError(null);
    
    // Parse CSV for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Validate headers
        const requiredHeaders = ['Name', 'Profile URL', 'Message'];
        const missingHeaders = requiredHeaders.filter(h => 
          !headers.some(header => header.toLowerCase() === h.toLowerCase())
        );
        
        if (missingHeaders.length > 0) {
          setCsvError(`Missing required columns: ${missingHeaders.join(', ')}`);
          setPreviewData([]);
          return;
        }
        
        // Parse preview data (up to 5 rows)
        const previewLines = lines.slice(1, 6).filter(line => line.trim());
        const preview = previewLines.map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          return {
            id: index,
            name: values[headers.findIndex(h => h.toLowerCase() === 'name')],
            profileUrl: values[headers.findIndex(h => h.toLowerCase() === 'profile url')],
            message: values[headers.findIndex(h => h.toLowerCase() === 'message')],
            leadListId: 0 // Will be set after upload
          };
        });
        
        setPreviewData(preview);
      } catch (error) {
        setCsvError('Failed to parse CSV file. Please check the format.');
        setPreviewData([]);
      }
    };
    
    reader.readAsText(file);
  };
  
  const handleCreateList = async () => {
    if (!newListName.trim() || !selectedFile) {
      toast({
        title: "Missing information",
        description: "Please provide a name and select a CSV file",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setUploading(true);
      
      // Create new lead list
      const listResponse = await apiRequest("POST", "/api/lead-lists", {
        name: newListName.trim()
      });
      const listData = await listResponse.json();
      
      // Upload CSV file
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('leadListId', listData.id);
      
      const uploadResponse = await fetch('/api/leads/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload leads');
      }
      
      // Success
      queryClient.invalidateQueries({ queryKey: ['/api/lead-lists'] });
      setNewListName("");
      setSelectedFile(null);
      setPreviewData([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast({
        title: "Success",
        description: "Lead list created and data uploaded successfully",
      });
      
      // Select the newly created list
      setCurrentListId(listData.id);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create lead list or upload CSV data",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  
  const handleDeleteList = async (id: number) => {
    if (!confirm("Are you sure you want to delete this lead list? This action cannot be undone.")) {
      return;
    }
    
    try {
      await apiRequest("DELETE", `/api/lead-lists/${id}`);
      
      queryClient.invalidateQueries({ queryKey: ['/api/lead-lists'] });
      
      if (currentListId === id) {
        setCurrentListId(null);
      }
      
      toast({
        title: "Success",
        description: "Lead list deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete lead list",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leads Management</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Lead Lists Panel */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lead Lists</CardTitle>
              <CardDescription>
                Create and manage your lead lists for campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="list-name">New List Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="list-name"
                      placeholder="Enter list name"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="csv-file">Upload CSV File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="icon"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-neutral-500">
                    CSV must include Name, Profile URL, and Message columns
                  </p>
                </div>
                
                {csvError && (
                  <Alert variant="destructive">
                    <AlertDescription>{csvError}</AlertDescription>
                  </Alert>
                )}
                
                {previewData.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Preview:</h4>
                    <div className="border rounded-md overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Profile URL</TableHead>
                            <TableHead>Message</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewData.map((lead) => (
                            <TableRow key={lead.id}>
                              <TableCell className="font-medium">{lead.name}</TableCell>
                              <TableCell className="truncate max-w-[150px]">{lead.profileUrl}</TableCell>
                              <TableCell className="truncate max-w-[150px]">{lead.message}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Showing first {previewData.length} record{previewData.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
                
                <Button 
                  className="w-full"
                  onClick={handleCreateList}
                  disabled={!newListName.trim() || !selectedFile || uploading}
                >
                  {uploading ? 'Creating...' : 'Create Lead List'}
                </Button>
              </div>
            </CardContent>
            
            <CardHeader className="pt-6 pb-2">
              <CardTitle className="text-base">Your Lead Lists</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingLists ? (
                <div className="flex items-center justify-center h-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : leadLists && leadLists.length > 0 ? (
                <div className="space-y-2">
                  {leadLists.map((list) => (
                    <div 
                      key={list.id}
                      className={`
                        flex items-center justify-between p-3 rounded-md cursor-pointer
                        ${currentListId === list.id ? 'bg-primary/10 border border-primary/30' : 'bg-neutral-50 hover:bg-neutral-100'}
                      `}
                      onClick={() => setCurrentListId(list.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Database className="h-5 w-5 text-primary/70" />
                        <div>
                          <p className="font-medium">{list.name}</p>
                          <p className="text-xs text-neutral-500">
                            {list.count} leads · {new Date(list.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteList(list.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-neutral-500">No lead lists found</p>
                  <p className="text-sm text-neutral-400">Create your first lead list above</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Lead Details Panel */}
        <div className="md:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {currentListId 
                  ? `Leads in ${leadLists?.find(l => l.id === currentListId)?.name || 'Selected List'}`
                  : 'Lead Details'
                }
              </CardTitle>
              <CardDescription>
                {currentListId 
                  ? `Viewing all leads in the selected list`
                  : 'Select a lead list to view details'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!currentListId ? (
                <div className="text-center py-16">
                  <Database className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500">No lead list selected</p>
                  <p className="text-sm text-neutral-400">Select a list from the left panel</p>
                </div>
              ) : isLoadingLeads ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : leads && leads.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Profile URL</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>
                            <a 
                              href={lead.profileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate block max-w-xs"
                            >
                              {lead.profileUrl}
                            </a>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate">{lead.message}</div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-neutral-500">No leads found in this list</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}