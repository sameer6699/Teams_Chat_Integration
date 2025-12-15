/**
 * Message Model
 * Represents chat message data structure
 */

import { IUser } from './User.model';

export interface IMessage {
  id: string;
  chatId: string;
  text: string;
  timestamp: string;
  isSender: boolean;
  sender?: IUser;
  senderId?: string;
  contentType?: 'text' | 'html' | 'attachment';
  attachments?: Array<{
    id: string;
    name: string;
    contentType: string;
    size: number;
    contentUrl?: string;
  }>;
  reactions?: Array<{
    reactionType: string;
    users: string[];
  }>;
}

export class MessageModel implements IMessage {
  id: string;
  chatId: string;
  text: string;
  timestamp: string;
  isSender: boolean;
  sender?: IUser;
  senderId?: string;
  contentType?: 'text' | 'html' | 'attachment';
  attachments?: Array<{
    id: string;
    name: string;
    contentType: string;
    size: number;
    contentUrl?: string;
  }>;
  reactions?: Array<{
    reactionType: string;
    users: string[];
  }>;

  constructor(data: IMessage) {
    this.id = data.id;
    this.chatId = data.chatId;
    this.text = data.text;
    this.timestamp = data.timestamp;
    this.isSender = data.isSender;
    this.sender = data.sender;
    this.senderId = data.senderId;
    this.contentType = data.contentType || 'text';
    this.attachments = data.attachments;
    this.reactions = data.reactions;
  }

  /**
   * Validate message data
   */
  static validate(data: Partial<IMessage>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.id) errors.push('Message ID is required');
    if (!data.chatId) errors.push('Chat ID is required');
    if (!data.text && !data.attachments?.length) {
      errors.push('Message text or attachment is required');
    }
    if (!data.timestamp) errors.push('Timestamp is required');

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Transform Graph API message to Message model
   */
  static fromGraphApi(graphMessage: any, chatId: string, currentUserId?: string): MessageModel {
    // Extract sender information from various possible Graph API structures
    const sender = graphMessage.from?.user || graphMessage.from;
    const senderId = sender?.id || sender?.userId;
    const isSender = currentUserId ? (senderId === currentUserId || sender?.id === currentUserId) : false;

    // Build sender object with all available information
    const senderInfo = sender ? {
      id: sender.id || sender.userId || '',
      displayName: sender.displayName || sender.name || sender.givenName || 'Unknown',
      name: sender.displayName || sender.name || sender.givenName || 'Unknown',
      email: sender.userPrincipalName || sender.mail || sender.email || '',
      userPrincipalName: sender.userPrincipalName || sender.mail || sender.email || '',
    } : undefined;

    return new MessageModel({
      id: graphMessage.id,
      chatId: chatId,
      text: graphMessage.body?.content || graphMessage.body?.text || '',
      timestamp: graphMessage.createdDateTime || graphMessage.lastModifiedDateTime || new Date().toISOString(),
      isSender: isSender,
      senderId: senderId,
      sender: senderInfo,
      contentType: graphMessage.body?.contentType || 'text',
      attachments: graphMessage.attachments?.map((att: any) => ({
        id: att.id,
        name: att.name,
        contentType: att.contentType,
        size: att.size,
        contentUrl: att.contentUrl,
      })),
      reactions: graphMessage.reactions?.map((r: any) => ({
        reactionType: r.reactionType,
        users: r.users || [],
      })),
    });
  }

  /**
   * Format timestamp for display
   */
  getFormattedTime(): string {
    const date = new Date(this.timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  }

  /**
   * Convert to JSON
   */
  toJSON(): IMessage {
    return {
      id: this.id,
      chatId: this.chatId,
      text: this.text,
      timestamp: this.timestamp,
      isSender: this.isSender,
      sender: this.sender,
      senderId: this.senderId,
      contentType: this.contentType,
      attachments: this.attachments,
      reactions: this.reactions,
    };
  }
}

