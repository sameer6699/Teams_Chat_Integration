import { graphConfig } from './msalConfig';

export interface GraphUser {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  officeLocation?: string;
}

export interface GraphChat {
  id: string;
  topic?: string;
  createdDateTime: string;
  lastUpdatedDateTime: string;
  chatType: 'oneOnOne' | 'group' | 'meeting';
  webUrl: string;
  members?: Array<{
    id: string;
    displayName: string;
    userId: string;
  }>;
}

export interface GraphTeam {
  id: string;
  displayName: string;
  description?: string;
  createdDateTime: string;
  webUrl: string;
}

export class GraphApiClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async makeRequest<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Graph API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getCurrentUser(): Promise<GraphUser> {
    return this.makeRequest<GraphUser>(graphConfig.graphMeEndpoint);
  }

  async getChats(): Promise<{ value: GraphChat[] }> {
    return this.makeRequest<{ value: GraphChat[] }>(graphConfig.graphChatsEndpoint);
  }

  async getTeams(): Promise<{ value: GraphTeam[] }> {
    return this.makeRequest<{ value: GraphTeam[] }>(graphConfig.graphTeamsEndpoint);
  }

  async getChatMessages(chatId: string): Promise<{ value: any[] }> {
    return this.makeRequest<{ value: any[] }>(`https://graph.microsoft.com/v1.0/chats/${chatId}/messages`);
  }

  async sendChatMessage(chatId: string, message: string): Promise<any> {
    const response = await fetch(`https://graph.microsoft.com/v1.0/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        body: {
          content: message,
          contentType: 'text'
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
