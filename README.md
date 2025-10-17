# Teams Chat Integration

A modern Teams-style chat application with Microsoft Entra (Azure AD) authentication and Microsoft Graph API integration.

## Features

- 🔐 Microsoft Entra (Azure AD) authentication
- 💬 Teams-style chat interface
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS
- 🔄 Real-time chat capabilities
- 👥 User management
- 📊 Project management interface

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Microsoft Azure account
- Microsoft Entra (Azure AD) application registration

## Setup Instructions

### 1. Microsoft Entra (Azure AD) Configuration

You've already completed this step! Here are your credentials:

- **Application (client) ID**: `9538fc54-821c-42da-b17f-51877d56db5a`
- **Directory (tenant) ID**: `6ae3d026-e965-483e-8309-8f8f3aca71c8`
- **Object ID**: `2867e8d5-a8c9-4081-a066-51e2150aed9d`
- **Display Name**: `Teams-Chat-Integration`

### 2. Environment Configuration

The application is already configured with your Azure AD credentials in `.env.local`:

```env
NEXT_PUBLIC_AZURE_CLIENT_ID=9538fc54-821c-42da-b17f-51877d56db5a
NEXT_PUBLIC_AZURE_TENANT_ID=6ae3d026-e965-483e-8309-8f8f3aca71c8
NEXT_PUBLIC_AZURE_REDIRECT_URI=http://localhost:3000
NEXT_PUBLIC_AZURE_SCOPE=https://graph.microsoft.com/.default
NEXT_PUBLIC_APP_NAME=Teams-Chat-Integration
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Flow

1. When users visit the application, they'll see a login screen
2. Clicking "Sign in with Microsoft" opens a Microsoft authentication popup
3. Users authenticate with their Microsoft account
4. Upon successful authentication, they're redirected to the main chat interface
5. The user profile is displayed in the top-right corner with logout option

## Microsoft Graph API Integration

The application integrates with Microsoft Graph API to:

- Get current user information
- Fetch Teams chats
- Retrieve Teams data
- Send messages to Teams chats

### Required Permissions

Make sure your Azure AD application has the following Microsoft Graph permissions:

- `User.Read` - Read user profile
- `Chat.Read` - Read Teams chats
- `Chat.ReadWrite` - Read and write Teams chats
- `TeamsAppInstallation.ReadWriteForUser` - Manage Teams app installations

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with auth provider
│   ├── page.tsx           # Main page with auth guard
│   └── chat/              # Chat pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── AuthGuard.tsx     # Authentication guard
│   ├── LoginButton.tsx   # Login button component
│   ├── UserProfile.tsx   # User profile dropdown
│   └── ...               # Other components
├── lib/                  # Utility libraries
│   ├── msalConfig.ts     # MSAL configuration
│   ├── authContext.tsx   # Authentication context
│   └── graphApi.ts       # Microsoft Graph API client
├── hooks/                # Custom React hooks
│   └── useGraphApi.ts    # Graph API hook
└── .env.local           # Environment variables
```

## Key Components

### Authentication
- **AuthProvider**: Provides authentication context to the entire app
- **AuthGuard**: Protects routes and shows login screen when not authenticated
- **LoginButton**: Handles Microsoft authentication
- **UserProfile**: Displays user info and logout option

### Microsoft Graph Integration
- **GraphApiClient**: Handles all Microsoft Graph API calls
- **useGraphApi**: React hook for easy Graph API integration

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Create components in the `components/` directory
2. Add API calls in `lib/graphApi.ts`
3. Create custom hooks in `hooks/` directory
4. Update the main page or create new pages in `app/`

## Troubleshooting

### Common Issues

1. **Authentication not working**: Check that your Azure AD app has the correct redirect URI
2. **Graph API calls failing**: Verify that the required permissions are granted
3. **Environment variables not loading**: Ensure `.env.local` is in the root directory

### Debug Mode

Enable debug logging by adding to your environment variables:

```env
NEXT_PUBLIC_DEBUG=true
```

## Security Notes

- Never commit `.env.local` to version control
- Ensure your Azure AD app has appropriate permissions
- Use HTTPS in production
- Regularly rotate client secrets

## Next Steps

1. **Deploy to Production**: Set up production environment with proper HTTPS
2. **Add Real-time Features**: Implement WebSocket connections for live chat
3. **Enhanced UI**: Add more Teams-like features and animations
4. **Mobile Support**: Optimize for mobile devices
5. **File Sharing**: Add file upload and sharing capabilities

## Support

For issues related to:
- Microsoft Entra/Azure AD: Check the [Microsoft Entra documentation](https://docs.microsoft.com/en-us/azure/active-directory/)
- Microsoft Graph API: Check the [Graph API documentation](https://docs.microsoft.com/en-us/graph/)
- This application: Check the code comments and component documentation
