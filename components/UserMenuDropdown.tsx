'use client';

import { useState, useRef, useEffect } from 'react';
import { LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';

export function UserMenuDropdown() {
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
      // Note: logout() now handles the redirect internally, so router.push is not needed
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium transition-all hover:ring-2 hover:ring-indigo-300 ${isDropdownOpen ? 'ring-2 ring-indigo-400' : ''}`}
        title={user.name || 'User menu'}
      >
        {user.name?.substring(0, 2).toUpperCase() || 'DA'}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-base font-bold shadow-md">
                {user.name?.substring(0, 2).toUpperCase() || 'DA'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user.username || user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                // Add profile navigation if needed
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              <User className="w-4 h-4" />
              <div className="flex-1 text-left">
                <div className="font-medium">My Profile</div>
                <div className="text-xs text-gray-500">View and edit profile</div>
              </div>
            </button>

            <button
              onClick={() => {
                setIsDropdownOpen(false);
                router.push('/settings');
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <div className="flex-1 text-left">
                <div className="font-medium">Settings</div>
                <div className="text-xs text-gray-500">Preferences and privacy</div>
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="my-1 border-t border-gray-200" />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

