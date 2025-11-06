# Implementation Guide - Using the MVC Architecture

## Quick Start

### 1. Using the New Architecture in Components

#### Example: Refactored Chat Component

**Before (Old Way)**:
```typescript
// Direct API calls in component
const [chats, setChats] = useState([]);

useEffect(() => {
  const client = new GraphApiClient(accessToken);
  const response = await client.getChats();
  setChats(response.value);
}, []);
```

**After (MVC Way)**:
```typescript
'use client';

import { useChat } from '@/frontend/hooks/useChat.hook';

export function ChatList() {
  const { chats, loading, error, selectChat } = useChat();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {chats.map(chat => (
        <div key={chat.id} onClick={() => selectChat(chat.id)}>
          {chat.getDisplayName()}
        </div>
      ))}
    </div>
  );
}
```

### 2. Using Authentication Hook

```typescript
'use client';

import { useAuth } from '@/frontend/hooks/useAuth.hook';

export function LoginButton() {
  const { isAuthenticated, loading, login, logout } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (isAuthenticated) {
    return <button onClick={logout}>Logout</button>;
  }

  return <button onClick={login}>Login</button>;
}
```

### 3. Using User Hook

```typescript
'use client';

import { useUser } from '@/frontend/hooks/useUser.hook';

export function UserProfile() {
  const { user, loading, updateStatus } = useUser();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user</div>;

  return (
    <div>
      <h2>{user.displayName}</h2>
      <p>{user.mail}</p>
      <button onClick={() => updateStatus('away')}>Set Away</button>
    </div>
  );
}
```

### 4. Using Chat Hook

```typescript
'use client';

import { useChat } from '@/frontend/hooks/useChat.hook';
import { useState } from 'react';

export function ChatWindow({ chatId }: { chatId: string }) {
  const { messages, selectedChat, loading, sendMessage } = useChat();
  const [messageText, setMessageText] = useState('');

  const handleSend = async () => {
    if (messageText.trim()) {
      await sendMessage(chatId, messageText);
      setMessageText('');
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={msg.isSender ? 'sent' : 'received'}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="input">
        <input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
```

## API Usage Examples

### Direct API Service Usage

If you need to make API calls outside of hooks:

```typescript
import { chatApiService } from '@/frontend/services/ChatApi.service';

// Get all chats
const response = await chatApiService.getAllChats();
if (response.success && response.data) {
  console.log(response.data);
}

// Send a message
const sendResponse = await chatApiService.sendMessage(chatId, 'Hello!');
if (sendResponse.success) {
  console.log('Message sent');
}
```

### Direct API Client Usage

For custom API calls:

```typescript
import { apiClient } from '@/frontend/services/ApiClient.service';

const response = await apiClient.get('/custom/endpoint');
if (response.success && response.data) {
  // Handle data
}
```

## Backend Usage Examples

### Creating a New Controller

1. Create a service:
```typescript
// backend/services/Notification.service.ts
export class NotificationService {
  async getNotifications(accessToken: string): Promise<NotificationModel[]> {
    // Business logic
  }
}
```

2. Create a controller:
```typescript
// backend/controllers/Notification.controller.ts
export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async getNotifications(request: NextRequest): Promise<NextResponse> {
    // Validate auth, call service, return response
  }
}
```

3. Create API route:
```typescript
// app/api/notifications/route.ts
import { NotificationController } from '@/backend/controllers/Notification.controller';
import { withErrorHandling } from '@/backend/middleware/error.middleware';
import { authMiddleware } from '@/backend/middleware/auth.middleware';

const controller = new NotificationController();

export const GET = withErrorHandling(async (request: NextRequest) => {
  return await authMiddleware(request, async (req) => {
    return await controller.getNotifications(req);
  });
});
```

### Creating a New Model

```typescript
// backend/models/Notification.model.ts
export interface INotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export class NotificationModel implements INotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;

  constructor(data: INotification) {
    this.id = data.id;
    this.title = data.title;
    this.message = data.message;
    this.timestamp = data.timestamp;
    this.read = data.read;
  }

  static validate(data: Partial<INotification>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data.id) errors.push('ID is required');
    if (!data.title) errors.push('Title is required');
    return { valid: errors.length === 0, errors };
  }

  toJSON(): INotification {
    return {
      id: this.id,
      title: this.title,
      message: this.message,
      timestamp: this.timestamp,
      read: this.read,
    };
  }
}
```

## Error Handling

### Backend Error Handling

Errors are automatically handled by middleware:

```typescript
// In service
throw new Error('Failed to fetch chats');

// In controller
try {
  // ... code
} catch (error) {
  return NextResponse.json(
    { error: 'Failed', message: error.message },
    { status: 500 }
  );
}
```

### Frontend Error Handling

Hooks automatically handle errors:

```typescript
const { error, loading } = useChat();

if (error) {
  return <div>Error: {error}</div>;
}
```

For manual error handling:

```typescript
try {
  const response = await chatApiService.getAllChats();
  if (!response.success) {
    console.error(response.error);
  }
} catch (error) {
  console.error('Request failed:', error);
}
```

## Authentication Flow

### Backend Authentication

All protected routes use auth middleware:

```typescript
export const GET = withErrorHandling(async (request) => {
  return await authMiddleware(request, async (req) => {
    // req.accessToken and req.userId are available
    return await controller.method(req);
  });
});
```

### Frontend Authentication

Use the `useAuth` hook:

```typescript
const { isAuthenticated, loading, login, logout } = useAuth();

if (!isAuthenticated) {
  return <LoginButton onClick={login} />;
}
```

## Migration Checklist

- [ ] Update components to use new hooks
- [ ] Replace direct API calls with service calls
- [ ] Update imports to use new paths
- [ ] Test all API endpoints
- [ ] Update error handling
- [ ] Test authentication flow

## Common Patterns

### Loading States

```typescript
const { loading, data } = useChat();

if (loading) return <LoadingSpinner />;
if (!data) return <EmptyState />;
return <DataDisplay data={data} />;
```

### Error States

```typescript
const { error, data } = useChat();

if (error) return <ErrorDisplay error={error} />;
return <DataDisplay data={data} />;
```

### Optimistic Updates

```typescript
const sendMessage = async (text: string) => {
  // Optimistically add message
  setMessages(prev => [...prev, optimisticMessage]);
  
  try {
    await chatApiService.sendMessage(chatId, text);
  } catch (error) {
    // Rollback on error
    setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
  }
};
```

## Best Practices

1. **Always use hooks** for state management in components
2. **Use services** for direct API calls outside hooks
3. **Handle errors** at the hook level for automatic UI updates
4. **Validate data** in models before processing
5. **Use middleware** for cross-cutting concerns
6. **Keep controllers thin** - delegate to services
7. **Keep services focused** - single responsibility
8. **Test each layer** independently

