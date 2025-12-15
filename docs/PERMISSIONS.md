# Microsoft Graph API Permissions Documentation

This document describes all the Microsoft Graph API permissions granted for the Teams Chat Integration application.

## Overview

The application has been granted **19 delegated permissions** under Microsoft Graph API. All permissions are currently **Granted for MeldEP** and are ready to use.

## Permission Categories

### 1. Chat Permissions

#### Chat.Read
- **Type:** Delegated
- **Description:** Read user chat messages
- **Admin Consent Required:** No
- **Status:** ✅ Granted
- **Usage:** Allows the application to read chat messages that the signed-in user has access to.

#### Chat.ReadBasic
- **Type:** Delegated
- **Description:** Read names and members of user chat threads
- **Admin Consent Required:** No
- **Status:** ✅ Granted
- **Usage:** Allows reading basic information about chat threads (names, members) without message content.

#### Chat.ReadWrite
- **Type:** Delegated
- **Description:** Read and write user chat messages
- **Admin Consent Required:** No
- **Status:** ✅ Granted
- **Usage:** Allows reading and writing chat messages for the signed-in user.

#### Chat.ReadWrite.All
- **Type:** Delegated
- **Description:** Read and write all chat messages
- **Admin Consent Required:** Yes
- **Status:** ✅ Granted
- **Usage:** Allows reading and writing all chat messages in the organization (requires admin consent).

#### Chat.Create
- **Type:** Delegated
- **Description:** Create chats
- **Admin Consent Required:** No
- **Status:** ✅ Granted
- **Usage:** Allows creating new chat conversations.

### 2. Chat Message Permissions

#### ChatMessage.Read
- **Type:** Delegated
- **Description:** Read user chat messages
- **Admin Consent Required:** No
- **Status:** ✅ Granted
- **Usage:** Allows reading individual chat messages.

#### ChatMessage.Send
- **Type:** Delegated
- **Description:** Send user chat messages
- **Admin Consent Required:** No
- **Status:** ✅ Granted
- **Usage:** Allows sending messages in chat conversations.

### 3. Channel Permissions

#### Channel.ReadBasic.All
- **Type:** Delegated
- **Description:** Read the names and descriptions of channels
- **Admin Consent Required:** No
- **Status:** ✅ Granted
- **Usage:** Allows reading basic information about Teams channels (names, descriptions).

#### ChannelMessage.Read.All
- **Type:** Delegated
- **Description:** Read user channel messages
- **Admin Consent Required:** Yes
- **Status:** ✅ Granted
- **Usage:** Allows reading messages from Teams channels.

#### ChannelMessage.Send
- **Type:** Delegated
- **Description:** Send channel messages
- **Admin Consent Required:** No
- **Status:** ✅ Granted
- **Usage:** Allows sending messages to Teams channels.

### 4. Team Permissions

#### Team.ReadBasic.All
- **Type:** Delegated
- **Description:** Read the names and descriptions of teams
- **Admin Consent Required:** No
- **Status:** ✅ Granted
- **Usage:** Allows reading basic information about Teams (names, descriptions).

### 5. User Permissions

#### User.Read
- **Type:** Delegated
- **Description:** Sign in and read user profile
- **Admin Consent Required:** No
- **Status:** ✅ Granted
- **Usage:** Allows users to sign in and read their own profile information.

#### User.ReadBasic.All
- **Type:** Delegated
- **Description:** Read all users' basic profiles
- **Admin Consent Required:** No
- **Status:** ✅ Granted
- **Usage:** Allows reading basic profile information for all users in the organization.

#### User.Read.All
- **Type:** Delegated
- **Description:** Read all users' full profiles
- **Admin Consent Required:** Yes
- **Status:** ✅ Granted
- **Usage:** Allows reading full profile information for all users in the organization (requires admin consent).

### 6. Presence Permissions

#### Presence.Read
- **Type:** Delegated
- **Description:** Read user's presence information
- **Admin Consent Required:** No
- **Status:** ✅ Granted
- **Usage:** Allows reading the signed-in user's presence status (online, away, busy, offline).

#### Presence.Read.All
- **Type:** Delegated
- **Description:** Read presence information of all users in your organization
- **Admin Consent Required:** No
- **Status:** ✅ Granted
- **Usage:** Allows reading presence information for all users in the organization.

### 7. Standard OAuth Permissions

#### openid
- **Type:** Delegated
- **Description:** Sign users in
- **Admin Consent Required:** No
- **Status:** ✅ Granted
- **Usage:** Standard OAuth 2.0 permission for OpenID Connect authentication.

#### email
- **Type:** Delegated
- **Description:** View users' email address
- **Admin Consent Required:** No
- **Status:** ✅ Granted
- **Usage:** Allows accessing the user's email address.

#### offline_access
- **Type:** Delegated
- **Description:** Maintain access to data you have given it access to
- **Admin Consent Required:** No
- **Status:** ✅ Granted
- **Usage:** Allows the application to refresh access tokens, enabling offline access.

## API Endpoints Enabled

With these permissions, the application can access:

### Chat Endpoints
- `GET /me/chats` - List all chats for the user
- `GET /chats/{chat-id}` - Get specific chat details
- `GET /chats/{chat-id}/messages` - Get messages from a chat
- `POST /chats/{chat-id}/messages` - Send a message to a chat
- `POST /chats` - Create a new chat

### Channel Endpoints
- `GET /teams/{team-id}/channels` - List channels in a team
- `GET /teams/{team-id}/channels/{channel-id}/messages` - Get channel messages
- `POST /teams/{team-id}/channels/{channel-id}/messages` - Send channel message

### User Endpoints
- `GET /me` - Get current user profile
- `GET /users` - List users (with User.Read.All)
- `GET /users/{user-id}` - Get specific user profile

### Presence Endpoints
- `GET /me/presence` - Get current user's presence
- `GET /users/{user-id}/presence` - Get user's presence (with Presence.Read.All)

## Implementation Notes

1. **Admin Consent Required Permissions:**
   - ChannelMessage.Read.All
   - Chat.ReadWrite.All
   - User.Read.All
   
   These require admin consent and have been granted at the tenant level.

2. **Real-time Updates:**
   - Use polling with appropriate intervals (5-10 seconds for active chats)
   - Consider implementing Microsoft Graph change notifications for production
   - Use delta queries where available for efficient updates

3. **Best Practices:**
   - Request only necessary permissions
   - Handle permission errors gracefully
   - Implement token refresh for offline_access
   - Cache data appropriately to reduce API calls

## Security Considerations

- All permissions are **Delegated**, meaning they operate on behalf of the signed-in user
- The application cannot access data without user consent
- Admin consent has been granted for organization-wide permissions
- Access tokens should be stored securely and refreshed before expiration

## References

- [Microsoft Graph Permissions Reference](https://learn.microsoft.com/en-us/graph/permissions-reference)
- [Chat API Documentation](https://learn.microsoft.com/en-us/graph/api/resources/chat)
- [Channel API Documentation](https://learn.microsoft.com/en-us/graph/api/resources/channel)

