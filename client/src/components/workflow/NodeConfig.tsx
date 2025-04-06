import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface NodeConfigProps {
  node: any;
  onClose: () => void;
  onUpdate: (data: any) => void;
}

export function NodeConfig({ node, onClose, onUpdate }: NodeConfigProps) {
  const [nodeConfig, setNodeConfig] = useState<any>({});

  useEffect(() => {
    // Initialize config with node data
    setNodeConfig({
      ...node.data,
      fields: {
        ...node.data.fields,
      }
    });
  }, [node.data]);

  const handleSaveChanges = () => {
    onUpdate(nodeConfig);
    onClose();
  };

  const renderFields = () => {
    const { type } = nodeConfig;

    switch (type) {
      case 'linkedin':
        return (
          <>
            <div className="mb-4">
              <Label htmlFor="query">Profile Search</Label>
              <Input
                id="query"
                value={nodeConfig.fields?.query || ''}
                onChange={(e) => 
                  setNodeConfig({
                    ...nodeConfig,
                    fields: {
                      ...nodeConfig.fields,
                      query: e.target.value,
                    }
                  })
                }
                placeholder="Enter search query..."
                className="mt-1"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="filters">Filters (comma separated)</Label>
              <Input
                id="filters"
                value={nodeConfig.fields?.filters?.join(', ') || ''}
                onChange={(e) => {
                  const filtersArray = e.target.value.split(',').map(f => f.trim()).filter(f => f);
                  setNodeConfig({
                    ...nodeConfig,
                    fields: {
                      ...nodeConfig.fields,
                      filters: filtersArray,
                    }
                  });
                }}
                placeholder="Location: United States, Industry: Technology"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate each filter with a comma
              </p>
            </div>
          </>
        );

      case 'send-dm':
        return (
          <div className="mb-4">
            <Label htmlFor="message">Message Template</Label>
            <Textarea
              id="message"
              value={nodeConfig.fields?.message || ''}
              onChange={(e) => 
                setNodeConfig({
                  ...nodeConfig,
                  fields: {
                    ...nodeConfig.fields,
                    message: e.target.value,
                  }
                })
              }
              placeholder="Hi {first_name}, I noticed you're a {job_title} at {company}..."
              className="mt-1"
              rows={6}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {"{variable_name}"} to insert dynamic content from lead data
            </p>
          </div>
        );

      case 'wait':
        return (
          <>
            <div className="mb-4">
              <Label htmlFor="duration">Wait Duration</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  value={nodeConfig.fields?.duration || 3}
                  onChange={(e) => 
                    setNodeConfig({
                      ...nodeConfig,
                      fields: {
                        ...nodeConfig.fields,
                        duration: parseInt(e.target.value),
                      }
                    })
                  }
                  className="w-24"
                />
                <Select 
                  value={nodeConfig.fields?.unit || 'days'}
                  onValueChange={(value) => 
                    setNodeConfig({
                      ...nodeConfig,
                      fields: {
                        ...nodeConfig.fields,
                        unit: value,
                      }
                    })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="randomize"
                checked={nodeConfig.fields?.randomize || false}
                onCheckedChange={(checked) => 
                  setNodeConfig({
                    ...nodeConfig,
                    fields: {
                      ...nodeConfig.fields,
                      randomize: checked,
                    }
                  })
                }
              />
              <Label htmlFor="randomize">Add random variation (±20%)</Label>
            </div>
          </>
        );

      case 'condition':
        return (
          <>
            <div className="mb-4">
              <Label htmlFor="condition">If</Label>
              <Select 
                value={nodeConfig.fields?.condition || 'not-replied'}
                onValueChange={(value) => 
                  setNodeConfig({
                    ...nodeConfig,
                    fields: {
                      ...nodeConfig.fields,
                      condition: value,
                    }
                  })
                }
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-replied">Message not replied to</SelectItem>
                  <SelectItem value="viewed">Profile viewed message</SelectItem>
                  <SelectItem value="connection-accepted">Connection accepted</SelectItem>
                  <SelectItem value="message-received">Message received</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <Label htmlFor="withinDuration">Within</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="withinDuration"
                  type="number"
                  min={1}
                  value={nodeConfig.fields?.withinDuration || 2}
                  onChange={(e) => 
                    setNodeConfig({
                      ...nodeConfig,
                      fields: {
                        ...nodeConfig.fields,
                        withinDuration: parseInt(e.target.value),
                      }
                    })
                  }
                  className="w-24"
                />
                <Select 
                  value={nodeConfig.fields?.withinUnit || 'days'}
                  onValueChange={(value) => 
                    setNodeConfig({
                      ...nodeConfig,
                      fields: {
                        ...nodeConfig.fields,
                        withinUnit: value,
                      }
                    })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );

      case 'google-sheets':
        return (
          <>
            <div className="mb-4">
              <Label htmlFor="sheetId">Sheet ID</Label>
              <Input
                id="sheetId"
                value={nodeConfig.fields?.sheetId || ''}
                onChange={(e) => 
                  setNodeConfig({
                    ...nodeConfig,
                    fields: {
                      ...nodeConfig.fields,
                      sheetId: e.target.value,
                    }
                  })
                }
                placeholder="1A2B3C4D5E6F7G8H9I0J"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The ID from your Google Sheet URL
              </p>
            </div>
            <div className="mb-4">
              <Label htmlFor="sheetRange">Sheet Range</Label>
              <Input
                id="sheetRange"
                value={nodeConfig.fields?.sheetRange || 'Leads!A2:G'}
                onChange={(e) => 
                  setNodeConfig({
                    ...nodeConfig,
                    fields: {
                      ...nodeConfig.fields,
                      sheetRange: e.target.value,
                    }
                  })
                }
                placeholder="Leads!A2:G"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The range of cells to read (SheetName!StartCell:EndCell)
              </p>
            </div>
            <div className="mb-4">
              <Button variant="outline" size="sm">
                Verify Connection
              </Button>
            </div>
          </>
        );

      default:
        return (
          <div className="py-4 text-muted-foreground text-center">
            No configuration options available for this node type
          </div>
        );
    }
  };

  return (
    <Card className="absolute top-24 right-4 w-80 shadow-lg z-10">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-lg">Edit Node</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="label">Node Name</Label>
          <Input
            id="label"
            value={nodeConfig.label || ''}
            onChange={(e) => setNodeConfig({ ...nodeConfig, label: e.target.value })}
            className="mt-1"
          />
        </div>
        
        <div className="mb-4">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={nodeConfig.description || ''}
            onChange={(e) => setNodeConfig({ ...nodeConfig, description: e.target.value })}
            placeholder="Add a description..."
            className="mt-1"
          />
        </div>

        <div className="mb-4">
          <Label>Steel Browser Config</Label>
          <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200 mt-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-neutral-700">Proxy Settings</span>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs">Edit</Button>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-neutral-700">Human-like Delays</span>
              <Switch
                id="humanDelays"
                checked={nodeConfig.humanDelays || true}
                onCheckedChange={(checked) => setNodeConfig({ ...nodeConfig, humanDelays: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-700">Session Recording</span>
              <Switch
                id="recording"
                checked={nodeConfig.recording || true}
                onCheckedChange={(checked) => setNodeConfig({ ...nodeConfig, recording: checked })}
              />
            </div>
          </div>
        </div>

        {renderFields()}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSaveChanges}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}
