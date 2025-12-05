# Teams-Style UI Guide

## Overview
This application now features a Microsoft Teams-inspired user interface with a modern, professional design.

## Components

### 1. **TeamsNavRail** (`components/TeamsNavRail.tsx`)
- **Purpose**: Left-side vertical navigation rail
- **Features**:
  - Teams-style purple/indigo color scheme (#464775 background)
  - Icon-based navigation for Activity, Chat, Teams, Calendar, Calls, Files
  - Active state indicator with left border accent
  - Bottom section for Settings and More options
  - Brand logo at the top

### 2. **TeamsChannelList** (`components/TeamsChannelList.tsx`)
- **Purpose**: Middle panel showing projects/channels list
- **Features**:
  - User profile card with welcome message
  - Project and message statistics
  - Search functionality for filtering projects
  - Filter tabs (All, Active, Archived)
  - Notifications section with bell icons
  - Project cards with:
    - Colored avatar initials
    - Project name and status
    - Unread message badges
    - Tag badges (Active, Review, Planning)
    - Client/Owner/Team information
  - Collapsible sections with chevron icons

### 3. **TeamsHeader** (`components/TeamsHeader.tsx`)
- **Purpose**: Top header bar for the main chat area
- **Features**:
  - Channel/Project name display
  - Online members count
  - Member avatars in a row
  - Action buttons:
    - Video call
    - Audio call
    - Add members
    - More options
  - User profile avatar on the right

### 4. **TeamsChatArea** (`components/TeamsChatArea.tsx`)
- **Purpose**: Main chat/message display and compose area
- **Features**:
  - Message thread with timestamps
  - User avatars with gradient colors
  - Date dividers ("Today")
  - Hover effects on messages showing:
    - Reply option
    - React option
    - More options menu
  - Rich text compose area with:
    - Formatting toolbar (Bold, Italic, Underline)
    - Attach file button
    - Mention (@) button
    - Emoji button
    - Send button that activates when text is entered
  - Enter key to send, Shift+Enter for new line

## Color Scheme

### Primary Colors
- **Navigation Rail**: `#464775` (purple-gray)
- **Active/Accent**: `#6264a7` (Teams purple)
- **Background**: `#f5f5f5` (light gray)
- **White panels**: `#ffffff`

### Gradient Colors for Avatars
- Purple to Indigo: `from-purple-400 to-indigo-500`
- Blue to Cyan: `from-blue-400 to-cyan-500`
- Green to Emerald: `from-green-400 to-emerald-500`
- Yellow to Orange: `from-yellow-400 to-orange-500`
- Pink to Rose: `from-pink-400 to-rose-500`
- Red to Pink: `from-red-400 to-pink-500`

### Status Colors
- **Active**: Green (`bg-green-100 text-green-700`)
- **Review**: Yellow (`bg-yellow-100 text-yellow-700`)
- **Planning**: Blue (`bg-blue-100 text-blue-700`)

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  [Nav Rail]  [Channel List]  [Main Chat Area]          │
│  ┌─────┐    ┌──────────┐    ┌─────────────────────┐   │
│  │Icons│    │ Search   │    │ Channel Header      │   │
│  │     │    │ Filters  │    ├─────────────────────┤   │
│  │ 🏠  │    │          │    │                     │   │
│  │ 💬  │    │ Projects │    │   Messages          │   │
│  │ 👥  │    │  - Item  │    │   Thread            │   │
│  │ 📅  │    │  - Item  │    │                     │   │
│  │ 📞  │    │  - Item  │    │                     │   │
│  │ 📄  │    │          │    ├─────────────────────┤   │
│  │     │    │          │    │ Compose Area        │   │
│  │ ⚙️  │    │          │    │ [Formatting] [Send] │   │
│  └─────┘    └──────────┘    └─────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Key Features

### 1. **Responsive Design**
- Fixed widths for navigation elements
- Flexible main chat area
- Scrollable sections where needed

### 2. **Interactive Elements**
- Hover effects on all clickable items
- Active state indicators
- Smooth transitions
- Focus states for accessibility

### 3. **Visual Hierarchy**
- Clear separation between sections
- Consistent spacing and padding
- Typography hierarchy (headings, body, captions)
- Badge system for notifications

### 4. **User Experience**
- Search and filter functionality
- Keyboard shortcuts (Enter to send)
- Tooltips on icon buttons
- Loading and empty states

## Usage

### Dashboard Page
```typescript
import { TeamsNavRail } from '@/components/TeamsNavRail';
import { TeamsChannelList } from '@/components/TeamsChannelList';
import { TeamsHeader } from '@/components/TeamsHeader';
import { TeamsChatArea } from '@/components/TeamsChatArea';

export default function DashboardPage() {
  const [selectedProject, setSelectedProject] = useState('1');
  
  return (
    <div className="flex h-screen bg-[#f5f5f5] overflow-hidden">
      <TeamsNavRail />
      <TeamsChannelList {...props} />
      <div className="flex-1 flex flex-col bg-white">
        <TeamsHeader {...props} />
        <TeamsChatArea {...props} />
      </div>
    </div>
  );
}
```

## Customization

### Changing Colors
Edit the component files to change:
- Background colors in className props
- Gradient definitions in getAvatarColor functions
- Border colors

### Adding New Navigation Items
Edit `TeamsNavRail.tsx` and add to the `navItems` array:
```typescript
{ id: 'newItem', icon: IconComponent, label: 'New Item' }
```

### Modifying Project Cards
Edit `TeamsChannelList.tsx` to customize:
- Avatar generation logic
- Information displayed
- Card layout

## Future Enhancements
- Dark mode support
- Customizable themes
- More formatting options in compose area
- File upload functionality
- Emoji picker
- Message reactions
- Threading support
- Video/audio call integration

