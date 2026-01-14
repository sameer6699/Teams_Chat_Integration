'use client';

import { Video, Phone, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { UserMenuDropdown } from './UserMenuDropdown';

interface TeamsHeaderProps {
  channelName: string;
  membersCount: number;
}

// Helper function to get initials from a name
const getInitials = (name: string): string => {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    // Single word - take first 2 characters
    return name.substring(0, 2).toUpperCase();
  }
  // Multiple words - take first letter of first two words
  return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
};

export function TeamsHeader({ channelName, membersCount }: TeamsHeaderProps) {
  // Get initials from channel name
  const initials = getInitials(channelName);
  
  return (
    <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4">
      {/* Left: Channel Info */}
      <div className="flex items-center gap-2">
        {/* Channel Avatar with Initials */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
          {initials}
        </div>
        <h1 className="text-base font-semibold text-gray-900">{channelName}</h1>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">{membersCount} online</span>
          <div className="flex -space-x-1 ml-2">
            {['N', 'P', 'J', 'S'].map((initial, idx) => (
              <div
                key={idx}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
              >
                {initial}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Video call">
          <Video className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Audio call">
          <Phone className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Add members">
          <UserPlus className="w-5 h-5 text-gray-600" />
        </button>
        
        {/* User Avatar with Dropdown */}
        <div className="ml-2">
          <UserMenuDropdown />
        </div>
      </div>
    </div>
  );
}

