import { apiRequest } from "./queryClient";
import { SteelBrowserAction, SteelBrowserStatus } from "./workflowTypes";

export async function executeSteelAction(campaignId: number, action: SteelBrowserAction): Promise<any> {
  const response = await apiRequest("POST", "/api/steel/execute", {
    campaignId,
    action: action.action,
    platform: action.platform,
    params: action.params,
  });
  
  return response.json();
}

export async function getSteelStatus(): Promise<SteelBrowserStatus> {
  const response = await fetch("/api/steel/status", {
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error("Failed to get Steel Browser status");
  }
  
  return response.json();
}

// Helper function to convert workflow nodes into Steel actions
export function workflowToSteelActions(workflow: any) {
  const actions: SteelBrowserAction[] = [];
  
  // This is a simplified version - in a real app, you would traverse the workflow
  // graph and convert each node into an appropriate Steel Browser action
  workflow.nodes.forEach((node: any) => {
    switch (node.type) {
      case 'linkedin':
        actions.push({
          action: 'navigate',
          platform: 'linkedin',
          params: {
            url: 'https://www.linkedin.com/search/results/people/',
            query: node.data.query,
            filters: node.data.filters
          }
        });
        break;
      case 'send-dm':
        actions.push({
          action: 'sendMessage',
          platform: node.data.platform,
          params: {
            message: node.data.message,
            recipientUrl: node.data.recipientUrl
          }
        });
        break;
      case 'like-post':
        actions.push({
          action: 'likePost',
          platform: node.data.platform,
          params: {
            postUrl: node.data.postUrl
          }
        });
        break;
      case 'comment':
        actions.push({
          action: 'comment',
          platform: node.data.platform,
          params: {
            postUrl: node.data.postUrl,
            comment: node.data.comment
          }
        });
        break;
      // Add more action types as needed
    }
  });
  
  return actions;
}
