export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeData {
  id: string;
  type: string;
  label: string;
  position: NodePosition;
  data: Record<string, any>;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
}

export interface WorkflowData {
  nodes: NodeData[];
  edges: EdgeData[];
}

export interface Campaign {
  id: number;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  workflow: WorkflowData;
  createdAt: string;
  updatedAt: string;
}

export interface SocialPlatformConfig {
  type: 'linkedin' | 'instagram' | 'twitter';
  icon: string;
  color: string;
  label: string;
}

export interface ActionConfig {
  type: string;
  icon: string;
  label: string;
  category: 'action' | 'condition' | 'datasource';
  color?: string;
  fields: FieldConfig[];
}

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'tags';
  options?: { label: string; value: string }[];
  defaultValue?: any;
  placeholder?: string;
}

export interface SteelBrowserAction {
  action: string;
  platform: string;
  params: Record<string, any>;
}

export interface SteelBrowserStatus {
  running: boolean;
  version: string;
  status: 'healthy' | 'error' | 'starting';
}
