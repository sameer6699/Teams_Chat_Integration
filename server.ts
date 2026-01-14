/**
 * Custom Next.js Server with WebSocket Support
 * Run this server instead of the default Next.js dev server for WebSocket support
 * 
 * Usage:
 *   npm run dev:ws
 *   or
 *   node server.js
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Store active connections
const activeConnections = new Map<string, Set<string>>(); // chatId -> Set of socketIds
// Store active user polling
const activeUserPolling = new Map<string, boolean>(); // userId -> isPolling

// Socket.IO server instance (will be initialized in app.prepare())
let io: SocketIOServer | null = null;

// Function to broadcast chat list updates to all connected users
export function broadcastChatUpdate(userId: string, chatData: any) {
  if (!io) {
    console.warn('Socket.IO not initialized yet, cannot broadcast chat update');
    return;
  }
  io.to(`user:${userId}`).emit('chat_updated', {
    type: 'chat_updated',
    chat: chatData,
    timestamp: new Date().toISOString(),
  });
}

// Function to broadcast channel list updates to all connected users
export function broadcastChannelUpdate(userId: string, channelData: any) {
  if (!io) {
    console.warn('Socket.IO not initialized yet, cannot broadcast channel update');
    return;
  }
  io.to(`user:${userId}`).emit('channel_updated', {
    type: 'channel_updated',
    channel: channelData,
    timestamp: new Date().toISOString(),
  });
}

// Function to broadcast new chat to user
export function broadcastNewChat(userId: string, chatData: any) {
  if (!io) {
    console.warn('Socket.IO not initialized yet, cannot broadcast new chat');
    return;
  }
  io.to(`user:${userId}`).emit('chat_created', {
    type: 'chat_created',
    chat: chatData,
    timestamp: new Date().toISOString(),
  });
}

// Function to broadcast new channel to user
export function broadcastNewChannel(userId: string, channelData: any) {
  if (!io) {
    console.warn('Socket.IO not initialized yet, cannot broadcast new channel');
    return;
  }
  io.to(`user:${userId}`).emit('channel_created', {
    type: 'channel_created',
    channel: channelData,
    timestamp: new Date().toISOString(),
  });
}

// Function to broadcast new message to all clients in a chat room
export function broadcastMessage(chatId: string, messageData: any) {
  if (!io) {
    console.warn('Socket.IO not initialized yet, cannot broadcast message');
    return;
  }
  
  // Ensure sender format matches frontend Message interface
  const formattedMessage = {
    ...messageData,
    sender: messageData.sender ? {
      id: messageData.sender.id || messageData.senderId || '',
      name: messageData.sender.name || messageData.sender.displayName || 'Unknown',
      email: messageData.sender.email || messageData.sender.userPrincipalName || '',
    } : undefined,
  };
  
  console.log(`Broadcasting message to chat ${chatId}:`, formattedMessage.id);
  io.to(chatId).emit('message', {
    type: 'message',
    chatId,
    message: formattedMessage,
    timestamp: new Date().toISOString(),
  });
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO
  io = new SocketIOServer(server, {
    path: '/api/ws',
    cors: {
      origin: dev ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.query.token as string;
      const chatId = socket.handshake.query.chatId as string | undefined;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify token (simplified - in production, verify with Microsoft Graph API)
      // For now, we'll store the token and chatId in the socket data
      socket.data.token = token;
      socket.data.chatId = chatId;
      socket.data.userId = extractUserIdFromToken(token); // You'll need to implement this

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const chatId = socket.data.chatId;
    const userId = socket.data.userId;

    console.log(`WebSocket client connected: ${socket.id} (Chat: ${chatId}, User: ${userId})`);

    // Join user's personal room for chat/channel list updates
    socket.join(`user:${userId}`);

    // Start polling for this user's chat/channel updates if not already started
    if (userId && socket.data.token && !activeUserPolling.has(userId)) {
      (async () => {
        try {
          const { realtimeUpdateService } = await import('./backend/services/RealtimeUpdate.service');
          
          // Send initial chats and channels data via WebSocket
          await sendInitialData(socket, userId, socket.data.token);
          
          // Start polling for updates
          realtimeUpdateService.startPolling(userId, socket.data.token, 30000); // Poll every 30 seconds
          activeUserPolling.set(userId, true);
          console.log(`Started real-time polling for user: ${userId}`);
        } catch (error) {
          console.error('Error starting real-time polling:', error);
        }
      })();
    } else if (userId && socket.data.token) {
      // User already has polling, but send initial data anyway
      sendInitialData(socket, userId, socket.data.token).catch(err => {
        console.error('Error sending initial data:', err);
      });
    }

    // Join chat room if chatId is provided
    if (chatId) {
      socket.join(chatId);
      
      // Track connection
      if (!activeConnections.has(chatId)) {
        activeConnections.set(chatId, new Set());
      }
      activeConnections.get(chatId)!.add(socket.id);

      // Start polling for new messages in this chat
      (async () => {
        try {
          const { messagePollingService } = await import('./backend/services/MessagePolling.service');
          messagePollingService.addActiveChat(userId, chatId);
          // Start polling if not already started for this user
          if (!messagePollingService['userPollingIntervals'].has(userId)) {
            messagePollingService.startPolling(userId, socket.data.token, [chatId], 10000); // Poll every 10 seconds
          }
        } catch (error) {
          console.error('Error starting message polling:', error);
        }
      })();

      // Notify client of successful connection
      socket.emit('connected', {
        chatId,
        userId,
        timestamp: new Date().toISOString(),
      });
    }

    // Handle chat selection (user wants to receive messages for a specific chat)
    socket.on('select_chat', async (data: { chatId: string }) => {
      const { chatId: selectedChatId } = data;
      if (selectedChatId) {
        // Leave previous chat room if any
        if (chatId) {
          socket.leave(chatId);
        }
        
        // Join new chat room
        socket.join(selectedChatId);
        socket.data.chatId = selectedChatId;
        
        // Add to active chats for message polling
        try {
          const { messagePollingService } = await import('./backend/services/MessagePolling.service');
          messagePollingService.addActiveChat(userId, selectedChatId);
          
          // Get current active chats for this user
          const activeChats = messagePollingService['userActiveChats'].get(userId) || new Set();
          messagePollingService.startPolling(userId, socket.data.token, Array.from(activeChats), 10000);
        } catch (error) {
          console.error('Error handling chat selection:', error);
        }
      }
    });

    // Handle message sending
    socket.on('send_message', async (data: { chatId: string; message: string }) => {
      try {
        const { chatId, message } = data;
        const token = socket.data.token;

        if (!token || !chatId || !message) {
          socket.emit('error', { error: 'Invalid message data' });
          return;
        }

        // Send message via ChatService
        const { ChatService } = await import('./backend/services/Chat.service');
        const chatService = new ChatService();
        const newMessage = await chatService.sendMessage(token, chatId, message, socket.data.userId);
        
        // Convert MessageModel to JSON format
        const messageData = newMessage.toJSON ? newMessage.toJSON() : {
          id: newMessage.id,
          chatId: newMessage.chatId,
          text: newMessage.text,
          timestamp: newMessage.timestamp,
          isSender: newMessage.isSender,
          sender: newMessage.sender,
        };

        // Broadcast message to all clients in the chat room
        io.to(chatId).emit('message', {
          type: 'message',
          chatId,
          message: messageData,
          timestamp: new Date().toISOString(),
        });

        // Confirm to sender
        socket.emit('message_sent', {
          type: 'message_sent',
          chatId,
          message: messageData,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data: { chatId: string; isTyping: boolean }) => {
      const { chatId, isTyping } = data;
      if (chatId) {
        // Broadcast typing indicator to other users in the chat
        socket.to(chatId).emit('typing', {
          userId: socket.data.userId,
          chatId,
          isTyping,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`WebSocket client disconnected: ${socket.id}`);

      // Remove from active connections
      if (chatId && activeConnections.has(chatId)) {
        activeConnections.get(chatId)!.delete(socket.id);
        if (activeConnections.get(chatId)!.size === 0) {
          activeConnections.delete(chatId);
        }
      }

      // Remove chat from active chats for message polling
      if (chatId && userId) {
        try {
          const { messagePollingService } = await import('./backend/services/MessagePolling.service');
          messagePollingService.removeActiveChat(userId, chatId);
        } catch (error) {
          console.error('Error removing active chat:', error);
        }
      }

      // Check if user has any other active connections
      const userRoom = io.sockets.adapter.rooms.get(`user:${userId}`);
      if (!userRoom || userRoom.size === 0) {
        // No more connections for this user, stop polling
        try {
          const { realtimeUpdateService } = await import('./backend/services/RealtimeUpdate.service');
          realtimeUpdateService.stopPolling(userId);
          activeUserPolling.delete(userId);
          
          // Also stop message polling
          const { messagePollingService } = await import('./backend/services/MessagePolling.service');
          messagePollingService.stopPolling(userId);
          
          console.log(`Stopped real-time polling for user: ${userId}`);
        } catch (error) {
          console.error('Error stopping real-time polling:', error);
        }
      }

      // Notify other clients
      if (chatId) {
        socket.to(chatId).emit('user_disconnected', {
          userId: socket.data.userId,
          chatId,
          timestamp: new Date().toISOString(),
        });
      }
    });
  });

  server
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> WebSocket server running on ws://${hostname}:${port}/api/ws`);
    });
});

/**
 * Send initial chats and channels data to client via WebSocket
 */
async function sendInitialData(socket: any, userId: string, token: string): Promise<void> {
  try {
    console.log(`Sending initial data to user: ${userId}`);
    
    // Import services
    const { ChatService } = await import('./backend/services/Chat.service');
    const { ChannelService } = await import('./backend/services/Channel.service');
    
    const chatService = new ChatService();
    const channelService = new ChannelService();
    
    // Fetch chats and channels
    const [chats, channels] = await Promise.all([
      chatService.getAllChats(token, userId).catch(err => {
        console.error('Error fetching chats:', err);
        return [];
      }),
      channelService.getAllChannels(token).catch(err => {
        console.error('Error fetching channels:', err);
        return [];
      }),
    ]);
    
    // Send chats via WebSocket
    socket.emit('chats_loaded', {
      type: 'chats_loaded',
      chats: chats.map(chat => chat.toJSON()),
      timestamp: new Date().toISOString(),
    });
    
    // Send channels via WebSocket
    socket.emit('channels_loaded', {
      type: 'channels_loaded',
      channels: channels.map(channel => channel.toJSON()),
      timestamp: new Date().toISOString(),
    });
    
    console.log(`Sent initial data: ${chats.length} chats, ${channels.length} channels`);
  } catch (error) {
    console.error('Error sending initial data:', error);
  }
}

/**
 * Extract user ID from JWT token
 * This is a simplified version - in production, properly decode and verify the token
 */
function extractUserIdFromToken(token: string): string {
  try {
    // Decode JWT token (without verification for now)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64')
        .toString()
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return payload.oid || payload.sub || payload.userId || 'unknown';
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return 'unknown';
  }
}

