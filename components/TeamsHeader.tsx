'use client';

import { useState, useRef, useEffect } from 'react';
import { Video, Phone, UserPlus, MoreHorizontal, LogOut, Settings, User, HelpCircle } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { UserMenuDropdown } from './UserMenuDropdown';

interface TeamsHeaderProps {
  channelName: string;
  membersCount: number;
}

export function TeamsHeader({ channelName, membersCount }: TeamsHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    try {
      setIsDropdownOpen(false);
      await logout();
      // The logout function in authContext already handles redirect
      // but we can add additional navigation if needed
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4">
      {/* Left: Channel Info */}
      <div className="flex items-center gap-2">
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
        
        {/* More Options Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`p-2 hover:bg-gray-100 rounded transition-colors ${isDropdownOpen ? 'bg-gray-100' : ''}`}
            title="More options"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              {/* User Info Section */}
              {user && (
                <>
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                        {user.name?.substring(0, 2).toUpperCase() || 'DA'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.username || user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Menu Items */}
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  router.push('/settings');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-500" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  // Add profile navigation if needed
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 text-gray-500" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  // Add help navigation if needed
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-gray-500" />
                <span>Help & Support</span>
              </button>

              {/* Divider */}
              <div className="my-1 border-t border-gray-100" />

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
        
        {/* User Avatar with Dropdown */}
        <div className="ml-2">
          <UserMenuDropdown />
        </div>
      </div>
    </div>
  );
}

