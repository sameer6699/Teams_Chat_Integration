# Teams Chat Integration - MVC Architecture Documentation

## Overview

This project follows a **Model-View-Controller (MVC)** architecture pattern, providing clear separation of concerns between data models, business logic, and user interface components.

## Project Structure

```
├── backend/                    # Backend MVC Architecture
│   ├── models/                 # Data Models (M)
│   │   ├── User.model.ts
│   │   ├── Chat.model.ts
│   │   ├── Message.model.ts
│   │   ├── Team.model.ts
│   │   ├── Project.model.ts
│   │   └── index.ts
│   ├── services/               # Business Logic Layer (Service)
│   │   ├── Auth.service.ts
│   │   ├── GraphApi.service.ts
│   │   ├── Chat.service.ts
│   │   ├── User.service.ts
│   │   ├── Team.service.ts
│   │   └── index.ts
│   ├── controllers/            # Controllers (C)
│   │   ├── Auth.controller.ts
│   │   ├── Chat.controller.ts
│   │   ├── User.controller.ts
│   │   ├── Team.controller.ts
│   │   └── index.ts
│   └── middleware/             # Middleware
│       ├── auth.middleware.ts
│       └── error.middleware.ts
│
├── frontend/                    # Frontend MVC Architecture
│   ├── services/               # API Client Services
│   │   ├── ApiClient.service.ts
│   │   ├── AuthApi.service.ts
│   │   ├── UserApi.service.ts
│   │   ├── ChatApi.service.ts
│   │   ├── TeamApi.service.ts
│   │   └── index.ts
│   └── hooks/                  # React Hooks (View Logic)
│       ├── useAuth.hook.ts
│       ├── useChat.hook.ts
│       ├── useUser.hook.ts
│       ├── useTeam.hook.ts
│       └── index.ts
│
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes (Backend Entry Points)
│   │   ├── auth/
│   │   ├── user/
│   │   ├── chats/
│   │   └── teams/
│   └── [pages]                 # Frontend Pages (Views)
│
└── components/                  # React Components (Views)
    ├── ui/                     # Reusable UI Components
    └── [feature components]    # Feature-specific Components
```

## Architecture Layers

### 1. Backend - Models (M)

**Location**: `backend/models/`

Models represent the data structure and validation logic. Each model:

- Defines the data structure (interfaces)
- Implements validation logic
- Provides transformation methods (e.g., from Graph API)
- Handles serialization/deserialization

**Example**: `User.model.ts`

```typescript
export interface IUser {
  id: string;
  displayName: string;
  mail: string;
  // ... other fields
}

export class UserModel implements IUser {
  // Validation, transformation, and serialization methods
}
```

### 2. Backend - Services (Business Logic)

**Location**: `backend/services/`

Services contain the business logic and orchestrate operations:

- **AuthService**: Handles authentication and token management
- **GraphApiService**: Wraps Microsoft Graph API calls
- **ChatService**: Business logic for chat operations
- **UserService**: User-related business logic
- **TeamService**: Team-related business logic

**Example**: `Chat.service.ts`

```typescript
export class ChatService {
  async getAllChats(accessToken: string): Promise<ChatModel[]> {
    // Business logic: fetch, enrich, sort chats
  }
}
```

### 3. Backend - Controllers (C)

**Location**: `backend/controllers/`

Controllers handle HTTP requests and responses:

- Parse request data
- Validate input
- Call appropriate services
- Format responses
- Handle errors

**Example**: `Chat.controller.ts`

```typescript
export class ChatController {
  async getChats(request: NextRequest): Promise<NextResponse> {
    // Validate auth, call service, return response
  }
}
```

### 4. Backend - API Routes

**Location**: `app/api/`

Next.js API routes that connect HTTP requests to controllers:

- Route definitions
- Request/response handling
- Middleware integration

**Example**: `app/api/chats/route.ts`

```typescript
export const GET = withErrorHandling(async (request) => {
  return await authMiddleware(request, async (req) => {
    return await chatController.getChats(req);
  });
});
```

### 5. Backend - Middleware

**Location**: `backend/middleware/`

- **auth.middleware.ts**: Validates authentication
- **error.middleware.ts**: Centralized error handling

### 6. Frontend - Services (API Clients)

**Location**: `frontend/services/`

Frontend services handle API communication:

- **ApiClient.service.ts**: Base HTTP client with interceptors
- **AuthApi.service.ts**: Authentication API calls
- **ChatApi.service.ts**: Chat API calls
- **UserApi.service.ts**: User API calls
- **TeamApi.service.ts**: Team API calls

### 7. Frontend - Hooks (View Logic)

**Location**: `frontend/hooks/`

React hooks that manage component state and API interactions:

- **useAuth.hook.ts**: Authentication state
- **useChat.hook.ts**: Chat operations and state
- **useUser.hook.ts**: User operations and state
- **useTeam.hook.ts**: Team operations and state

### 8. Frontend - Views (Components)

**Location**: `components/` and `app/`

React components that render the UI:

- Presentational components
- Container components
- Page components

## Data Flow

### Request Flow (Frontend → Backend)

1. **User Action** → Component triggers hook
2. **Hook** → Calls frontend service
3. **Frontend Service** → Makes HTTP request to API route
4. **API Route** → Applies middleware, calls controller
5. **Controller** → Validates, calls service
6. **Service** → Executes business logic, calls Graph API
7. **Response** → Returns through same layers

### Response Flow (Backend → Frontend)

1. **Service** → Returns model/data
2. **Controller** → Formats response
3. **API Route** → Returns JSON
4. **Frontend Service** → Parses response
5. **Hook** → Updates state
6. **Component** → Re-renders with new data

## Key Design Patterns

### 1. Dependency Injection

Services are injected into controllers:

```typescript
export class ChatController {
  private chatService: ChatService;
  
  constructor() {
    this.chatService = new ChatService();
  }
}
```

### 2. Error Handling

Centralized error handling via middleware:

```typescript
export const GET = withErrorHandling(async (request) => {
  // Route handler
});
```

### 3. Authentication Middleware

Reusable authentication validation:

```typescript
export const GET = withErrorHandling(async (request) => {
  return await authMiddleware(request, async (req) => {
    // Protected route handler
  });
});
```

### 4. Service Layer Pattern

Business logic separated from HTTP concerns:

- Controllers handle HTTP
- Services handle business logic
- Models handle data structure

## API Endpoints

### Authentication

- `GET /api/auth/status` - Get authentication status
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/token` - Get access token

### User

- `GET /api/user/me` - Get current user
- `PATCH /api/user/status` - Update user status

### Chats

- `GET /api/chats` - Get all chats
- `GET /api/chats/[id]` - Get chat by ID
- `GET /api/chats/[id]/messages` - Get chat messages
- `POST /api/chats/[id]/messages` - Send message
- `POST /api/chats/[id]/read` - Mark chat as read

### Teams

- `GET /api/teams` - Get all teams
- `GET /api/teams/[id]` - Get team by ID

## Best Practices

### 1. Model Validation

Always validate data in models:

```typescript
static validate(data: Partial<IUser>): { valid: boolean; errors: string[] }
```

### 2. Service Error Handling

Services should throw meaningful errors:

```typescript
throw new Error('Failed to fetch chats');
```

### 3. Controller Response Format

Consistent response format:

```typescript
{
  success: boolean,
  data?: T,
  error?: string,
  message?: string
}
```

### 4. Frontend Service Error Handling

Frontend services handle errors gracefully:

```typescript
catch (error) {
  return {
    success: false,
    error: 'Request failed',
    message: error.message
  };
}
```

### 5. Hook State Management

Hooks manage loading, error, and data states:

```typescript
const [data, setData] = useState<T | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

## Testing Strategy

### Unit Tests

- **Models**: Test validation and transformation
- **Services**: Test business logic
- **Controllers**: Test request/response handling

### Integration Tests

- **API Routes**: Test full request/response cycle
- **Frontend Services**: Test API integration
- **Hooks**: Test state management

## Future Enhancements

1. **Repository Pattern**: Add data access layer
2. **Caching Layer**: Implement Redis for caching
3. **Real-time Updates**: WebSocket integration
4. **Validation Library**: Use Zod for schema validation
5. **Logging**: Structured logging service
6. **Metrics**: Performance monitoring

## Migration Guide

### From Old Structure

1. Move API calls from components to services
2. Extract business logic to service layer
3. Create models for data structures
4. Refactor hooks to use new services
5. Update components to use new hooks

## Conclusion

This MVC architecture provides:

- ✅ **Separation of Concerns**: Clear boundaries between layers
- ✅ **Maintainability**: Easy to locate and modify code
- ✅ **Testability**: Each layer can be tested independently
- ✅ **Scalability**: Easy to add new features
- ✅ **Reusability**: Services and models can be reused

