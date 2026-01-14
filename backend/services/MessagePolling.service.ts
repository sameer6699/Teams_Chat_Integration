/**
 * Message Polling Service
 * Polls for new messages in active chats and broadcasts them via WebSocket
 */

import { ChatService } from './Chat.service';
import { MessageModel } from '../models/Message.model';

interface ChatMessageSnapshot {
  chatId: string;
  lastMessageId: string;
  lastMessageTime: string;
}

export class MessagePollingService {
  private chatService: ChatService;
  // Per-user message snapshots: userId -> Map<chatId, ChatMessageSnapshot>
  private userMessageSnapshots: Map<string, Map<string, ChatMessageSnapshot>> = new Map();
  // Per-user polling intervals: userId -> NodeJS.Timeout
  private userPollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  // Per-user active chats: userId -> Set<chatId>
  private userActiveChats: Map<string, Set<string>> = new Map();

  constructor() {
    this.chatService = new ChatService();
  }

  /**
   * Start polling for new messages in active chats for a user
   */
  startPolling(userId: string, accessToken: string, chatIds: string[], intervalMs: number = 10000): void {
    // Stop existing polling for this user
    this.stopPolling(userId);

    // Initialize user's active chats
    if (!this.userActiveChats.has(userId)) {
      this.userActiveChats.set(userId, new Set());
    }
    const activeChats = this.userActiveChats.get(userId)!;
    chatIds.forEach(chatId => activeChats.add(chatId));

    // Initialize user's message snapshots
    if (!this.userMessageSnapshots.has(userId)) {
      this.userMessageSnapshots.set(userId, new Map());
    }

    console.log(`MessagePollingService: Starting polling for user ${userId} with ${chatIds.length} active chats`);

    // Take initial snapshot
    this.takeSnapshot(accessToken, userId, chatIds).catch(err => {
      console.error(`MessagePollingService: Error taking initial snapshot for user ${userId}:`, err);
    });

    // Poll for new messages
    const interval = setInterval(async () => {
      try {
        await this.checkForNewMessages(accessToken, userId);
      } catch (error) {
        console.error(`MessagePollingService: Error checking for new messages for user ${userId}:`, error);
      }
    }, intervalMs);

    this.userPollingIntervals.set(userId, interval);
  }

  /**
   * Add a chat to active polling for a user
   */
  addActiveChat(userId: string, chatId: string): void {
    if (!this.userActiveChats.has(userId)) {
      this.userActiveChats.set(userId, new Set());
    }
    this.userActiveChats.get(userId)!.add(chatId);
  }

  /**
   * Remove a chat from active polling for a user
   */
  removeActiveChat(userId: string, chatId: string): void {
    if (this.userActiveChats.has(userId)) {
      this.userActiveChats.get(userId)!.delete(chatId);
    }
    // Also remove from snapshots
    if (this.userMessageSnapshots.has(userId)) {
      this.userMessageSnapshots.get(userId)!.delete(chatId);
    }
  }

  /**
   * Stop polling for a user
   */
  stopPolling(userId?: string): void {
    if (userId) {
      const interval = this.userPollingIntervals.get(userId);
      if (interval) {
        clearInterval(interval);
        this.userPollingIntervals.delete(userId);
      }
      this.userActiveChats.delete(userId);
      this.userMessageSnapshots.delete(userId);
      console.log(`MessagePollingService: Stopped polling for user ${userId}`);
    } else {
      // Stop all polling
      for (const [uid, interval] of this.userPollingIntervals) {
        clearInterval(interval);
      }
      this.userPollingIntervals.clear();
      this.userActiveChats.clear();
      this.userMessageSnapshots.clear();
      console.log('MessagePollingService: Stopped all polling');
    }
  }

  /**
   * Take initial snapshot of messages for active chats
   */
  private async takeSnapshot(accessToken: string, userId: string, chatIds: string[]): Promise<void> {
    const messageSnapshots = this.userMessageSnapshots.get(userId) || new Map();

    for (const chatId of chatIds) {
      try {
        const messages = await this.chatService.getChatMessages(accessToken, chatId, userId);
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          messageSnapshots.set(chatId, {
            chatId,
            lastMessageId: lastMessage.id,
            lastMessageTime: lastMessage.timestamp,
          });
        }
      } catch (error) {
        console.error(`MessagePollingService: Error taking snapshot for chat ${chatId}:`, error);
      }
    }

    this.userMessageSnapshots.set(userId, messageSnapshots);
  }

  /**
   * Check for new messages and broadcast them
   */
  private async checkForNewMessages(accessToken: string, userId: string): Promise<void> {
    try {
      const { broadcastMessage } = await import('../../server');
      const activeChats = this.userActiveChats.get(userId);
      const messageSnapshots = this.userMessageSnapshots.get(userId);

      if (!activeChats || !messageSnapshots) {
        return;
      }

      for (const chatId of activeChats) {
        try {
          const messages = await this.chatService.getChatMessages(accessToken, chatId, userId);
          
          if (messages.length === 0) {
            continue;
          }

          const snapshot = messageSnapshots.get(chatId);
          const lastMessage = messages[messages.length - 1];

          if (!snapshot) {
            // First time checking this chat, just store snapshot
            messageSnapshots.set(chatId, {
              chatId,
              lastMessageId: lastMessage.id,
              lastMessageTime: lastMessage.timestamp,
            });
          } else if (snapshot.lastMessageId !== lastMessage.id) {
            // New message detected
            console.log(`MessagePollingService: New message detected in chat ${chatId} for user ${userId}`);
            
            // Find all new messages (messages after the last known message)
            const lastKnownIndex = messages.findIndex(msg => msg.id === snapshot.lastMessageId);
            const newMessages = lastKnownIndex >= 0 
              ? messages.slice(lastKnownIndex + 1)
              : messages; // If last known message not found, consider all as new

            // Broadcast each new message
            for (const newMessage of newMessages) {
              console.log(`MessagePollingService: Broadcasting new message ${newMessage.id} to chat ${chatId}`);
              broadcastMessage(chatId, newMessage.toJSON());
            }

            // Update snapshot
            messageSnapshots.set(chatId, {
              chatId,
              lastMessageId: lastMessage.id,
              lastMessageTime: lastMessage.timestamp,
            });
          }
        } catch (error) {
          console.error(`MessagePollingService: Error checking messages for chat ${chatId}:`, error);
        }
      }
    } catch (error) {
      console.error(`MessagePollingService: Error checking for new messages for user ${userId}:`, error);
    }
  }
}

// Singleton instance
export const messagePollingService = new MessagePollingService();
