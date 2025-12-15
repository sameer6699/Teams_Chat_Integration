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
      let errorMessage = `Graph API request failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = `${errorMessage} - ${errorData.error.message || errorData.error.code || JSON.stringify(errorData.error)}`;
        } else {
          errorMessage = `${errorMessage} - ${JSON.stringify(errorData)}`;
        }
      } catch (e) {
        // If we can't parse the error response, use the status text
        const errorText = await response.text().catch(() => '');
        if (errorText) {
          errorMessage = `${errorMessage} - ${errorText}`;
        }
      }
      console.error('Graph API Error Details:', {
        url,
        status: response.status,
        statusText: response.statusText,
        errorMessage,
      });
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async getCurrentUser(): Promise<GraphUser> {
    return this.makeRequest<GraphUser>(graphConfig.graphMeEndpoint);
  }

  async getChats(): Promise<{ value: GraphChat[] }> {
    // Include members for richer chat data
    // Note: $orderby might not be supported for chats endpoint, so we'll sort client-side
    const endpoint = `${graphConfig.graphChatsEndpoint}?$expand=members&$top=50`;
    console.log('GraphApiClient: Fetching chats from:', endpoint);
    try {
      const response = await this.makeRequest<{ value: GraphChat[] }>(endpoint);
      console.log(`GraphApiClient: Successfully fetched ${response.value?.length || 0} chats`);
      return response;
    } catch (error) {
      console.error('GraphApiClient: Error fetching chats:', error);
      throw error;
    }
  }
  
  /**
   * Get chats with delta query for efficient updates
   * Use this for real-time updates to get only changed chats
   */
  async getChatsDelta(deltaToken?: string): Promise<{ value: GraphChat[]; '@odata.deltaLink'?: string }> {
    let endpoint = `${graphConfig.graphChatsEndpoint}/delta?$expand=members&$top=50`;
    if (deltaToken) {
      endpoint = deltaToken;
    }
    return this.makeRequest<{ value: GraphChat[]; '@odata.deltaLink'?: string }>(endpoint);
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
