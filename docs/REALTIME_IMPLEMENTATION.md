# Real-Time Chat Implementation Guide

## Overview

This document describes the real-time chat fetching implementation using all granted Microsoft Graph API permissions.

## Implementation Details

### 1. Permissions Configuration

All 19 granted permissions have been configured across the application:

**Files Updated:**
- `lib/msalConfig.ts` - Centralized permission list exported as `graphApiScopes`
- `backend/services/TokenExchange.service.ts` - Token exchange with all permissions
- `backend/controllers/TokenExchange.controller.ts` - API endpoints with all permissions
- `lib/tokenExchangeUtils.ts` - Client-side token utilities
- `lib/authUtils.ts` - Authentication utilities
- `lib/authWithAuthorizationCode.ts` - Authorization code flow

### 2. Real-Time Chat Fetching

#### Chat List Updates (`components/TeamsChannelList.tsx`)

**Polling Strategy:**
- **Active Mode:** Polls every **5 seconds** when a chat is selected
- **Idle Mode:** Polls every **15 seconds** when no chat is selected
- Automatically adjusts based on user activity

**Implementation:**
```typescript
// Real-time refresh: Poll every 5 seconds for active chats, 15 seconds when idle
let pollInterval = 5000; // 5 seconds for real-time updates
let lastActivity = Date.now();

const interval = setInterval(() => {
  const timeSinceActivity = Date.now() - lastActivity;
  // If user is active (selected a chat), poll more frequently
  if (selectedChatId && timeSinceActivity < 60000) {
    pollInterval = 5000; // 5 seconds when active
  } else {
    pollInterval = 15000; // 15 seconds when idle
  }
  
  fetchData();
}, pollInterval);
```

#### Message Updates (`app/dashboard/page.tsx` and `app/page.tsx`)

**Polling Strategy:**
- Polls every **3 seconds** when a chat is selected
- Only fetches when chat is active and user is authenticated
- Automatically stops when chat is deselected

**Implementation:**
```typescript
// Real-time message refresh: Poll every 3 seconds for active chat
const interval = setInterval(() => {
  if (selectedChatId && isAuthenticated) {
    fetchMessages();
  }
}, 3000); // 3 seconds for real-time updates
```

### 3. Enhanced Graph API Methods

#### Chat Fetching (`lib/graphApi.ts`)

**Enhanced `getChats()` Method:**
- Includes members expansion for richer data
- Orders by last updated time (most recent first)
- Limits to 50 chats per request

```typescript
async getChats(): Promise<{ value: GraphChat[] }> {
  const endpoint = `${graphConfig.graphChatsEndpoint}?$expand=members&$top=50&$orderby=lastUpdatedDateTime desc`;
  return this.makeRequest<{ value: GraphChat[] }>(endpoint);
}
```

**New `getChatsDelta()` Method:**
- Uses delta queries for efficient updates
- Only fetches changed chats
- Supports delta tokens for pagination

```typescript
async getChatsDelta(deltaToken?: string): Promise<{ value: GraphChat[]; '@odata.deltaLink'?: string }> {
  let endpoint = `${graphConfig.graphChatsEndpoint}/delta?$expand=members&$top=50`;
  if (deltaToken) {
    endpoint = deltaToken;
  }
  return this.makeRequest<{ value: GraphChat[]; '@odata.deltaLink'?: string }>(endpoint);
}
```

#### Message Fetching (`lib/graphApi.ts`)

**Enhanced `getChatMessages()` Method:**
- Includes sender information via `$expand=from`
- Orders by creation time (newest first)
- Configurable limit (default: 50 messages)

```typescript
async getChatMessages(chatId: string, top: number = 50): Promise<{ value: any[] }> {
  const endpoint = `https://graph.microsoft.com/v1.0/chats/${chatId}/messages?$expand=from&$top=${top}&$orderby=createdDateTime desc`;
  return this.makeRequest<{ value: any[] }>(endpoint);
}
```

**New `getChatMessagesSince()` Method:**
- Fetches only messages created after a specific time
- Useful for incremental updates
- Reduces API calls by fetching only new messages

```typescript
async getChatMessagesSince(chatId: string, sinceDateTime: string): Promise<{ value: any[] }> {
  const endpoint = `https://graph.microsoft.com/v1.0/chats/${chatId}/messages?$expand=from&$filter=createdDateTime ge ${sinceDateTime}&$orderby=createdDateTime desc`;
  return this.makeRequest<{ value: any[] }>(endpoint);
}
```

## Performance Optimizations

### 1. Adaptive Polling
- Faster polling when user is active
- Slower polling when idle to reduce API calls
- Automatically adjusts based on user interaction

### 2. Efficient Data Fetching
- Uses `$expand` to get related data in single request
- Uses `$orderby` to get most recent data first
- Uses `$top` to limit response size
- Supports delta queries for incremental updates

### 3. Conditional Fetching
- Only fetches when user is authenticated
- Only fetches messages when chat is selected
- Stops polling when component unmounts

## API Rate Limiting Considerations

Microsoft Graph API has rate limits:
- **Default:** 10,000 requests per 10 minutes per app per tenant
- **Burst:** Up to 1,000 requests per 10 seconds

**Current Implementation:**
- Chat list: 5-15 second intervals = 4-12 requests/minute
- Messages: 3 second intervals = 20 requests/minute
- **Total:** ~24-32 requests/minute per active user

**Recommendations:**
1. Monitor API usage in production
2. Implement exponential backoff on errors
3. Consider using delta queries for chat list updates
4. Cache data locally to reduce API calls
5. Use change notifications for production (webhooks)

## Future Enhancements

### 1. Microsoft Graph Change Notifications
For production, implement webhooks instead of polling:
- Subscribe to chat and message changes
- Receive real-time notifications
- Reduces API calls significantly

### 2. Delta Queries
Implement delta queries for chat list:
- Track delta tokens
- Only fetch changed chats
- More efficient than full refresh

### 3. Message Incremental Updates
Use `getChatMessagesSince()` for messages:
- Track last message timestamp
- Only fetch new messages
- Append to existing messages

### 4. Presence Integration
Use `Presence.Read` and `Presence.Read.All` permissions:
- Show user online/offline status
- Update in real-time
- Enhance user experience

## Testing

### Manual Testing Checklist

1. **Chat List Updates:**
   - [ ] Verify chats refresh every 5-15 seconds
   - [ ] Verify new chats appear automatically
   - [ ] Verify chat order updates based on activity

2. **Message Updates:**
   - [ ] Verify messages refresh every 3 seconds
   - [ ] Verify new messages appear automatically
   - [ ] Verify message order is correct (newest last)

3. **Performance:**
   - [ ] Monitor network tab for API calls
   - [ ] Verify no excessive API calls
   - [ ] Check for rate limiting errors

4. **Error Handling:**
   - [ ] Test with invalid token
   - [ ] Test with network errors
   - [ ] Verify graceful error handling

## Monitoring

### Key Metrics to Monitor

1. **API Call Frequency:**
   - Chat list refresh rate
   - Message refresh rate
   - Total API calls per user

2. **Error Rates:**
   - 401 (Unauthorized) errors
   - 429 (Too Many Requests) errors
   - 500 (Server Error) errors

3. **Performance:**
   - Average response time
   - Time to display new messages
   - Time to update chat list

## Troubleshooting

### Common Issues

1. **High API Call Rate:**
   - Increase polling intervals
   - Implement delta queries
   - Add local caching

2. **Messages Not Updating:**
   - Check authentication token
   - Verify permissions are granted
   - Check network connectivity

3. **Rate Limiting Errors:**
   - Implement exponential backoff
   - Reduce polling frequency
   - Use change notifications

## References

- [Microsoft Graph API Rate Limits](https://learn.microsoft.com/en-us/graph/throttling)
- [Chat API Documentation](https://learn.microsoft.com/en-us/graph/api/resources/chat)
- [Delta Queries](https://learn.microsoft.com/en-us/graph/delta-query-overview)
- [Change Notifications](https://learn.microsoft.com/en-us/graph/webhooks)

