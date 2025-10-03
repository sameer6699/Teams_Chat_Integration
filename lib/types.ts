export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
}

export interface Project {
  id: string;
  name: string;
  status: string;
  client?: string;
  owner?: string;
  team?: string;
  eta?: string;
  detail: string;
  unreadCount: number;
  tag: string;
  isSelected?: boolean;
}

export interface Notification {
  id: string;
  text: string;
  unreadCount: number;
}

export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar?: string;
  unreadCount?: number;
  participants?: User[];
}

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  isSender: boolean;
  sender?: User;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  sound: boolean;
}
