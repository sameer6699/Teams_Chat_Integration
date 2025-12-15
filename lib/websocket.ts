/**
 * WebSocket Client for Real-time Chat using Socket.io
 * Provides WebSocket connection management and message handling
 */

import { io, Socket } from 'socket.io-client';

export type WebSocketMessage = {
  type: 'message' | 'message_sent' | 'message_updated' | 'message_deleted' | 'typing' | 'error' | 'connected' | 'disconnected';
  chatId?: string;
  message?: any;
  userId?: string;
  timestamp?: string;
  error?: string;
};

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export class WebSocketClient {
  private socket: Socket | null = null;
  private url: string;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private statusListeners: Set<(status: WebSocketStatus) => void> = new Set();
  private status: WebSocketStatus = 'disconnected';
  private accessToken: string | null = null;
  private chatId: string | null = null;

  constructor() {
    // Use the same origin for Socket.io
    this.url = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  }

  /**
   * Connect to WebSocket server using Socket.io
   */
  connect(accessToken: string, chatId?: string): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    this.accessToken = accessToken;
    this.chatId = chatId || null;

    try {
      this.setStatus('connecting');
      
      // Initialize Socket.io connection
      this.socket = io(this.url, {
        path: '/api/ws',
        query: {
          token: accessToken,
          ...(chatId && { chatId }),
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected:', this.socket?.id);
        this.setStatus('connected');
        this.emit('connected', {});
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        this.setStatus('disconnected');
        this.emit('disconnected', {});
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.setStatus('error');
        this.emit('error', { error: error.message || 'WebSocket connection error' });
      });

      // Listen for messages
      this.socket.on('message', (data: WebSocketMessage) => {
        this.handleMessage({ type: 'message', ...data });
      });

      this.socket.on('message_sent', (data: WebSocketMessage) => {
        this.handleMessage({ type: 'message_sent', ...data });
      });

      this.socket.on('typing', (data: any) => {
        this.handleMessage({ type: 'typing', ...data });
      });

      this.socket.on('error', (data: any) => {
        this.handleMessage({ type: 'error', ...data });
      });
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.setStatus('error');
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.setStatus('disconnected');
  }

  /**
   * Send a message through WebSocket
   */
  send(type: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(type, data);
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
    }
  }

  /**
   * Subscribe to a specific message type
   */
  on(type: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(callback);
    };
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(callback: (status: WebSocketStatus) => void): () => void {
    this.statusListeners.add(callback);
    // Immediately call with current status
    callback(this.status);

    // Return unsubscribe function
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  /**
   * Get current connection status
   */
  getStatus(): WebSocketStatus {
    return this.status;
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Switch to a different chat
   */
  switchChat(chatId: string): void {
    if (this.chatId !== chatId && this.accessToken) {
      // Update query parameters and reconnect
      this.disconnect();
      this.connect(this.accessToken, chatId);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: WebSocketMessage): void {
    const { type, ...payload } = data;
    this.emit(type, payload);
  }

  /**
   * Emit event to all listeners
   */
  private emit(type: string, data: any): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for ${type}:`, error);
        }
      });
    }
  }

  /**
   * Set connection status and notify listeners
   */
  private setStatus(status: WebSocketStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.statusListeners.forEach(callback => {
        try {
          callback(status);
        } catch (error) {
          console.error('Error in status listener:', error);
        }
      });
    }
  }

}

// Export singleton instance
export const wsClient = new WebSocketClient();

