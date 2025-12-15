# WebSocket Real-time Chat Implementation Guide

## Overview

This project now includes WebSocket support for real-time chat communication using Socket.io. The implementation provides instant message delivery while maintaining backward compatibility with the existing polling mechanism.

## Architecture

### Components

1. **WebSocket Client** (`lib/websocket.ts`)
   - Socket.io client wrapper
   - Manages connection lifecycle
   - Handles reconnection logic
   - Event subscription system

2. **React Hook** (`hooks/useWebSocket.ts`)
   - React hook for WebSocket integration
   - Automatic connection management
   - Message processing and filtering
   - Typing indicators support

3. **Custom Server** (`server.ts`)
   - Next.js custom server with Socket.io
   - WebSocket connection handling
   - Message broadcasting
   - Authentication middleware

## Setup Instructions

### 1. Install Dependencies

Socket.io is already installed. If you need to reinstall:

```bash
npm install socket.io socket.io-client
npm install --save-dev @types/node tsx
```

### 2. Run the Custom Server

For development with WebSocket support:

```bash
npm run dev:ws
```

For production:

```bash
npm run build
npm run start:ws
```

**Note:** The custom server (`server.ts`) is required for WebSocket functionality. The default Next.js dev server (`npm run dev`) will not support WebSocket connections.

### 3. Environment Variables

No additional environment variables are required. The WebSocket server uses the same configuration as your Next.js app.

## How It Works

### Connection Flow

1. **Client Connection:**
   - User authenticates and gets access token
   - WebSocket client connects with token and chatId
   - Server validates token and establishes connection

2. **Message Flow:**
   - User sends message via API or WebSocket
   - Server processes message through ChatService
   - Server broadcasts message to all connected clients in the chat
   - Clients receive message in real-time

3. **Fallback Mechanism:**
   - If WebSocket is not connected, polling is used
   - Polling interval: 20 seconds (WebSocket disconnected) or 60 seconds (WebSocket connected)
   - Ensures messages are always delivered

### Message Types

- `message` - New message received
- `message_sent` - Confirmation of sent message
- `typing` - Typing indicator
- `connected` - Connection established
- `disconnected` - Connection lost
- `error` - Error occurred

## Integration Points

### Dashboard Page (`app/dashboard/page.tsx`)

The dashboard now uses the `useWebSocket` hook:

```typescript
const { isConnected: wsConnected, messages: wsMessages } = useWebSocket({
  chatId: selectedChatId,
  enabled: isAuthenticated && !!selectedChatId,
  onMessage: (newMessage) => {
    // Handle new message
  },
});
```

### Features

1. **Real-time Message Delivery:**
   - Messages appear instantly when sent
   - No need to wait for polling interval

2. **Automatic Reconnection:**
   - Client automatically reconnects on disconnect
   - Exponential backoff for reconnection attempts

3. **Typing Indicators:**
   - Support for typing indicators (ready for implementation)
   - Broadcast typing status to other users

4. **System Message Filtering:**
   - WebSocket messages are filtered for system messages
   - HTML cleaning applied automatically

## Troubleshooting

### WebSocket Not Connecting

1. **Check Server Status:**
   - Ensure you're running `npm run dev:ws` (not `npm run dev`)
   - Check server console for connection logs

2. **Check Authentication:**
   - Verify access token is valid
   - Check token expiration

3. **Check Network:**
   - Verify WebSocket endpoint is accessible
   - Check firewall/proxy settings

### Messages Not Appearing

1. **Check Connection Status:**
   - Verify WebSocket is connected (check browser console)
   - Fallback to polling should work if WebSocket fails

2. **Check Message Filtering:**
   - System messages are automatically filtered
   - Check browser console for any errors

3. **Verify Chat ID:**
   - Ensure correct chatId is being used
   - Check that user has access to the chat

## Performance Considerations

### WebSocket vs Polling

- **WebSocket:** Instant delivery, lower server load, persistent connection
- **Polling:** Fallback mechanism, higher server load, delayed delivery

### Optimization

1. **Connection Management:**
   - Connections are automatically cleaned up
   - Only one connection per chat per user

2. **Message Batching:**
   - Messages are processed individually
   - No batching required for chat messages

3. **Reconnection Strategy:**
   - Exponential backoff prevents server overload
   - Max 5 reconnection attempts

## Security

### Authentication

- All WebSocket connections require valid access token
- Token is validated on connection
- User ID is extracted from token

### Authorization

- Users can only receive messages for chats they have access to
- Server validates chat access before broadcasting

## Future Enhancements

1. **Typing Indicators:**
   - Full typing indicator implementation
   - Show who is typing in real-time

2. **Message Status:**
   - Read receipts
   - Delivery confirmations

3. **Presence:**
   - Online/offline status
   - Last seen timestamps

4. **Notifications:**
   - Push notifications for new messages
   - Desktop notifications

## API Reference

### WebSocketClient

```typescript
// Connect
wsClient.connect(accessToken, chatId);

// Disconnect
wsClient.disconnect();

// Send message
wsClient.send('send_message', { chatId, message });

// Subscribe to events
wsClient.on('message', (data) => { ... });

// Check connection status
wsClient.isConnected();
```

### useWebSocket Hook

```typescript
const {
  status,           // Connection status
  isConnected,      // Boolean connection status
  messages,         // Real-time messages
  sendTyping,       // Send typing indicator
} = useWebSocket({
  chatId,
  enabled,
  onMessage,
  onMessageSent,
  onTyping,
});
```

## Migration Notes

### Existing Code Compatibility

- All existing code continues to work
- Polling is still active as fallback
- No breaking changes to existing APIs

### Gradual Migration

- WebSocket is opt-in via the custom server
- Can run without WebSocket (using default Next.js server)
- Polling ensures messages are always delivered

