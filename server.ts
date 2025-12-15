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
  const io = new SocketIOServer(server, {
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

    // Join chat room
    if (chatId) {
      socket.join(chatId);
      
      // Track connection
      if (!activeConnections.has(chatId)) {
        activeConnections.set(chatId, new Set());
      }
      activeConnections.get(chatId)!.add(socket.id);

      // Notify client of successful connection
      socket.emit('connected', {
        chatId,
        userId,
        timestamp: new Date().toISOString(),
      });
    }

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
    socket.on('disconnect', () => {
      console.log(`WebSocket client disconnected: ${socket.id}`);

      // Remove from active connections
      if (chatId && activeConnections.has(chatId)) {
        activeConnections.get(chatId)!.delete(socket.id);
        if (activeConnections.get(chatId)!.size === 0) {
          activeConnections.delete(chatId);
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

