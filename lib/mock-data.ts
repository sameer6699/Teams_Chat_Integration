import { Chat, Message, User, Project, Notification } from './types';

export const currentUser: User = {
  id: 'current-user',
  name: 'You',
  email: 'you@example.com',
  status: 'online',
};

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Nora',
    email: 'nora@example.com',
    status: 'online',
  },
  {
    id: '2',
    name: 'Priya',
    email: 'priya@example.com',
    status: 'online',
  },
  {
    id: '3',
    name: 'Jon',
    email: 'jon@example.com',
    status: 'online',
  },
  {
    id: '4',
    name: 'Sarah',
    email: 'sarah@example.com',
    status: 'online',
  },
];

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Meld-Ep Redesign',
    status: 'In Progress',
    client: 'Acme Corp',
    detail: 'Last activity 2m ago',
    unreadCount: 3,
    tag: 'Active',
    isSelected: true,
  },
  {
    id: '2',
    name: 'API Migration',
    status: 'Review',
    owner: 'DevOps',
    detail: 'Mention from Priya',
    unreadCount: 1,
    tag: 'Review',
  },
  {
    id: '3',
    name: 'Mobile Alpha',
    status: 'Planning',
    eta: 'Oct 12',
    detail: 'No new messages',
    unreadCount: 0,
    tag: 'Planning',
  },
  {
    id: '4',
    name: 'Data Sync',
    status: 'Active',
    team: 'Data',
    detail: '3 unread since yesterday',
    unreadCount: 5,
    tag: 'Active',
  },
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    text: '@You mentioned in API Migration',
    unreadCount: 1,
  },
  {
    id: '2',
    text: 'Data Sync has 5 new msgs',
    unreadCount: 5,
  },
];

export const mockChats: Chat[] = [
  {
    id: '1',
    name: 'John Doe',
    lastMessage: 'See you tomorrow!',
    time: '10:24 AM',
    unreadCount: 2,
    participants: [mockUsers[0]],
  },
  {
    id: '2',
    name: 'Jane Smith',
    lastMessage: 'Thanks for the update',
    time: '9:45 AM',
    unreadCount: 0,
    participants: [mockUsers[1]],
  },
  {
    id: '3',
    name: 'Mike Johnson',
    lastMessage: 'Can we schedule a meeting?',
    time: 'Yesterday',
    unreadCount: 1,
    participants: [mockUsers[2]],
  },
  {
    id: '4',
    name: 'Sarah Williams',
    lastMessage: 'Great work on the project!',
    time: 'Yesterday',
    unreadCount: 0,
    participants: [mockUsers[3]],
  },
  {
    id: '5',
    name: 'David Brown',
    lastMessage: 'Let me know when you are free',
    time: '2 days ago',
    unreadCount: 0,
    participants: [mockUsers[4]],
  },
  {
    id: '6',
    name: 'Marketing Team',
    lastMessage: 'John: Campaign launch next week',
    time: '3 days ago',
    unreadCount: 5,
    participants: [mockUsers[0], mockUsers[1], mockUsers[3]],
  },
];

export const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: 'm1',
      text: 'Morning! Kicked off the header refactor. See ticket #ME-214.',
      timestamp: '09:12',
      isSender: false,
      sender: mockUsers[0], // Nora
    },
    {
      id: 'm2',
      text: 'I pushed the Teams connector patch. Chats should sync both ways now.',
      timestamp: '09:18',
      isSender: false,
      sender: mockUsers[1], // Priya
    },
    {
      id: 'm3',
      text: 'Great. Can we confirm webhook retries are idempotent?',
      timestamp: '09:20',
      isSender: true,
    },
    {
      id: 'm4',
      text: 'Yes. Added request UUID to ensure safe replays from Teams.',
      timestamp: '09:23',
      isSender: false,
      sender: mockUsers[2], // Jon
    },
  ],
};
