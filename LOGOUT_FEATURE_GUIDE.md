# Logout Feature Implementation Guide

## Overview
The logout functionality has been implemented with two dropdown menus that provide a professional, Teams-style user experience.

## Features Implemented

### 1. **Three Dots Menu (More Options)**
Located in the top header bar next to action buttons.

**Features:**
- ✅ Click to open dropdown menu
- ✅ Displays user information at top
- ✅ Settings navigation
- ✅ Profile option
- ✅ Help & Support option
- ✅ **Logout button** (red, highlighted)
- ✅ Click outside to close
- ✅ Smooth animations

### 2. **User Avatar Menu**
Located at the top-right corner of the header.

**Features:**
- ✅ Click avatar to open enhanced dropdown
- ✅ Beautiful gradient header with user info
- ✅ My Profile option with description
- ✅ Settings with description
- ✅ Admin Consent navigation
- ✅ Help & Support
- ✅ **Logout button** (red, highlighted)
- ✅ Smooth animations and hover effects

## Implementation Details

### Component Structure

```
components/
├── TeamsHeader.tsx         # Main header with both dropdowns
└── UserMenuDropdown.tsx    # Reusable user menu dropdown
```

### TeamsHeader Component

**Location:** `components/TeamsHeader.tsx`

**Key Features:**
1. **Three Dots Dropdown**
   - Lines 82-162
   - Triggered by MoreHorizontal icon button
   - Contains Settings, Profile, Help & Support, and Logout

2. **User Avatar Dropdown**
   - Lines 165-167
   - Uses `UserMenuDropdown` component
   - Enhanced UI with more detailed options

**State Management:**
```typescript
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const dropdownRef = useRef<HTMLDivElement>(null);
```

**Click Outside Handler:**
```typescript
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };
  // ... event listener setup
}, [isDropdownOpen]);
```

**Logout Handler:**
```typescript
const handleLogout = async () => {
  try {
    setIsDropdownOpen(false);
    await logout();
    router.push('/');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
```

### UserMenuDropdown Component

**Location:** `components/UserMenuDropdown.tsx`

**Features:**
- Standalone reusable component
- Enhanced visual design
- Detailed menu items with descriptions
- Smooth animations
- Click-outside-to-close functionality

**Menu Items:**
1. **User Info Header**
   - Shows avatar, name, and email
   - Gradient background (indigo to purple)

2. **My Profile**
   - Icon: User
   - Description: "View and edit profile"

3. **Settings**
   - Icon: Settings
   - Description: "Preferences and privacy"
   - Navigates to `/settings`

4. **Admin Consent**
   - Icon: Shield
   - Description: "Manage permissions"
   - Navigates to `/admin-consent`

5. **Help & Support**
   - Icon: HelpCircle
   - Description: "Get help and support"

6. **Logout** (Red highlighted)
   - Icon: LogOut
   - Action: Logs out user and redirects

## User Flow

### Logout Process

```
User clicks 3-dots or Avatar
    ↓
Dropdown menu appears
    ↓
User clicks "Logout"
    ↓
Dropdown closes
    ↓
logout() function called (from AuthContext)
    ↓
MSAL logout executed
    ↓
User session cleared
    ↓
Redirect to login page (/)
    ↓
User sees login screen
```

## Authentication Context Integration

The logout feature uses the `useAuth()` hook from `lib/authContext.tsx`:

```typescript
const { user, logout } = useAuth();
```

**Logout Function:**
```typescript
const logout = async () => {
  try {
    setLoading(true);
    await msalInstance.logoutRedirect({
      postLogoutRedirectUri: process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI || 'http://localhost:3000',
    });
    setUser(null);
    setIsAuthenticated(false);
  } catch (error) {
    console.error('Logout failed:', error);
    setLoading(false);
  }
};
```

## Visual Design

### Three Dots Menu
```
┌────────────────────────┐
│ 👤  Dev Apps           │
│     devapps@meldep.com │
├────────────────────────┤
│ ⚙️  Settings           │
│ 👤  Profile            │
│ ❓  Help & Support     │
├────────────────────────┤
│ 🚪  Logout             │ (Red)
└────────────────────────┘
```

### User Avatar Menu
```
┌──────────────────────────────┐
│  [Gradient Header]           │
│  👤  Dev Apps                │
│      devapps@meldep.com      │
├──────────────────────────────┤
│ 👤  My Profile               │
│     View and edit profile    │
│                              │
│ ⚙️  Settings                 │
│     Preferences and privacy  │
│                              │
│ 🛡️  Admin Consent            │
│     Manage permissions       │
│                              │
│ ❓  Help & Support           │
│     Get help and support     │
├──────────────────────────────┤
│ 🚪  Logout                   │ (Red)
└──────────────────────────────┘
```

## Styling

### Colors
- **Background:** `bg-white`
- **Border:** `border-gray-200`
- **Shadow:** `shadow-lg` / `shadow-xl`
- **Hover:** `hover:bg-gray-50` / `hover:bg-indigo-50`
- **Logout Button:**
  - Text: `text-red-600`
  - Hover BG: `hover:bg-red-50`

### Animations
- Fade in/out transitions
- Smooth hover effects
- Ring animation on active state

### Accessibility
- Proper button roles
- Title attributes for tooltips
- Keyboard navigation support
- Focus states
- ARIA labels (can be added if needed)

## Usage Example

### In Dashboard Page
```typescript
import { TeamsHeader } from '@/components/TeamsHeader';

export default function DashboardPage() {
  return (
    <div className="flex h-screen">
      <TeamsHeader
        channelName="Meld-Ep Redesign"
        membersCount={4}
      />
      {/* Rest of dashboard */}
    </div>
  );
}
```

### Standalone User Menu
```typescript
import { UserMenuDropdown } from '@/components/UserMenuDropdown';

export default function SomeComponent() {
  return (
    <div className="flex items-center gap-2">
      <span>Welcome!</span>
      <UserMenuDropdown />
    </div>
  );
}
```

## Security Considerations

1. **MSAL Logout:** Uses Microsoft Authentication Library's secure logout
2. **Session Clearing:** Properly clears user state
3. **Redirect:** Ensures user is redirected to login page
4. **Token Cleanup:** MSAL handles token cleanup automatically

## Testing Checklist

- [ ] Click three dots button to open dropdown
- [ ] Click outside dropdown to close
- [ ] Click logout button
- [ ] Verify user is logged out
- [ ] Verify redirect to login page
- [ ] Click avatar to open user menu
- [ ] Test all menu items navigation
- [ ] Verify logout from avatar menu
- [ ] Test on different screen sizes
- [ ] Test keyboard navigation

## Troubleshooting

### Dropdown doesn't close
**Solution:** Ensure `useEffect` cleanup is properly removing event listeners

### Logout doesn't redirect
**Solution:** Check `postLogoutRedirectUri` in MSAL config and `.env` file

### User stays logged in
**Solution:** Verify MSAL instance is properly clearing tokens

### Menu appears under other elements
**Solution:** Ensure dropdown has high `z-index` (currently `z-50`)

## Future Enhancements

- [ ] Add keyboard shortcuts (e.g., Ctrl+Shift+L for logout)
- [ ] Add logout confirmation modal
- [ ] Add "Remember me" option
- [ ] Add session timeout warning
- [ ] Add recent activity in dropdown
- [ ] Add quick status change
- [ ] Add theme toggle
- [ ] Add language selector

## Related Files

- `lib/authContext.tsx` - Authentication logic
- `lib/msalConfig.ts` - MSAL configuration
- `lib/authUtils.ts` - Auth utility functions
- `components/AuthGuard.tsx` - Route protection
- `app/dashboard/page.tsx` - Dashboard implementation

## Support

For issues or questions:
1. Check MSAL documentation
2. Review auth context implementation
3. Check browser console for errors
4. Verify environment variables
5. Test with different browsers

