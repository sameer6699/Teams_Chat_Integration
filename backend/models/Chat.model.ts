/**
 * Chat Model
 * Represents chat/conversation data structure
 */

import { IUser } from './User.model';

export interface IChat {
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
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  participants?: IUser[];
}

export class ChatModel implements IChat {
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
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  participants?: IUser[];

  constructor(data: IChat) {
    this.id = data.id;
    this.topic = data.topic;
    this.createdDateTime = data.createdDateTime;
    this.lastUpdatedDateTime = data.lastUpdatedDateTime;
    this.chatType = data.chatType;
    this.webUrl = data.webUrl;
    this.members = data.members;
    this.lastMessage = data.lastMessage;
    this.lastMessageTime = data.lastMessageTime;
    this.unreadCount = data.unreadCount || 0;
    this.participants = data.participants;
  }

  /**
   * Validate chat data
   */
  static validate(data: Partial<IChat>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.id) errors.push('Chat ID is required');
    if (!data.chatType) errors.push('Chat type is required');
    if (!data.createdDateTime) errors.push('Created date time is required');

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Transform Graph API chat to Chat model
   */
  static fromGraphApi(graphChat: any): ChatModel {
    return new ChatModel({
      id: graphChat.id,
      topic: graphChat.topic,
      createdDateTime: graphChat.createdDateTime,
      lastUpdatedDateTime: graphChat.lastUpdatedDateTime,
      chatType: graphChat.chatType,
      webUrl: graphChat.webUrl,
      members: graphChat.members,
      lastMessage: undefined,
      lastMessageTime: undefined,
      unreadCount: 0,
    });
  }

  /**
   * Get chat display name
   */
  getDisplayName(currentUserId?: string): string {
    if (this.topic) return this.topic;
    
    if (this.chatType === 'oneOnOne' && this.members && currentUserId) {
      const otherMember = this.members.find(m => m.userId !== currentUserId);
      return otherMember?.displayName || 'Unknown User';
    }

    if (this.members && this.members.length > 0) {
      return this.members.map(m => m.displayName).join(', ');
    }

    return 'Chat';
  }

  /**
   * Convert to JSON
   */
  toJSON(): IChat {
    return {
      id: this.id,
      topic: this.topic,
      createdDateTime: this.createdDateTime,
      lastUpdatedDateTime: this.lastUpdatedDateTime,
      chatType: this.chatType,
      webUrl: this.webUrl,
      members: this.members,
      lastMessage: this.lastMessage,
      lastMessageTime: this.lastMessageTime,
      unreadCount: this.unreadCount,
      participants: this.participants,
    };
  }
}

